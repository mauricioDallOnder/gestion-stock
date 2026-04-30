import {
  CategoriaProduto,
  Produto,
  ProdutoFormValues,
  UnidadeProduto,
} from "@/types/produto";

export const unidadeProdutoLabels: Record<UnidadeProduto, string> = {
  kg: "Kg",
  g: "Grammes",
  l: "Litres",
  ml: "Millilitres",
  un: "Unité",
  paquet: "Paquet",
  boîte: "Boîte",
  conserve: "Conserve",
  bouteille: "Bouteille",
};

export const categoriaProdutoLabels: Record<CategoriaProduto, string> = {
  céréales: "Céréales",
  légumineuses: "Légumineuses",
  protéines: "Protéines",
  produits_laitiers: "Produits laitiers",
  boissons: "Boissons",
  condiments: "Condiments",
  autres: "Autres",
};

export function criarProduto(values: ProdutoFormValues): Produto {
  const agora = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    nome: values.nome.trim(),
    unidade: values.unidade,
    categoria: values.categoria,
    estoqueMinimo: values.estoqueMinimo,
    ativo: values.ativo,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

export function atualizarProduto(
  produtoAtual: Produto,
  values: ProdutoFormValues
): Produto {
  return {
    ...produtoAtual,
    nome: values.nome.trim(),
    unidade: values.unidade,
    categoria: values.categoria,
    estoqueMinimo: values.estoqueMinimo,
    ativo: values.ativo,
    atualizadoEm: new Date().toISOString(),
  };
}

export function produtoParaFormValues(produto: Produto): ProdutoFormValues {
  return {
    nome: produto.nome,
    unidade: produto.unidade,
    categoria: produto.categoria,
    estoqueMinimo: produto.estoqueMinimo,
    ativo: produto.ativo,
  };
}

export function getProdutoDefaultValues(): ProdutoFormValues {
  return {
    nome: "",
    unidade: "paquet",
    categoria: "autres",
    estoqueMinimo: 0,
    ativo: true,
  };
}