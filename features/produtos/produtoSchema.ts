import { z } from "zod";
import { categoriesProduit, unitesProduit } from "@/types/produto";

export const produitSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Renseignez au moins 2 caractères.")
    .max(120, "Le nom doit contenir au maximum 120 caractères."),

  unite: z.enum(unitesProduit),

  categorie: z.enum(categoriesProduit),

  stockMinimum: z.coerce
    .number()
    .min(0, "Le stock minimum ne peut pas être négatif.")
    .max(999999, "Valeur trop élevée."),

  actif: z.boolean(),
});

export type ProduitSchemaInput = z.infer<typeof produitSchema>;
