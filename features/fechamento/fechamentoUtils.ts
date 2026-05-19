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

export function getStatutLigneColor(
  statut: StatutLigneCloture
): "success" | "warning" | "error" | "default" {
  if (statut === "ok") return "success";
  if (statut === "incoherent") return "error";
  if (statut === "stock_faible") return "warning";
  return "default";
}

export function formaterNombre(valeur: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valeur);
}

export function formaterDate(dateISO?: string): string {
  if (!dateISO) return "-";
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("fr-FR");
}

export function dateEstDansLeMois(
  dateISO: string,
  annee: number,
  mois: number
): boolean {
  const date = new Date(`${dateISO}T00:00:00`);
  return date.getFullYear() === annee && date.getMonth() + 1 === mois;
}

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

export function calculerStockActuelParProduit(
  lots: LotStock[],
  produitId: string
): number {
  return lots
    .filter((lot) => lot.produitId === produitId)
    .reduce((total, lot) => total + lot.quantiteActuelle, 0);
}

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

export function calculerConsommationMensuelle(params: {
  stockAnterieur: number;
  quantiteRecue: number;
  stockActuelCompte: number;
}): number {
  return (
    params.stockAnterieur + params.quantiteRecue - params.stockActuelCompte
  );
}

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

  return { ...ligne, quantiteConsommee, statut };
}

// ─── Bootstrap mock (utilisé si pas de clôture précédente) ─────────────────────
export const stockAnterieurBootstrap: Record<string, number> = {
  "prod-001": 18,
  "prod-002": 16,
  "prod-003": 4,
  "prod-004": 10,
  "prod-005": 0,
  "prod-006": 2,
};

// ─── Génération des lignes de clôture ──────────────────────────────────────────
type GenererLignesClotureParams = {
  produits: Produit[];
  lots: LotStock[];
  annee: number;
  mois: MoisCloture;
  /**
   * Callback pour obtenir le stock anterieur d'un produit.
   * Permet de chaîner avec la clôture du mois précédent.
   * Si non fourni, utilise le mock de bootstrap.
   */
  getStockAnterieur?: (produitId: string) => number;
};

export function genererLignesCloture({
  produits,
  lots,
  annee,
  mois,
  getStockAnterieur,
}: GenererLignesClotureParams): LigneClotureMensuelle[] {
  return produits
    .filter((produit) => produit.actif)
    .map((produit) => {
      // Stock anterieur : callback en priorité, sinon bootstrap, sinon 0
      let stockAnterieur = getStockAnterieur
        ? getStockAnterieur(produit.id)
        : 0;

      if (stockAnterieur === 0 && !getStockAnterieur) {
        stockAnterieur = stockAnterieurBootstrap[produit.id] ?? 0;
      }

      // Si le callback retourne 0 et qu'on n'a aucune clôture précédente,
      // on tombe sur le bootstrap (utile pour la première clôture jamais créée)
      if (stockAnterieur === 0 && getStockAnterieur) {
        const bootstrap = stockAnterieurBootstrap[produit.id];
        if (bootstrap !== undefined) {
          stockAnterieur = bootstrap;
        }
      }

      const quantiteRecue = calculerQuantiteRecueDansLeMois(
        lots,
        produit.id,
        annee,
        mois
      );
      const stockActuelCompte = calculerStockActuelParProduit(lots, produit.id);
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

export function calculerTotauxCloture(lignes: LigneClotureMensuelle[]) {
  return {
    totalProduits: lignes.length,
    totalStockAnterieur: lignes.reduce(
      (total, l) => total + l.stockAnterieur,
      0
    ),
    totalRecu: lignes.reduce((total, l) => total + l.quantiteRecue, 0),
    totalStockActuel: lignes.reduce(
      (total, l) => total + l.stockActuelCompte,
      0
    ),
    totalConsomme: lignes.reduce((total, l) => total + l.quantiteConsommee, 0),
    totalIncoherences: lignes.filter((l) => l.statut === "incoherent").length,
    totalStockFaible: lignes.filter((l) => l.statut === "stock_faible").length,
  };
}