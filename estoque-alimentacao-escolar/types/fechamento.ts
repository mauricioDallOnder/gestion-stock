export const mesesFechamento = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type MesFechamento = (typeof mesesFechamento)[number];

export type StatusFechamento = "Brouillon" | "Clôturé" | "Rouvert";

export type StatusLinhaFechamento =
  | "ok"
  | "Incohérent"
  | "Stock_faible"
  | "Sans_consommation";

export type LinhaFechamentoMensal = {
  id: string;
  produtoId: string;
  produtoNome: string;
  unidade: string;
  estoqueMinimo: number;

  estoqueAnterior: number;
  quantidadeRecebida: number;
  estoqueAtualContado: number;
  quantidadeConsumida: number;

  validadeMaisProxima?: string;
  status: StatusLinhaFechamento;
  observacao: string;
};

export type FechamentoMensal = {
  id: string;
  ano: number;
  mes: MesFechamento;
  status: StatusFechamento;
  linhas: LinhaFechamentoMensal[];
  criadoEm: string;
  atualizadoEm: string;
  fechadoEm?: string;
};