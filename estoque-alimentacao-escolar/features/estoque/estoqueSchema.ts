import { z } from "zod";
import { origensEstoque } from "@/types/estoque";

export const loteEstoqueSchema = z
  .object({
    produtoId: z.string().min(1, "Sélectionnez un produit."),

    quantidadeInicial: z.coerce
      .number()
      .positive("La quantité reçue doit être supérieure à zéro.")
      .max(999999, "Quantité trop élevée."),

    quantidadeAtual: z.coerce
      .number()
      .min(0, "La quantité actuelle ne peut pas être négative.")
      .max(999999, "Quantité trop élevée."),

    dataRecebimento: z.string().min(1, "Renseignez la date de réception."),

    dataValidade: z.string().min(1, "Renseignez la date de péremption."),

    origem: z.enum(origensEstoque),

    observacao: z.string().max(300, "L’observation doit contenir au maximum 300 caractères."),
  })
  .refine((data) => data.quantidadeAtual <= data.quantidadeInicial, {
    path: ["quantidadeAtual"],
    message: "La quantité actuelle ne peut pas être supérieure à la quantité reçue.",
  })
  .refine((data) => data.dataValidade >= data.dataRecebimento, {
    path: ["dataValidade"],
    message: "La date de péremption ne peut pas être antérieure à la réception.",
  });

export type LoteEstoqueSchemaInput = z.infer<typeof loteEstoqueSchema>;