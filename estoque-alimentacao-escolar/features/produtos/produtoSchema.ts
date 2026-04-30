import { z } from "zod";
import { categoriasProduto, unidadesProduto } from "@/types/produto";

export const produitSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Renseignez au moins 2 caractères.")
    .max(120, "Le nom doit contenir au maximum 120 caractères."),

  unidade: z.enum(unidadesProduto),

  categoria: z.enum(categoriasProduto),

  estoqueMinimo: z.coerce
    .number()
    .min(0, "Le stock minimum ne peut pas être négatif.")
    .max(999999, "Valeur trop élevée."),

  ativo: z.boolean(),
});

export type ProduitSchemaInput = z.infer<typeof produitSchema>;