import { z } from "zod";
import { origensEstoque } from "@/types/estoque";

export const loteEstoqueSchema = z
  .object({
    produtoId: z.string().min(1, "Selecione um produto."),

    quantidadeInicial: z.coerce
      .number()
      .positive("A quantidade recebida deve ser maior que zero.")
      .max(999999, "Quantidade muito alta."),

    quantidadeAtual: z.coerce
      .number()
      .min(0, "A quantidade atual não pode ser negativa.")
      .max(999999, "Quantidade muito alta."),

    dataRecebimento: z.string().min(1, "Informe a data de recebimento."),

    dataValidade: z.string().min(1, "Informe a data de validade."),

    origem: z.enum(origensEstoque),

    observacao: z.string().max(300, "A observação deve ter no máximo 300 caracteres."),
  })
  .refine((data) => data.quantidadeAtual <= data.quantidadeInicial, {
    path: ["quantidadeAtual"],
    message: "A quantidade atual não pode ser maior que a quantidade recebida.",
  })
  .refine((data) => data.dataValidade >= data.dataRecebimento, {
    path: ["dataValidade"],
    message: "A validade não pode ser anterior ao recebimento.",
  });

export type LoteEstoqueSchemaInput = z.infer<typeof loteEstoqueSchema>;