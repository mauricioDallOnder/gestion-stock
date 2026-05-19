"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { ensureAuth, getFirebase } from "@/lib/firebase";
import { lotsStockMock } from "@/features/estoque/estoqueMock";
import { produitsMock } from "@/features/produtos/produtosMock";
import { LotStock, LotStockFormValues } from "@/types/estoque";
import {
  ClotureMensuelle,
  LigneClotureMensuelle,
  MoisCloture,
  StatutCloture,
} from "@/types/fechamento";
import { Produit, ProduitFormValues } from "@/types/produto";
import {
  creerLotStock,
  mettreAJourLotStock,
} from "@/features/estoque/estoqueUtils";
import {
  creerProduit,
  mettreAJourProduit,
} from "@/features/produtos/produtoUtils";
import {
  genererLignesCloture,
  recalculerLigneCloture,
} from "@/features/fechamento/fechamentoUtils";

// ─── Type du contexte ─────────────────────────────────────────────────────────
export type AppContextValue = {
  // État de chargement
  isLoading: boolean;
  userId: string | null;

  // Produits
  produits: Produit[];
  ajouterProduit: (values: ProduitFormValues) => Promise<void>;
  modifierProduit: (id: string, values: ProduitFormValues) => Promise<void>;
  basculerActifProduit: (id: string) => Promise<void>;
  supprimerProduit: (id: string) => Promise<void>;
  /** Retourne les dépendances d'un produit (lots actifs, clôtures qui le référencent) */
  getDependancesProduit: (id: string) => { nbLots: number; nbClotures: number };

  // Lots
  lots: LotStock[];
  ajouterLot: (values: LotStockFormValues) => Promise<void>;
  modifierLot: (id: string, values: LotStockFormValues) => Promise<void>;
  supprimerLot: (id: string) => Promise<void>;

  // Clôtures
  clotures: ClotureMensuelle[];
  getCloture: (annee: number, mois: MoisCloture) => ClotureMensuelle | undefined;
  initierOuChargerCloture: (
    annee: number,
    mois: MoisCloture
  ) => Promise<ClotureMensuelle>;
  enregistrerBrouillonCloture: (cloture: ClotureMensuelle) => Promise<void>;
  modifierLigneCloture: (
    clotureId: string,
    ligneId: string,
    champ: "stockActuelCompte" | "observation",
    valeur: number | string
  ) => Promise<void>;
  cloturerMois: (clotureId: string) => Promise<void>;
  rouvrirMois: (clotureId: string) => Promise<void>;
  regenererLignes: (clotureId: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext doit être utilisé dans AppProvider");
  }
  return ctx;
}

// ─── Helpers Firestore ────────────────────────────────────────────────────────
function stripUserId<T extends { userId?: string }>(doc: T): Omit<T, "userId"> {
  const { userId: _, ...rest } = doc;
  return rest;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [produits, setProduits] = useState<Produit[]>([]);
  const [lots, setLots] = useState<LotStock[]>([]);
  const [clotures, setClotures] = useState<ClotureMensuelle[]>([]);

  // ─── Auth + bootstrap initial ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const uid = await ensureAuth();
        if (cancelled) return;
        setUserId(uid);

        // Bootstrap : si l'utilisateur n'a aucun produit, seed avec les mocks
        await seedInitialData(uid);
      } catch (err) {
        console.error("[AppContext] Erreur d'authentification :", err);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Souscriptions Firestore (real-time) ─────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const { db } = getFirebase();
    const unsubs: Array<() => void> = [];

    // Produits
    const produitsQuery = query(
      collection(db, "produits"),
      where("userId", "==", userId)
    );
    unsubs.push(
      onSnapshot(produitsQuery, (snap) => {
        const data = snap.docs.map((d) => stripUserId(d.data() as any) as Produit);
        setProduits(data);
      })
    );

    // Lots
    const lotsQuery = query(
      collection(db, "lots"),
      where("userId", "==", userId)
    );
    unsubs.push(
      onSnapshot(lotsQuery, (snap) => {
        const data = snap.docs.map((d) => stripUserId(d.data() as any) as LotStock);
        setLots(data);
      })
    );

    // Clôtures
    const cloturesQuery = query(
      collection(db, "clotures"),
      where("userId", "==", userId)
    );
    unsubs.push(
      onSnapshot(cloturesQuery, (snap) => {
        const data = snap.docs.map(
          (d) => stripUserId(d.data() as any) as ClotureMensuelle
        );
        setClotures(data);
        setIsLoading(false);
      })
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [userId]);

  // ─── Produits ─────────────────────────────────────────────────────────────
  const ajouterProduit = useCallback(
    async (values: ProduitFormValues) => {
      if (!userId) return;
      const produit = creerProduit(values);
      const { db } = getFirebase();
      await setDoc(doc(db, "produits", produit.id), { ...produit, userId });
    },
    [userId]
  );

  const modifierProduit = useCallback(
    async (id: string, values: ProduitFormValues) => {
      if (!userId) return;
      const actuel = produits.find((p) => p.id === id);
      if (!actuel) return;
      const miseAJour = mettreAJourProduit(actuel, values);
      const { db } = getFirebase();
      await setDoc(doc(db, "produits", id), { ...miseAJour, userId });
    },
    [userId, produits]
  );

  const basculerActifProduit = useCallback(
    async (id: string) => {
      if (!userId) return;
      const produit = produits.find((p) => p.id === id);
      if (!produit) return;
      const { db } = getFirebase();
      await updateDoc(doc(db, "produits", id), {
        actif: !produit.actif,
        dateMiseAJour: new Date().toISOString(),
      });
    },
    [userId, produits]
  );

  const supprimerProduit = useCallback(
    async (id: string) => {
      const { db } = getFirebase();
      await deleteDoc(doc(db, "produits", id));
    },
    []
  );

  const getDependancesProduit = useCallback(
    (id: string) => {
      const nbLots = lots.filter(
        (l) => l.produitId === id && l.quantiteActuelle > 0
      ).length;
      const nbClotures = clotures.filter((c) =>
        c.lignes.some((ligne) => ligne.produitId === id)
      ).length;
      return { nbLots, nbClotures };
    },
    [lots, clotures]
  );

  // ─── Lots ─────────────────────────────────────────────────────────────────
  const ajouterLot = useCallback(
    async (values: LotStockFormValues) => {
      if (!userId) return;
      const lot = creerLotStock(values);
      const { db } = getFirebase();
      await setDoc(doc(db, "lots", lot.id), { ...lot, userId });
    },
    [userId]
  );

  const modifierLot = useCallback(
    async (id: string, values: LotStockFormValues) => {
      if (!userId) return;
      const actuel = lots.find((l) => l.id === id);
      if (!actuel) return;
      const miseAJour = mettreAJourLotStock(actuel, values);
      const { db } = getFirebase();
      await setDoc(doc(db, "lots", id), { ...miseAJour, userId });
    },
    [userId, lots]
  );

  const supprimerLot = useCallback(async (id: string) => {
    const { db } = getFirebase();
    await deleteDoc(doc(db, "lots", id));
  }, []);

  // ─── Clôtures ─────────────────────────────────────────────────────────────
  const getCloture = useCallback(
    (annee: number, mois: MoisCloture) =>
      clotures.find((c) => c.annee === annee && c.mois === mois),
    [clotures]
  );

  /**
   * Calcule le stock anterieur d'un produit pour un mois donné :
   * c'est le stockActuelCompte de la clôture du mois précédent.
   * Si elle n'existe pas, retourne 0.
   */
  const getStockAnterieurDynamique = useCallback(
    (produitId: string, annee: number, mois: MoisCloture): number => {
      let anneePrec = annee;
      let moisPrec = mois - 1;
      if (moisPrec === 0) {
        moisPrec = 12;
        anneePrec = annee - 1;
      }

      const cloturePrecedente = clotures.find(
        (c) => c.annee === anneePrec && c.mois === moisPrec
      );
      if (!cloturePrecedente) return 0;

      const ligne = cloturePrecedente.lignes.find(
        (l) => l.produitId === produitId
      );
      return ligne?.stockActuelCompte ?? 0;
    },
    [clotures]
  );

  const initierOuChargerCloture = useCallback(
    async (annee: number, mois: MoisCloture): Promise<ClotureMensuelle> => {
      if (!userId) throw new Error("Non authentifié");

      const existante = clotures.find(
        (c) => c.annee === annee && c.mois === mois
      );
      if (existante) return existante;

      // Génère les lignes avec stock anterieur DYNAMIQUE
      const lignes = genererLignesCloture({
        produits,
        lots,
        annee,
        mois,
        getStockAnterieur: (produitId) =>
          getStockAnterieurDynamique(produitId, annee, mois),
      });

      const nouvelle: ClotureMensuelle = {
        id: crypto.randomUUID(),
        annee,
        mois,
        statut: "brouillon",
        lignes,
        dateCreation: new Date().toISOString(),
        dateMiseAJour: new Date().toISOString(),
      };

      const { db } = getFirebase();
      await setDoc(doc(db, "clotures", nouvelle.id), {
        ...nouvelle,
        userId,
      });

      return nouvelle;
    },
    [userId, clotures, produits, lots, getStockAnterieurDynamique]
  );

  const enregistrerBrouillonCloture = useCallback(
    async (cloture: ClotureMensuelle) => {
      if (!userId) return;
      const { db } = getFirebase();
      await setDoc(doc(db, "clotures", cloture.id), {
        ...cloture,
        statut: "brouillon" as StatutCloture,
        dateMiseAJour: new Date().toISOString(),
        userId,
      });
    },
    [userId]
  );

  const modifierLigneCloture = useCallback(
    async (
      clotureId: string,
      ligneId: string,
      champ: "stockActuelCompte" | "observation",
      valeur: number | string
    ) => {
      const cloture = clotures.find((c) => c.id === clotureId);
      if (!cloture) return;

      const lignesMisesAJour = cloture.lignes.map((ligne) => {
        if (ligne.id !== ligneId) return ligne;

        const ligneMiseAJour: LigneClotureMensuelle =
          champ === "stockActuelCompte"
            ? recalculerLigneCloture({
                ...ligne,
                stockActuelCompte: Number.isNaN(Number(valeur))
                  ? 0
                  : Number(valeur),
              })
            : { ...ligne, observation: String(valeur) };

        return ligneMiseAJour;
      });

      const { db } = getFirebase();
      await updateDoc(doc(db, "clotures", clotureId), {
        lignes: lignesMisesAJour,
        dateMiseAJour: new Date().toISOString(),
      });
    },
    [clotures]
  );

  const cloturerMois = useCallback(async (clotureId: string) => {
    const { db } = getFirebase();
    await updateDoc(doc(db, "clotures", clotureId), {
      statut: "cloture" as StatutCloture,
      dateCloture: new Date().toISOString(),
      dateMiseAJour: new Date().toISOString(),
    });
  }, []);

  const rouvrirMois = useCallback(async (clotureId: string) => {
    const { db } = getFirebase();
    await updateDoc(doc(db, "clotures", clotureId), {
      statut: "rouvert" as StatutCloture,
      dateCloture: null,
      dateMiseAJour: new Date().toISOString(),
    });
  }, []);

  const regenererLignes = useCallback(
    async (clotureId: string) => {
      const cloture = clotures.find((c) => c.id === clotureId);
      if (!cloture) return;

      const lignes = genererLignesCloture({
        produits,
        lots,
        annee: cloture.annee,
        mois: cloture.mois,
        getStockAnterieur: (produitId) =>
          getStockAnterieurDynamique(produitId, cloture.annee, cloture.mois),
      });

      const { db } = getFirebase();
      await updateDoc(doc(db, "clotures", clotureId), {
        lignes,
        statut: "brouillon" as StatutCloture,
        dateCloture: null,
        dateMiseAJour: new Date().toISOString(),
      });
    },
    [clotures, produits, lots, getStockAnterieurDynamique]
  );

  const value: AppContextValue = {
    isLoading,
    userId,
    produits,
    ajouterProduit,
    modifierProduit,
    basculerActifProduit,
    supprimerProduit,
    getDependancesProduit,
    lots,
    ajouterLot,
    modifierLot,
    supprimerLot,
    clotures,
    getCloture,
    initierOuChargerCloture,
    enregistrerBrouillonCloture,
    modifierLigneCloture,
    cloturerMois,
    rouvrirMois,
    regenererLignes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Bootstrap : seed des mocks lors de la première connexion ────────────────
async function seedInitialData(userId: string): Promise<void> {
  const { db } = getFirebase();

  // On vérifie s'il y a déjà des produits (premier read offline-friendly)
  const produitsQuery = query(
    collection(db, "produits"),
    where("userId", "==", userId)
  );

  return new Promise((resolve) => {
    const unsub = onSnapshot(produitsQuery, async (snap) => {
      unsub();
      if (snap.empty) {
        const batch = writeBatch(db);
        produitsMock.forEach((p) =>
          batch.set(doc(db, "produits", p.id), { ...p, userId })
        );
        lotsStockMock.forEach((l) =>
          batch.set(doc(db, "lots", l.id), { ...l, userId })
        );
        await batch.commit();
      }
      resolve();
    });
  });
}