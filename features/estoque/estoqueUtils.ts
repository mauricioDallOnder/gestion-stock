import type { Produit } from "@/types/produto";
import type {
  LotStock,
  LotStockFormValues,
  OrigineStock,
  StatutValidite,
  StockResumeProduit,
} from "@/types/estoque";

// ─── Labels d'affichage ────────────────────────────────────────────────────────
export const origineStockLabels: Record<OrigineStock, string> = {
  ferme: "Ferme",
  ajustement: "Ajustement",
  don: "Don",
  autre: "Autre",
};

export const statutValiditeLabels: Record<StatutValidite, string> = {
  expire: "Expiré",
  critique: "Critique",
  attention: "Attention",
  ok: "OK",
  sans_validite: "Sans date",
};

// ─── Date du jour au format ISO ────────────────────────────────────────────────
export function getAujourdHuiISO(): string {
  const aujourdHui = new Date();
  const annee = aujourdHui.getFullYear();
  const mois = String(aujourdHui.getMonth() + 1).padStart(2, "0");
  const jour = String(aujourdHui.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

// ─── Formatage d'une date ISO en format français ───────────────────────────────
export function formaterDate(dateISO?: string): string {
  if (!dateISO) return "-";
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("fr-FR");
}

// ─── Calcul des jours restants jusqu'à la péremption ───────────────────────────
export function calculerJoursJusquaValidite(
  dateValidite?: string
): number | null {
  if (!dateValidite) return null;

  const aujourdHui = new Date(`${getAujourdHuiISO()}T00:00:00`);
  const validite = new Date(`${dateValidite}T00:00:00`);
  const differenceMs = validite.getTime() - aujourdHui.getTime();

  return Math.ceil(differenceMs / 86_400_000);
}

// ─── Détermination du statut de validité ───────────────────────────────────────
export function getStatutValidite(dateValidite?: string): StatutValidite {
  const jours = calculerJoursJusquaValidite(dateValidite);

  if (jours === null) return "sans_validite";
  if (jours < 0) return "expire";
  if (jours <= 15) return "critique";
  if (jours <= 45) return "attention";

  return "ok";
}

// ─── Couleur MUI associée au statut de validité ────────────────────────────────
export function getStatutValiditeColor(
  statut: StatutValidite
): "error" | "warning" | "success" | "default" {
  if (statut === "expire" || statut === "critique") return "error";
  if (statut === "attention") return "warning";
  if (statut === "ok") return "success";

  return "default";
}

// ─── Création d'un lot de stock ────────────────────────────────────────────────
export function creerLotStock(values: LotStockFormValues): LotStock {
  const maintenant = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    produitId: values.produitId,
    numeroLot: values.numeroLot.trim(),
    quantiteInitiale: values.quantiteInitiale,
    quantiteActuelle: values.quantiteActuelle,
    dateReception: values.dateReception,
    dateValidite: values.dateValidite,
    origine: values.origine,
    observation: values.observation.trim(),
    dateCreation: maintenant,
    dateMiseAJour: maintenant,
  };
}

// ─── Mise à jour d'un lot de stock ─────────────────────────────────────────────
export function mettreAJourLotStock(
  lotActuel: LotStock,
  values: LotStockFormValues
): LotStock {
  return {
    ...lotActuel,
    produitId: values.produitId,
    numeroLot: values.numeroLot.trim(),
    quantiteInitiale: values.quantiteInitiale,
    quantiteActuelle: values.quantiteActuelle,
    dateReception: values.dateReception,
    dateValidite: values.dateValidite,
    origine: values.origine,
    observation: values.observation.trim(),
    dateMiseAJour: new Date().toISOString(),
  };
}

// ─── Conversion entité → valeurs du formulaire ─────────────────────────────────
export function lotVersFormValues(lot: LotStock): LotStockFormValues {
  return {
    produitId: lot.produitId,
    numeroLot: lot.numeroLot ?? "",
    quantiteInitiale: lot.quantiteInitiale,
    quantiteActuelle: lot.quantiteActuelle,
    dateReception: lot.dateReception,
    dateValidite: lot.dateValidite,
    origine: lot.origine,
    observation: lot.observation ?? "",
  };
}

// ─── Valeurs par défaut du formulaire ──────────────────────────────────────────
export function getLotDefaultValues(): LotStockFormValues {
  return {
    produitId: "",
    numeroLot: "",
    quantiteInitiale: 1,
    quantiteActuelle: 1,
    dateReception: getAujourdHuiISO(),
    dateValidite: "",
    origine: "ferme",
    observation: "",
  };
}

// ─── Recherche du nom d'un produit par son ID ──────────────────────────────────
export function getNomProduit(produits: Produit[], produitId: string): string {
  return (
    produits.find((produit) => produit.id === produitId)?.nom ??
    "Produit introuvable"
  );
}

// ─── Calcul du résumé de stock par produit ─────────────────────────────────────
export function calculerResumeStockParProduit(
  produits: Produit[],
  lots: LotStock[]
): StockResumeProduit[] {
  return produits
    .filter((produit) => produit.actif)
    .map((produit) => {
      const lotsDuProduit = lots.filter(
        (lot) => lot.produitId === produit.id && lot.quantiteActuelle > 0
      );

      const quantiteTotale = lotsDuProduit.reduce(
        (total, lot) => total + lot.quantiteActuelle,
        0
      );

      const validitePlusProche = lotsDuProduit
        .map((lot) => lot.dateValidite)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))[0];

      return {
        produitId: produit.id,
        produitNom: produit.nom,
        unite: produit.unite,
        quantiteTotale,
        validitePlusProche,
        statutValidite: getStatutValidite(validitePlusProche),
        nombreLots: lotsDuProduit.length,
      };
    })
    .filter((resume) => resume.quantiteTotale > 0)
    .sort((a, b) => a.produitNom.localeCompare(b.produitNom));
}