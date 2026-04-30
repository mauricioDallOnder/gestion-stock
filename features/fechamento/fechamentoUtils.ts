import { LotStock } from "@/types/estoque";
import {
  LigneClotureMensuelle,
  MoisCloture,
  StatutCloture,
  StatutLigneCloture,
} from "@/types/fechamento";
import { Produit } from "@/types/produto";

// ─── Labels d'affichage ────────────────────────────────────────────────────────
export const moisLabels: Record<MoisCloture, string> = {
  1: "Janvier",
  2: "Février",
  3: "Mars",
  4: "Avril",
  5: "Mai",
  6: "Juin",
  7: "Juillet",
  8: "Août",
  9: "Septembre",
  10: "Octobre",
  11: "Novembre",
  12: "Décembre",
};

export const statutLigneLabels: Record<StatutLigneCloture, string> = {
  ok: "OK",
  incoherent: "Incohérent",
  stock_faible: "Stock faible",
  sans_consommation: "Sans consommation",
};

export const statutClotureLabels: Record<StatutCloture, string> = {
  brouillon: "Brouillon",
  cloture: "Clôturé",
  rouvert: "Rouvert",
};

// ─── Couleur MUI associée au statut de ligne ───────────────────────────────────
export function getStatutLigneColor(
  statut: StatutLigneCloture
): "success" | "warning" | "error" | "default" {
  if (statut === "ok") return "success";
  if (statut === "incoherent") return "error";
  if (statut === "stock_faible") return "warning";
  return "default";
}

// ─── Formatage des nombres ─────────────────────────────────────────────────────
export function formaterNombre(valeur: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valeur);
}

// ─── Formatage d'une date ISO en format français ───────────────────────────────
export function formaterDate(dateISO?: string): string {
  if (!dateISO) return "-";
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("fr-FR");
}

// ─── Vérifie si une date appartient à un mois/année donné ──────────────────────
export function dateEstDansLeMois(
  dateISO: string,
  annee: number,
  mois: number
): boolean {
  const date = new Date(`${dateISO}T00:00:00`);
  return date.getFullYear() === annee && date.getMonth() + 1 === mois;
}

// ─── Quantité reçue d'un produit dans le mois ──────────────────────────────────
export function calculerQuantiteRecueDansLeMois(
  lots: LotStock[],
  produitId: string,
  annee: number,
  mois: number
): number {
  return lots
    .filter(
      (lot) =>
        lot.produitId === produitId &&
        dateEstDansLeMois(lot.dateReception, annee, mois)
    )
    .reduce((total, lot) => total + lot.quantiteInitiale, 0);
}

// ─── Stock actuel total d'un produit ───────────────────────────────────────────
export function calculerStockActuelParProduit(
  lots: LotStock[],
  produitId: string
): number {
  return lots
    .filter((lot) => lot.produitId === produitId)
    .reduce((total, lot) => total + lot.quantiteActuelle, 0);
}

// ─── Date de péremption la plus proche pour un produit ─────────────────────────
export function getValiditePlusProche(
  lots: LotStock[],
  produitId: string
): string | undefined {
  return lots
    .filter((lot) => lot.produitId === produitId && lot.quantiteActuelle > 0)
    .map((lot) => lot.dateValidite)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))[0];
}

// ─── Calcul de la consommation mensuelle ───────────────────────────────────────
export function calculerConsommationMensuelle(params: {
  stockAnterieur: number;
  quantiteRecue: number;
  stockActuelCompte: number;
}): number {
  return (
    params.stockAnterieur +
    params.quantiteRecue -
    params.stockActuelCompte
  );
}

// ─── Calcul du statut d'une ligne ──────────────────────────────────────────────
export function calculerStatutLigne(params: {
  stockMinimum: number;
  stockActuelCompte: number;
  quantiteConsommee: number;
}): StatutLigneCloture {
  if (params.quantiteConsommee < 0) return "incoherent";
  if (params.stockActuelCompte <= params.stockMinimum) return "stock_faible";
  if (params.quantiteConsommee === 0) return "sans_consommation";
  return "ok";
}

// ─── Recalcul d'une ligne (consommation + statut) ──────────────────────────────
export function recalculerLigneCloture(
  ligne: LigneClotureMensuelle
): LigneClotureMensuelle {
  const quantiteConsommee = calculerConsommationMensuelle({
    stockAnterieur: ligne.stockAnterieur,
    quantiteRecue: ligne.quantiteRecue,
    stockActuelCompte: ligne.stockActuelCompte,
  });

  const statut = calculerStatutLigne({
    stockMinimum: ligne.stockMinimum,
    stockActuelCompte: ligne.stockActuelCompte,
    quantiteConsommee,
  });

  return {
    ...ligne,
    quantiteConsommee,
    statut,
  };
}

// ─── Stocks anteriores fictifs (pour la démo) ──────────────────────────────────
export const stockAnterieurMock: Record<string, number> = {
  "prod-001": 18,
  "prod-002": 16,
  "prod-003": 4,
  "prod-004": 10,
  "prod-005": 0,
  "prod-006": 2,
};

// ─── Génération des lignes de clôture pour un mois donné ───────────────────────
type GenererLignesClotureParams = {
  produits: Produit[];
  lots: LotStock[];
  annee: number;
  mois: MoisCloture;
};

export function genererLignesCloture({
  produits,
  lots,
  annee,
  mois,
}: GenererLignesClotureParams): LigneClotureMensuelle[] {
  return produits
    .filter((produit) => produit.actif)
    .map((produit) => {
      const stockAnterieur = stockAnterieurMock[produit.id] ?? 0;

      const quantiteRecue = calculerQuantiteRecueDansLeMois(
        lots,
        produit.id,
        annee,
        mois
      );

      const stockActuelCompte = calculerStockActuelParProduit(
        lots,
        produit.id
      );

      const validitePlusProche = getValiditePlusProche(lots, produit.id);

      const ligneBase: LigneClotureMensuelle = {
        id: `ligne-${annee}-${mois}-${produit.id}`,
        produitId: produit.id,
        produitNom: produit.nom,
        unite: produit.unite,
        stockMinimum: produit.stockMinimum,
        stockAnterieur,
        quantiteRecue,
        stockActuelCompte,
        quantiteConsommee: 0,
        validitePlusProche,
        statut: "ok",
        observation: "",
      };

      return recalculerLigneCloture(ligneBase);
    })
    .sort((a, b) => a.produitNom.localeCompare(b.produitNom));
}

// ─── Calcul des totaux d'une clôture ───────────────────────────────────────────
export function calculerTotauxCloture(lignes: LigneClotureMensuelle[]) {
  return {
    totalProduits: lignes.length,
    totalStockAnterieur: lignes.reduce(
      (total, ligne) => total + ligne.stockAnterieur,
      0
    ),
    totalRecu: lignes.reduce(
      (total, ligne) => total + ligne.quantiteRecue,
      0
    ),
    totalStockActuel: lignes.reduce(
      (total, ligne) => total + ligne.stockActuelCompte,
      0
    ),
    totalConsomme: lignes.reduce(
      (total, ligne) => total + ligne.quantiteConsommee,
      0
    ),
    totalIncoherences: lignes.filter(
      (ligne) => ligne.statut === "incoherent"
    ).length,
    totalStockFaible: lignes.filter(
      (ligne) => ligne.statut === "stock_faible"
    ).length,
  };
}
