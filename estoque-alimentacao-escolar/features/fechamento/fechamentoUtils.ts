import { LoteEstoque } from "@/types/estoque";
import {
  LinhaFechamentoMensal,
  MesFechamento,
  StatusLinhaFechamento,
} from "@/types/fechamento";
import { Produto } from "@/types/produto";

export const mesesLabels: Record<MesFechamento, string> = {
  1: "Janvier",
  2: "Février",
  3: "Mars",
  4: "Avril",
  5: "Mai",
  6: "Juin",
  7: "Juillet",
  8: "Août",
  9: "Septembre",
  10: "Octobre",
  11: "Novembre",
  12: "Décembre",
};

export const statusLinhaLabels: Record<StatusLinhaFechamento, string> = {
  ok: "OK",
  Incohérent: "Incohérent",
  Stock_faible: "Stock_faible",
  Sans_consommation: "Sans_consommation",
};

export function getStatusLinhaColor(
  status: StatusLinhaFechamento
): "success" | "warning" | "error" | "default" {
  if (status === "ok") {
    return "success";
  }

  if (status === "Incohérent") {
    return "error";
  }

  if (status === "Stock_faible") {
    return "warning";
  }

  return "default";
}

export function formatarNumero(valor: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatarData(dataISO?: string) {
  if (!dataISO) {
    return "-";
  }

  return new Date(`${dataISO}T00:00:00`).toLocaleDateString("fr-FR");
}

export function dataEstaNoMes(dataISO: string, ano: number, mes: number) {
  const data = new Date(`${dataISO}T00:00:00`);

  return data.getFullYear() === ano && data.getMonth() + 1 === mes;
}

export function calcularQuantidadeRecebidaNoMes(
  lotes: LoteEstoque[],
  produtoId: string,
  ano: number,
  mes: number
) {
  return lotes
    .filter(
      (lote) =>
        lote.produtoId === produtoId &&
        dataEstaNoMes(lote.dataRecebimento, ano, mes)
    )
    .reduce((total, lote) => total + lote.quantidadeInicial, 0);
}

export function calcularEstoqueAtualPorProduto(
  lotes: LoteEstoque[],
  produtoId: string
) {
  return lotes
    .filter((lote) => lote.produtoId === produtoId)
    .reduce((total, lote) => total + lote.quantidadeAtual, 0);
}

export function getValidadeMaisProxima(
  lotes: LoteEstoque[],
  produtoId: string
) {
  return lotes
    .filter((lote) => lote.produtoId === produtoId && lote.quantidadeAtual > 0)
    .map((lote) => lote.dataValidade)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))[0];
}

export function calcularConsumoMensal(params: {
  estoqueAnterior: number;
  quantidadeRecebida: number;
  estoqueAtualContado: number;
}) {
  return (
    params.estoqueAnterior +
    params.quantidadeRecebida -
    params.estoqueAtualContado
  );
}

export function calcularStatusLinha(params: {
  estoqueMinimo: number;
  estoqueAtualContado: number;
  quantidadeConsumida: number;
}): StatusLinhaFechamento {
  if (params.quantidadeConsumida < 0) {
    return "Incohérent";
  }

  if (params.estoqueAtualContado <= params.estoqueMinimo) {
    return "Stock_faible";
  }

  if (params.quantidadeConsumida === 0) {
    return "Sans_consommation";
  }

  return "ok";
}

export function recalcularLinhaFechamento(
  linha: LinhaFechamentoMensal
): LinhaFechamentoMensal {
  const quantidadeConsumida = calcularConsumoMensal({
    estoqueAnterior: linha.estoqueAnterior,
    quantidadeRecebida: linha.quantidadeRecebida,
    estoqueAtualContado: linha.estoqueAtualContado,
  });

  const status = calcularStatusLinha({
    estoqueMinimo: linha.estoqueMinimo,
    estoqueAtualContado: linha.estoqueAtualContado,
    quantidadeConsumida,
  });

  return {
    ...linha,
    quantidadeConsumida,
    status,
  };
}

export const estoqueAnteriorMock: Record<string, number> = {
  "prod-001": 18,
  "prod-002": 16,
  "prod-003": 4,
  "prod-004": 10,
  "prod-005": 0,
  "prod-006": 2,
};

type GerarLinhasFechamentoParams = {
  produtos: Produto[];
  lotes: LoteEstoque[];
  ano: number;
  mes: MesFechamento;
};

export function gerarLinhasFechamento({
  produtos,
  lotes,
  ano,
  mes,
}: GerarLinhasFechamentoParams): LinhaFechamentoMensal[] {
  return produtos
    .filter((produto) => produto.ativo)
    .map((produto) => {
      const estoqueAnterior = estoqueAnteriorMock[produto.id] ?? 0;

      const quantidadeRecebida = calcularQuantidadeRecebidaNoMes(
        lotes,
        produto.id,
        ano,
        mes
      );

      const estoqueAtualContado = calcularEstoqueAtualPorProduto(
        lotes,
        produto.id
      );

      const validadeMaisProxima = getValidadeMaisProxima(lotes, produto.id);

      const linhaBase: LinhaFechamentoMensal = {
        id: `linha-${ano}-${mes}-${produto.id}`,
        produtoId: produto.id,
        produtoNome: produto.nome,
        unidade: produto.unidade,
        estoqueMinimo: produto.estoqueMinimo,
        estoqueAnterior,
        quantidadeRecebida,
        estoqueAtualContado,
        quantidadeConsumida: 0,
        validadeMaisProxima,
        status: "ok",
        observacao: "",
      };

      return recalcularLinhaFechamento(linhaBase);
    })
    .sort((a, b) => a.produtoNome.localeCompare(b.produtoNome));
}

export function calcularTotaisFechamento(linhas: LinhaFechamentoMensal[]) {
  return {
    totalProdutos: linhas.length,
    totalEstoqueAnterior: linhas.reduce(
      (total, linha) => total + linha.estoqueAnterior,
      0
    ),
    totalRecebido: linhas.reduce(
      (total, linha) => total + linha.quantidadeRecebida,
      0
    ),
    totalEstoqueAtual: linhas.reduce(
      (total, linha) => total + linha.estoqueAtualContado,
      0
    ),
    totalConsumido: linhas.reduce(
      (total, linha) => total + linha.quantidadeConsumida,
      0
    ),
    totalInconsistencias: linhas.filter(
      (linha) => linha.status === "Incohérent"
    ).length,
    totalEstoqueBaixo: linhas.filter(
      (linha) => linha.status === "Stock_faible"
    ).length,
  };
}