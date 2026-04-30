// ─── Mois ──────────────────────────────────────────────────────────────────────
export const moisCloture = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type MoisCloture = (typeof moisCloture)[number];

// ─── Statut de la clôture ──────────────────────────────────────────────────────
export type StatutCloture = "brouillon" | "cloture" | "rouvert";

// ─── Statut de chaque ligne ────────────────────────────────────────────────────
export type StatutLigneCloture =
  | "ok"
  | "incoherent"
  | "stock_faible"
  | "sans_consommation";

// ─── Ligne de clôture mensuelle ────────────────────────────────────────────────
export type LigneClotureMensuelle = {
  id: string;
  produitId: string;
  produitNom: string;
  unite: string;
  stockMinimum: number;

  stockAnterieur: number;
  quantiteRecue: number;
  stockActuelCompte: number;
  quantiteConsommee: number;

  validitePlusProche?: string;
  statut: StatutLigneCloture;
  observation: string;
};

// ─── Clôture mensuelle ─────────────────────────────────────────────────────────
export type ClotureMensuelle = {
  id: string;
  annee: number;
  mois: MoisCloture;
  statut: StatutCloture;
  lignes: LigneClotureMensuelle[];
  dateCreation: string;
  dateMiseAJour: string;
  dateCloture?: string;
};
