"use client";

import { useEffect, useMemo, useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/ui/PageHeader";
import { lotesEstoqueMock } from "@/features/estoque/estoqueMock";
import { produtosMock } from "@/features/produtos/produtosMock";
import {
  LinhaFechamentoMensal,
  MesFechamento,
  mesesFechamento,
  StatusFechamento,
} from "@/types/fechamento";
import { FechamentoMensalTable } from "./FechamentoMensalTable";
import { FechamentoResumoCards } from "./FechamentoResumoCards";
import {
  calcularTotaisFechamento,
  gerarLinhasFechamento,
  mesesLabels,
  recalcularLinhaFechamento,
} from "./fechamentoUtils";

export function FechamentoMensalPage() {
  const [ano, setAno] = useState(2026);
  const [mes, setMes] = useState<MesFechamento>(3);
  const [status, setStatus] = useState<StatusFechamento>("rascunho");
  const [fechadoEm, setFechadoEm] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaFechamentoMensal[]>([]);

  const fechado = status === "fechado";

  useEffect(() => {
    const linhasGeradas = gerarLinhasFechamento({
      produtos: produtosMock,
      lotes: lotesEstoqueMock,
      ano,
      mes,
    });

    setLinhas(linhasGeradas);
    setStatus("rascunho");
    setFechadoEm(null);
  }, [ano, mes]);

  const totais = useMemo(() => {
    return calcularTotaisFechamento(linhas);
  }, [linhas]);

  function handleChangeEstoqueAtual(linhaId: string, value: number) {
    setLinhas((current) =>
      current.map((linha) => {
        if (linha.id !== linhaId) {
          return linha;
        }

        return recalcularLinhaFechamento({
          ...linha,
          estoqueAtualContado: Number.isNaN(value) ? 0 : value,
        });
      })
    );
  }

  function handleChangeObservacao(linhaId: string, value: string) {
    setLinhas((current) =>
      current.map((linha) =>
        linha.id === linhaId
          ? {
              ...linha,
              observacao: value,
            }
          : linha
      )
    );
  }

  function handleRegenerarLinhas() {
    const confirmou = window.confirm(
      "Deseja regenerar as linhas do fechamento? Alterações manuais de contagem e observação serão perdidas."
    );

    if (!confirmou) {
      return;
    }

    const linhasGeradas = gerarLinhasFechamento({
      produtos: produtosMock,
      lotes: lotesEstoqueMock,
      ano,
      mes,
    });

    setLinhas(linhasGeradas);
    setStatus("rascunho");
    setFechadoEm(null);
  }

  function handleFecharMes() {
    if (totais.totalInconsistencias > 0) {
      window.alert(
        "Não é possível fechar o mês enquanto houver linhas inconsistentes."
      );
      return;
    }

    const confirmou = window.confirm(
      `Deseja fechar o mês de ${mesesLabels[mes]}/${ano}? Após o fechamento, a edição será bloqueada.`
    );

    if (!confirmou) {
      return;
    }

    setStatus("fechado");
    setFechadoEm(new Date().toISOString());
  }

  function handleReabrirMes() {
    const confirmou = window.confirm(
      "Deseja reabrir este fechamento para edição?"
    );

    if (!confirmou) {
      return;
    }

    setStatus("reaberto");
    setFechadoEm(null);
  }

  return (
    <>
      <PageHeader
        title="Fechamento mensal"
        description="Cálculo mensal de estoque anterior, recebimentos, estoque atual contado e consumo dos gêneros alimentícios."
      />

      <FechamentoResumoCards linhas={linhas} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                label="Mês"
                value={mes}
                disabled={fechado}
                onChange={(event) =>
                  setMes(Number(event.target.value) as MesFechamento)
                }
                sx={{ minWidth: { xs: "100%", md: 220 } }}
              >
                {mesesFechamento.map((mesItem) => (
                  <MenuItem key={mesItem} value={mesItem}>
                    {mesesLabels[mesItem]}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ano"
                type="number"
                value={ano}
                disabled={fechado}
                onChange={(event) => setAno(Number(event.target.value))}
                sx={{ minWidth: { xs: "100%", md: 140 } }}
                slotProps={{
                  htmlInput: {
                    min: 2020,
                    max: 2100,
                  },
                }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              <Chip
                label={
                  status === "fechado"
                    ? "Fechado"
                    : status === "reaberto"
                      ? "Reaberto"
                      : "Rascunho"
                }
                color={status === "fechado" ? "success" : "default"}
              />

              <Chip
                label={`${totais.totalInconsistencias} inconsistência(s)`}
                color={totais.totalInconsistencias > 0 ? "error" : "success"}
                variant={
                  totais.totalInconsistencias > 0 ? "filled" : "outlined"
                }
              />

              <Chip
                label={`${totais.totalEstoqueBaixo} estoque baixo`}
                color={totais.totalEstoqueBaixo > 0 ? "warning" : "default"}
                variant="outlined"
              />
            </Stack>
          </Stack>

          {fechadoEm ? (
            <Alert severity="success" sx={{ mt: 3 }}>
              Fechamento encerrado em{" "}
              {new Date(fechadoEm).toLocaleString("pt-BR")}.
            </Alert>
          ) : null}

          {totais.totalInconsistencias > 0 ? (
            <Alert severity="error" sx={{ mt: 3 }}>
              Existem linhas com consumo negativo. Isso normalmente significa
              que o estoque contado é maior do que o estoque anterior somado aos
              recebimentos do mês.
            </Alert>
          ) : null}

          {!fechado && totais.totalInconsistencias === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
              O fechamento pode ser encerrado. Após fechar, os campos de
              contagem e observação ficarão bloqueados.
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h6">
                Relatório de {mesesLabels[mes]}/{ano}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Confira a contagem física antes de fechar o mês.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              {!fechado ? (
                <Button
                  variant="outlined"
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={handleRegenerarLinhas}
                >
                  Regenerar linhas
                </Button>
              ) : null}

              {fechado ? (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<LockOpenOutlinedIcon />}
                  onClick={handleReabrirMes}
                >
                  Reabrir mês
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<LockOutlinedIcon />}
                  onClick={handleFecharMes}
                >
                  Fechar mês
                </Button>
              )}

              <Button variant="outlined" startIcon={<SaveOutlinedIcon />} disabled>
                Salvar rascunho
              </Button>
            </Stack>
          </Stack>

          <FechamentoMensalTable
            linhas={linhas}
            fechado={fechado}
            onChangeEstoqueAtual={handleChangeEstoqueAtual}
            onChangeObservacao={handleChangeObservacao}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Nesta versão, o fechamento ainda não é salvo em banco de dados. A
              próxima etapa será gerar o relatório oficial em PDF/HTML ou
              primeiro centralizar os dados em um contexto compartilhado.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}