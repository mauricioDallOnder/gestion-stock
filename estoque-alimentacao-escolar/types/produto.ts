export const unidadesProduto = [
  "kg",
  "g",
  "l",
  "ml",
  "un",
  "paquet",
  "boîte",
  "conserve",
  "bouteille",
] as const;

export type UnidadeProduto = (typeof unidadesProduto)[number];

export const categoriasProduto = [
  "céréales",
  "légumineuses",
  "protéines",
  "produits_laitiers",
  "boissons",
  "condiments",
  "autres",
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