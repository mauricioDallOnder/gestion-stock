"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
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

// ─── Clés du localStorage ──────────────────────────────────────────────────────
const STORAGE_KEYS = {
  produits: "stock_ecole:produits",
  lots: "stock_ecole:lots",
  clotures: "stock_ecole:clotures",
} as const;

// ─── Helpers de persistance ────────────────────────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore les erreurs de quota
  }
}

// ─── Type du contexte ──────────────────────────────────────────────────────────
export type AppContextValue = {
  // Produits
  produits: Produit[];
  ajouterProduit: (values: ProduitFormValues) => void;
  modifierProduit: (id: string, values: ProduitFormValues) => void;
  basculerActifProduit: (id: string) => void;
  supprimerProduit: (id: string) => void;

  // Lots de stock
  lots: LotStock[];
  ajouterLot: (values: LotStockFormValues) => void;
  modifierLot: (id: string, values: LotStockFormValues) => void;
  supprimerLot: (id: string) => void;

  // Clôtures mensuelles
  clotures: ClotureMensuelle[];
  getCloture: (annee: number, mois: MoisCloture) => ClotureMensuelle | undefined;
  initierOuChargerCloture: (annee: number, mois: MoisCloture) => ClotureMensuelle;
  enregistrerBrouillonCloture: (cloture: ClotureMensuelle) => void;
  modifierLigneCloture: (
    clotureId: string,
    ligneId: string,
    champ: "stockActuelCompte" | "observation",
    valeur: number | string
  ) => void;
  cloturerMois: (clotureId: string) => void;
  rouvrirMois: (clotureId: string) => void;
  regenererLignes: (clotureId: string) => void;
};

// ─── Création du contexte ──────────────────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext doit être utilisé dans AppProvider");
  }
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [produits, setProduits] = useState<Produit[]>(() =>
    loadFromStorage(STORAGE_KEYS.produits, produitsMock)
  );

  const [lots, setLots] = useState<LotStock[]>(() =>
    loadFromStorage(STORAGE_KEYS.lots, lotsStockMock)
  );

  const [clotures, setClotures] = useState<ClotureMensuelle[]>(() =>
    loadFromStorage(STORAGE_KEYS.clotures, [])
  );

  // Persistance automatique dans le localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.produits, produits);
  }, [produits]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.lots, lots);
  }, [lots]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.clotures, clotures);
  }, [clotures]);

  // ─── Produits ──────────────────────────────────────────────────────────────
  const ajouterProduit = useCallback((values: ProduitFormValues) => {
    setProduits((cur) => [creerProduit(values), ...cur]);
  }, []);

  const modifierProduit = useCallback(
    (id: string, values: ProduitFormValues) => {
      setProduits((cur) =>
        cur.map((p) => (p.id === id ? mettreAJourProduit(p, values) : p))
      );
    },
    []
  );

  const basculerActifProduit = useCallback((id: string) => {
    setProduits((cur) =>
      cur.map((p) =>
        p.id === id
          ? { ...p, actif: !p.actif, dateMiseAJour: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const supprimerProduit = useCallback((id: string) => {
    setProduits((cur) => cur.filter((p) => p.id !== id));
  }, []);

  // ─── Lots ──────────────────────────────────────────────────────────────────
  const ajouterLot = useCallback((values: LotStockFormValues) => {
    setLots((cur) => [creerLotStock(values), ...cur]);
  }, []);

  const modifierLot = useCallback(
    (id: string, values: LotStockFormValues) => {
      setLots((cur) =>
        cur.map((l) => (l.id === id ? mettreAJourLotStock(l, values) : l))
      );
    },
    []
  );

  const supprimerLot = useCallback((id: string) => {
    setLots((cur) => cur.filter((l) => l.id !== id));
  }, []);

  // ─── Clôtures ──────────────────────────────────────────────────────────────
  const getCloture = useCallback(
    (annee: number, mois: MoisCloture) =>
      clotures.find((c) => c.annee === annee && c.mois === mois),
    [clotures]
  );

  const initierOuChargerCloture = useCallback(
    (annee: number, mois: MoisCloture): ClotureMensuelle => {
      const existante = clotures.find(
        (c) => c.annee === annee && c.mois === mois
      );
      if (existante) return existante;

      const lignes = genererLignesCloture({
        produits,
        lots,
        annee,
        mois,
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

      setClotures((cur) => [...cur, nouvelle]);
      return nouvelle;
    },
    [clotures, lots, produits]
  );

  const enregistrerBrouillonCloture = useCallback(
    (cloture: ClotureMensuelle) => {
      const miseAJour: ClotureMensuelle = {
        ...cloture,
        statut: "brouillon",
        dateMiseAJour: new Date().toISOString(),
      };
      setClotures((cur) =>
        cur.map((c) => (c.id === cloture.id ? miseAJour : c))
      );
    },
    []
  );

  const modifierLigneCloture = useCallback(
    (
      clotureId: string,
      ligneId: string,
      champ: "stockActuelCompte" | "observation",
      valeur: number | string
    ) => {
      setClotures((cur) =>
        cur.map((c) => {
          if (c.id !== clotureId) return c;

          const lignesMisesAJour = c.lignes.map((ligne) => {
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

          return {
            ...c,
            lignes: lignesMisesAJour,
            dateMiseAJour: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const cloturerMois = useCallback((clotureId: string) => {
    setClotures((cur) =>
      cur.map((c) =>
        c.id === clotureId
          ? {
              ...c,
              statut: "cloture" as StatutCloture,
              dateCloture: new Date().toISOString(),
              dateMiseAJour: new Date().toISOString(),
            }
          : c
      )
    );
  }, []);

  const rouvrirMois = useCallback((clotureId: string) => {
    setClotures((cur) =>
      cur.map((c) =>
        c.id === clotureId
          ? {
              ...c,
              statut: "rouvert" as StatutCloture,
              dateCloture: undefined,
              dateMiseAJour: new Date().toISOString(),
            }
          : c
      )
    );
  }, []);

  const regenererLignes = useCallback(
    (clotureId: string) => {
      setClotures((cur) =>
        cur.map((c) => {
          if (c.id !== clotureId) return c;

          const lignes = genererLignesCloture({
            produits,
            lots,
            annee: c.annee,
            mois: c.mois,
          });

          return {
            ...c,
            lignes,
            statut: "brouillon" as StatutCloture,
            dateCloture: undefined,
            dateMiseAJour: new Date().toISOString(),
          };
        })
      );
    },
    [lots, produits]
  );

  const value: AppContextValue = {
    produits,
    ajouterProduit,
    modifierProduit,
    basculerActifProduit,
    supprimerProduit,
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
