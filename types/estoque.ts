// ─── Origines du stock ─────────────────────────────────────────────────────────
export const originesStock = ["ferme", "ajustement", "don", "autre"] as const;

export type OrigineStock = (typeof originesStock)[number];

// ─── Statut de validité ────────────────────────────────────────────────────────
export type StatutValidite =
  | "expire"
  | "critique"
  | "attention"
  | "ok"
  | "sans_validite";

// ─── Entité Lot de stock ───────────────────────────────────────────────────────
export type LotStock = {
  id: string;
  produitId: string;
  numeroLot?: string;
  quantiteInitiale: number;
  quantiteActuelle: number;
  dateReception: string;
  dateValidite: string;
  origine: OrigineStock;
  observation?: string;
  dateCreation: string;
  dateMiseAJour: string;
};

// ─── Valeurs du formulaire ─────────────────────────────────────────────────────
export type LotStockFormValues = {
  produitId: string;
  numeroLot: string;
  quantiteInitiale: number;
  quantiteActuelle: number;
  dateReception: string;
  dateValidite: string;
  origine: OrigineStock;
  observation: string;
};

// ─── Résumé de stock par produit ───────────────────────────────────────────────
export type StockResumeProduit = {
  produitId: string;
  produitNom: string;
  unite: string;
  quantiteTotale: number;
  validitePlusProche?: string;
  statutValidite: StatutValidite;
  nombreLots: number;
};