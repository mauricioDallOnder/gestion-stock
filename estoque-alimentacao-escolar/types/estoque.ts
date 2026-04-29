export const origensEstoque = ["rancho", "ajuste", "doacao", "outro"] as const;

export type OrigemEstoque = (typeof origensEstoque)[number];

export type StatusValidade =
  | "vencido"
  | "critico"
  | "atencao"
  | "ok"
  | "sem_validade";

export type LoteEstoque = {
  id: string;
  produtoId: string;
  quantidadeInicial: number;
  quantidadeAtual: number;
  dataRecebimento: string;
  dataValidade: string;
  origem: OrigemEstoque;
  observacao?: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type LoteEstoqueFormValues = {
  produtoId: string;
  quantidadeInicial: number;
  quantidadeAtual: number;
  dataRecebimento: string;
  dataValidade: string;
  origem: OrigemEstoque;
  observacao: string;
};

export type EstoqueResumoProduto = {
  produtoId: string;
  produtoNome: string;
  unidade: string;
  quantidadeTotal: number;
  validadeMaisProxima?: string;
  statusValidade: StatusValidade;
  quantidadeLotes: number;
};