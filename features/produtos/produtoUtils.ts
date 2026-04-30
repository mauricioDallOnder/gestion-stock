import {
  CategorieProduit,
  Produit,
  ProduitFormValues,
  UniteProduit,
} from "@/types/produto";

// ─── Labels d'affichage ────────────────────────────────────────────────────────
export const uniteProduitLabels: Record<UniteProduit, string> = {
  kg: "Kg",
  g: "Grammes",
  l: "Litres",
  ml: "Millilitres",
  un: "Unité",
  paquet: "Paquet",
  boite: "Boîte",
  conserve: "Conserve",
  bouteille: "Bouteille",
};

export const categorieProduitLabels: Record<CategorieProduit, string> = {
  cereales: "Céréales",
  legumineuses: "Légumineuses",
  proteines: "Protéines",
  produits_laitiers: "Produits laitiers",
  boissons: "Boissons",
  condiments: "Condiments",
  autres: "Autres",
};

// ─── Création d'un produit ─────────────────────────────────────────────────────
export function creerProduit(values: ProduitFormValues): Produit {
  const maintenant = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    nom: values.nom.trim(),
    unite: values.unite,
    categorie: values.categorie,
    stockMinimum: values.stockMinimum,
    actif: values.actif,
    dateCreation: maintenant,
    dateMiseAJour: maintenant,
  };
}

// ─── Mise à jour d'un produit ──────────────────────────────────────────────────
export function mettreAJourProduit(
  produitActuel: Produit,
  values: ProduitFormValues
): Produit {
  return {
    ...produitActuel,
    nom: values.nom.trim(),
    unite: values.unite,
    categorie: values.categorie,
    stockMinimum: values.stockMinimum,
    actif: values.actif,
    dateMiseAJour: new Date().toISOString(),
  };
}

// ─── Conversion entité → valeurs du formulaire ─────────────────────────────────
export function produitVersFormValues(produit: Produit): ProduitFormValues {
  return {
    nom: produit.nom,
    unite: produit.unite,
    categorie: produit.categorie,
    stockMinimum: produit.stockMinimum,
    actif: produit.actif,
  };
}

// ─── Valeurs par défaut du formulaire ──────────────────────────────────────────
export function getProduitDefaultValues(): ProduitFormValues {
  return {
    nom: "",
    unite: "paquet",
    categorie: "autres",
    stockMinimum: 0,
    actif: true,
  };
}
