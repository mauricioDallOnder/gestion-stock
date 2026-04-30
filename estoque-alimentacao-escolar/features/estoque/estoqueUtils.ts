import { Produto } from "@/types/produto";
import {
  EstoqueResumoProduto,
  LoteEstoque,
  LoteEstoqueFormValues,
  OrigemEstoque,
  StatusValidade,
} from "@/types/estoque";

export const origineStockLabels: Record<OrigemEstoque, string> = {
  ferme: "Ferme",
  ajustement: "Ajustement",
  don: "Don",
  autre: "Autre",
};

export const statusValiditeLabels: Record<StatusValidade, string> = {
  expire: "Expiré",
  critique: "Critique",
  attention: "Attention",
  ok: "OK",
  sans_validite: "Sans date de péremption",
};

export function getAujourdHuiISO() {
  const aujourdHui = new Date();
  const annee = aujourdHui.getFullYear();
  const mois = String(aujourdHui.getMonth() + 1).padStart(2, "0");
  const jour = String(aujourdHui.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

export function formaterDate(dataISO?: string) {
  if (!dataISO) {
    return "-";
  }

  return new Date(`${dataISO}T00:00:00`).toLocaleDateString("fr-FR");
}

export function calculerJoursJusquaValidite(dataValidite?: string) {
  if (!dataValidite) {
    return null;
  }

  const aujourdHui = new Date(`${getAujourdHuiISO()}T00:00:00`);
  const validite = new Date(`${dataValidite}T00:00:00`);
  const differenceMs = validite.getTime() - aujourdHui.getTime();

  return Math.ceil(differenceMs / 86_400_000);
}

export function getStatusValidite(dataValidite?: string): StatusValidade {
  const jours = calculerJoursJusquaValidite(dataValidite);

  if (jours === null) {
    return "sans_validite";
  }

  if (jours < 0) {
    return "expire";
  }

  if (jours <= 15) {
    return "critique";
  }

  if (jours <= 45) {
    return "attention";
  }

  return "ok";
}

export function getStatusValiditeColor(
  status: StatusValidade
): "error" | "warning" | "success" | "default" {
  if (status === "expire" || status === "critique") {
    return "error";
  }

  if (status === "attention") {
    return "warning";
  }

  if (status === "ok") {
    return "success";
  }

  return "default";
}

export function creerLotStock(values: LoteEstoqueFormValues): LoteEstoque {
  const maintenant = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    produtoId: values.produtoId,
    quantidadeInicial: values.quantidadeInicial,
    quantidadeAtual: values.quantidadeAtual,
    dataRecebimento: values.dataRecebimento,
    dataValidade: values.dataValidade,
    origem: values.origem,
    observacao: values.observacao.trim(),
    criadoEm: maintenant,
    atualizadoEm: maintenant,
  };
}

export function mettreAJourLotStock(
  lotActuel: LoteEstoque,
  values: LoteEstoqueFormValues
): LoteEstoque {
  return {
    ...lotActuel,
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

export function lotVersFormValues(lot: LoteEstoque): LoteEstoqueFormValues {
  return {
    produtoId: lot.produtoId,
    quantidadeInicial: lot.quantidadeInicial,
    quantidadeAtual: lot.quantidadeAtual,
    dataRecebimento: lot.dataRecebimento,
    dataValidade: lot.dataValidade,
    origem: lot.origem,
    observacao: lot.observacao ?? "",
  };
}

export function getLotDefaultValues(): LoteEstoqueFormValues {
  return {
    produtoId: "",
    quantidadeInicial: 1,
    quantidadeAtual: 1,
    dataRecebimento: getAujourdHuiISO(),
    dataValidade: "",
    origem: "ferme",
    observacao: "",
  };
}

export function getNomProduit(produits: Produto[], produtoId: string) {
  return produits.find((produit) => produit.id === produtoId)?.nome ?? "Produit introuvable";
}

export function calculerResumeStockParProduit(
  produits: Produto[],
  lots: LoteEstoque[]
): EstoqueResumoProduto[] {
  return produits
    .filter((produit) => produit.ativo)
    .map((produit) => {
      const lotsDuProduit = lots.filter(
        (lot) => lot.produtoId === produit.id && lot.quantidadeAtual > 0
      );

      const quantiteTotale = lotsDuProduit.reduce(
        (total, lot) => total + lot.quantidadeAtual,
        0
      );

      const validiteLaPlusProche = lotsDuProduit
        .map((lot) => lot.dataValidade)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))[0];

      return {
        produtoId: produit.id,
        produtoNome: produit.nome,
        unidade: produit.unidade,
        quantidadeTotal: quantiteTotale,
        validadeMaisProxima: validiteLaPlusProche,
        statusValidade: getStatusValidite(validiteLaPlusProche),
        quantidadeLotes: lotsDuProduit.length,
      };
    })
    .filter((resume) => resume.quantidadeTotal > 0)
    .sort((a, b) => a.produtoNome.localeCompare(b.produtoNome));
}