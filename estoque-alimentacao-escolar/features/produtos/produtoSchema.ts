import { z } from "zod";
import { categoriasProduto, unidadesProduto } from "@/types/produto";

export const produtoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),

  unidade: z.enum(unidadesProduto),

  categoria: z.enum(categoriasProduto),

  estoqueMinimo: z.coerce
    .number()
    .min(0, "O estoque mínimo não pode ser negativo.")
    .max(999999, "Valor muito alto."),

  ativo: z.boolean(),
});

export type ProdutoSchemaInput = z.infer<typeof produtoSchema>;