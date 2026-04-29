export const unidadesProduto = [
  "kg",
  "g",
  "l",
  "ml",
  "un",
  "pct",
  "cx",
  "lata",
  "garrafa",
] as const;

export type UnidadeProduto = (typeof unidadesProduto)[number];

export const categoriasProduto = [
  "cereais",
  "leguminosas",
  "proteinas",
  "laticinios",
  "bebidas",
  "condimentos",
  "outros",
] as const;

export type CategoriaProduto = (typeof categoriasProduto)[number];

export type Produto = {
  id: string;
  nome: string;
  unidade: UnidadeProduto;
  categoria: CategoriaProduto;
  estoqueMinimo: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type ProdutoFormValues = {
  nome: string;
  unidade: UnidadeProduto;
  categoria: CategoriaProduto;
  estoqueMinimo: number;
  ativo: boolean;
};