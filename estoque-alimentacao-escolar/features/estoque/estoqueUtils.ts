import { Produto } from "@/types/produto";
import {
  EstoqueResumoProduto,
  LoteEstoque,
  LoteEstoqueFormValues,
  OrigemEstoque,
  StatusValidade,
} from "@/types/estoque";

export const origemEstoqueLabels: Record<OrigemEstoque, string> = {
  rancho: "Rancho",
  ajuste: "Ajuste",
  doacao: "Doação",
  outro: "Outro",
};

export const statusValidadeLabels: Record<StatusValidade, string> = {
  vencido: "Vencido",
  critico: "Crítico",
  atencao: "Atenção",
  ok: "OK",
  sem_validade: "Sem validade",
};

export function getHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function formatarData(dataISO?: string) {
  if (!dataISO) {
    return "-";
  }

  return new Date(`${dataISO}T00:00:00`).toLocaleDateString("pt-BR");
}

export function calcularDiasAteValidade(dataValidade?: string) {
  if (!dataValidade) {
    return null;
  }

  const hoje = new Date(`${getHojeISO()}T00:00:00`);
  const validade = new Date(`${dataValidade}T00:00:00`);
  const diferencaMs = validade.getTime() - hoje.getTime();

  return Math.ceil(diferencaMs / 86_400_000);
}

export function getStatusValidade(dataValidade?: string): StatusValidade {
  const dias = calcularDiasAteValidade(dataValidade);

  if (dias === null) {
    return "sem_validade";
  }

  if (dias < 0) {
    return "vencido";
  }

  if (dias <= 15) {
    return "critico";
  }

  if (dias <= 45) {
    return "atencao";
  }

  return "ok";
}

export function getStatusValidadeColor(
  status: StatusValidade
): "error" | "warning" | "success" | "default" {
  if (status === "vencido" || status === "critico") {
    return "error";
  }

  if (status === "atencao") {
    return "warning";
  }

  if (status === "ok") {
    return "success";
  }

  return "default";
}

export function criarLoteEstoque(values: LoteEstoqueFormValues): LoteEstoque {
  const agora = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    produtoId: values.produtoId,
    quantidadeInicial: values.quantidadeInicial,
    quantidadeAtual: values.quantidadeAtual,
    dataRecebimento: values.dataRecebimento,
    dataValidade: values.dataValidade,
    origem: values.origem,
    observacao: values.observacao.trim(),
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

export function atualizarLoteEstoque(
  loteAtual: LoteEstoque,
  values: LoteEstoqueFormValues
): LoteEstoque {
  return {
    ...loteAtual,
    produtoId: values.produtoId,
    quantidadeInicial: values.quantidadeInicial,
    quantidadeAtual: values.quantidadeAtual,
    dataRecebimento: values.dataRecebimento,
    dataValidade: values.dataValidade,
    origem: values.origem,
    observacao: values.observacao.trim(),
    atualizadoEm: new Date().toISOString(),
  };
}

export function loteParaFormValues(lote: LoteEstoque): LoteEstoqueFormValues {
  return {
    produtoId: lote.produtoId,
    quantidadeInicial: lote.quantidadeInicial,
    quantidadeAtual: lote.quantidadeAtual,
    dataRecebimento: lote.dataRecebimento,
    dataValidade: lote.dataValidade,
    origem: lote.origem,
    observacao: lote.observacao ?? "",
  };
}

export function getLoteDefaultValues(): LoteEstoqueFormValues {
  return {
    produtoId: "",
    quantidadeInicial: 1,
    quantidadeAtual: 1,
    dataRecebimento: getHojeISO(),
    dataValidade: "",
    origem: "rancho",
    observacao: "",
  };
}

export function getProdutoNome(produtos: Produto[], produtoId: string) {
  return produtos.find((produto) => produto.id === produtoId)?.nome ?? "Produto não encontrado";
}

export function calcularResumoEstoquePorProduto(
  produtos: Produto[],
  lotes: LoteEstoque[]
): EstoqueResumoProduto[] {
  return produtos
    .filter((produto) => produto.ativo)
    .map((produto) => {
      const lotesDoProduto = lotes.filter(
        (lote) => lote.produtoId === produto.id && lote.quantidadeAtual > 0
      );

      const quantidadeTotal = lotesDoProduto.reduce(
        (total, lote) => total + lote.quantidadeAtual,
        0
      );

      const validadeMaisProxima = lotesDoProduto
        .map((lote) => lote.dataValidade)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))[0];

      return {
        produtoId: produto.id,
        produtoNome: produto.nome,
        unidade: produto.unidade,
        quantidadeTotal,
        validadeMaisProxima,
        statusValidade: getStatusValidade(validadeMaisProxima),
        quantidadeLotes: lotesDoProduto.length,
      };
    })
    .filter((resumo) => resumo.quantidadeTotal > 0)
    .sort((a, b) => a.produtoNome.localeCompare(b.produtoNome));
}