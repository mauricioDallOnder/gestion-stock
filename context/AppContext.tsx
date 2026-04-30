"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { lotsStockMock } from "@/features/estoque/estoqueMock";
import { produitsMock } from "@/features/produtos/produtosMock";

import type { LotStock, LotStockFormValues } from "@/types/estoque";
import type {
  ClotureMensuelle,
  LigneClotureMensuelle,
  MoisCloture,
  StatutCloture,
} from "@/types/fechamento";
import type { Produit, ProduitFormValues } from "@/types/produto";

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
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore les erreurs de quota ou de navigateur.
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [produits, setProduits] = useState<Produit[]>(() =>
    loadFromStorage(STORAGE_KEYS.produits, produitsMock)
  );

  const [lots, setLots] = useState<LotStock[]>(() =>
    loadFromStorage(STORAGE_KEYS.lots, lotsStockMock)
  );

  const [clotures, setClotures] = useState<ClotureMensuelle[]>(() =>
    loadFromStorage(STORAGE_KEYS.clotures, [])
  );

  /*
    Nettoyage automatique de cohérence.

    Problème corrigé:
    - Un lot peut rester dans localStorage avec produitId = "prod-004"
    - Mais le produit "prod-004" peut avoir été supprimé de produits
    - Résultat: dashboard mostra "Produit inconnu"

    Esta rotina remove lotes órfãos e linhas de clôture ligadas a produtos inexistentes.
  */
  useEffect(() => {
    const produitIdsExistants = new Set(
      produits.map((produit) => produit.id)
    );

    setLots((lotsActuels) => {
      const lotsValides = lotsActuels.filter((lot) =>
        produitIdsExistants.has(lot.produitId)
      );

      return lotsValides.length === lotsActuels.length
        ? lotsActuels
        : lotsValides;
    });

    setClotures((cloturesActuelles) => {
      let modifie = false;

      const cloturesNettoyees = cloturesActuelles.map((cloture) => {
        const lignesValides = cloture.lignes.filter((ligne) =>
          produitIdsExistants.has(ligne.produitId)
        );

        if (lignesValides.length === cloture.lignes.length) {
          return cloture;
        }

        modifie = true;

        return {
          ...cloture,
          lignes: lignesValides,
          dateMiseAJour: new Date().toISOString(),
        };
      });

      return modifie ? cloturesNettoyees : cloturesActuelles;
    });
  }, [produits]);

  // ─── Persistance automatique dans le localStorage ────────────────────────────

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.produits, produits);
  }, [produits]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.lots, lots);
  }, [lots]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.clotures, clotures);
  }, [clotures]);

  // ─── Produits ────────────────────────────────────────────────────────────────

  const ajouterProduit = useCallback((values: ProduitFormValues) => {
    setProduits((cur) => [creerProduit(values), ...cur]);
  }, []);

  const modifierProduit = useCallback((id: string, values: ProduitFormValues) => {
    setProduits((cur) =>
      cur.map((produit) =>
        produit.id === id ? mettreAJourProduit(produit, values) : produit
      )
    );
  }, []);

  const basculerActifProduit = useCallback((id: string) => {
    setProduits((cur) =>
      cur.map((produit) =>
        produit.id === id
          ? {
              ...produit,
              actif: !produit.actif,
              dateMiseAJour: new Date().toISOString(),
            }
          : produit
      )
    );
  }, []);

  /*
    Règle de sécurité:
    - Se o produto tem lotes, não apagamos fisicamente.
    - Apenas desativamos o produto para preservar o histórico de stock.
    - Se não tem lotes, pode ser removido.
  */
  const supprimerProduit = useCallback(
    (id: string) => {
      const produitPossedeLots = lots.some((lot) => lot.produitId === id);

      if (produitPossedeLots) {
        setProduits((cur) =>
          cur.map((produit) =>
            produit.id === id
              ? {
                  ...produit,
                  actif: false,
                  dateMiseAJour: new Date().toISOString(),
                }
              : produit
          )
        );

        return;
      }

      setProduits((cur) => cur.filter((produit) => produit.id !== id));

      setClotures((cur) =>
        cur.map((cloture) => ({
          ...cloture,
          lignes: cloture.lignes.filter((ligne) => ligne.produitId !== id),
          dateMiseAJour: new Date().toISOString(),
        }))
      );
    },
    [lots]
  );

  // ─── Lots de stock ───────────────────────────────────────────────────────────

  const ajouterLot = useCallback((values: LotStockFormValues) => {
    setLots((cur) => [creerLotStock(values), ...cur]);
  }, []);

  const modifierLot = useCallback((id: string, values: LotStockFormValues) => {
    setLots((cur) =>
      cur.map((lot) =>
        lot.id === id ? mettreAJourLotStock(lot, values) : lot
      )
    );
  }, []);

  const supprimerLot = useCallback((id: string) => {
    setLots((cur) => cur.filter((lot) => lot.id !== id));
  }, []);

  // ─── Clôtures mensuelles ─────────────────────────────────────────────────────

  const getCloture = useCallback(
    (annee: number, mois: MoisCloture) =>
      clotures.find((cloture) => cloture.annee === annee && cloture.mois === mois),
    [clotures]
  );

  const initierOuChargerCloture = useCallback(
    (annee: number, mois: MoisCloture): ClotureMensuelle => {
      const existante = clotures.find(
        (cloture) => cloture.annee === annee && cloture.mois === mois
      );

      if (existante) return existante;

      const lignes = genererLignesCloture({
        produits,
        lots,
        annee,
        mois,
      });

      const maintenant = new Date().toISOString();

      const nouvelle: ClotureMensuelle = {
        id: crypto.randomUUID(),
        annee,
        mois,
        statut: "brouillon",
        lignes,
        dateCreation: maintenant,
        dateMiseAJour: maintenant,
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
        cur.map((item) => (item.id === cloture.id ? miseAJour : item))
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
        cur.map((cloture) => {
          if (cloture.id !== clotureId) return cloture;

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
                : {
                    ...ligne,
                    observation: String(valeur),
                  };

            return ligneMiseAJour;
          });

          return {
            ...cloture,
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
      cur.map((cloture) =>
        cloture.id === clotureId
          ? {
              ...cloture,
              statut: "cloture" as StatutCloture,
              dateCloture: new Date().toISOString(),
              dateMiseAJour: new Date().toISOString(),
            }
          : cloture
      )
    );
  }, []);

  const rouvrirMois = useCallback((clotureId: string) => {
    setClotures((cur) =>
      cur.map((cloture) =>
        cloture.id === clotureId
          ? {
              ...cloture,
              statut: "rouvert" as StatutCloture,
              dateCloture: undefined,
              dateMiseAJour: new Date().toISOString(),
            }
          : cloture
      )
    );
  }, []);

  const regenererLignes = useCallback(
    (clotureId: string) => {
      setClotures((cur) =>
        cur.map((cloture) => {
          if (cloture.id !== clotureId) return cloture;

          const lignes = genererLignesCloture({
            produits,
            lots,
            annee: cloture.annee,
            mois: cloture.mois,
          });

          return {
            ...cloture,
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

  const value: AppContextValue = useMemo(
  () => ({
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
  }),
  [
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
  ]
);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}