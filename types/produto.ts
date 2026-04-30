// ─── Unités ────────────────────────────────────────────────────────────────────
export const unitesProduit = [
  "kg",
  "g",
  "l",
  "ml",
  "un",
  "paquet",
  "boite",
  "conserve",
  "bouteille",
] as const;

export type UniteProduit = (typeof unitesProduit)[number];

// ─── Catégories ────────────────────────────────────────────────────────────────
export const categoriesProduit = [
  "cereales",
  "legumineuses",
  "proteines",
  "produits_laitiers",
  "boissons",
  "condiments",
  "autres",
] as const;

export type CategorieProduit = (typeof categoriesProduit)[number];

// ─── Entité Produit ────────────────────────────────────────────────────────────
export type Produit = {
  id: string;
  nom: string;
  unite: UniteProduit;
  categorie: CategorieProduit;
  stockMinimum: number;
  actif: boolean;
  dateCreation: string;
  dateMiseAJour: string;
};

// ─── Valeurs du formulaire ─────────────────────────────────────────────────────
export type ProduitFormValues = {
  nom: string;
  unite: UniteProduit;
  categorie: CategorieProduit;
  stockMinimum: number;
  actif: boolean;
};
