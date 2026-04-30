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
import { FechamentoMensal, MesFechamento, mesesFechamento } from "@/types/fechamento";
import { FechamentoMensalTable } from "./FechamentoMensalTable";
import { FechamentoResumoCards } from "./FechamentoResumoCards";
import { calcularTotaisFechamento, mesesLabels } from "./fechamentoUtils";
import { useAppContext } from "@/context/AppContext";

export function FechamentoMensalPage() {
  const {
    iniciarOuCarregarFechamento,
    salvarRascunhoFechamento,
    atualizarLinhaFechamento,
    fecharMes,
    reabrirMes,
    regenerarLinhas,
  } = useAppContext();

  const anoAtual = new Date().getFullYear();
  const mesAtual = (new Date().getMonth() + 1) as MesFechamento;

  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState<MesFechamento>(mesAtual);
  const [fechamento, setFechamento] = useState<FechamentoMensal | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Carrega ou cria fechamento ao mudar mês/ano
  useEffect(() => {
    const f = iniciarOuCarregarFechamento(ano, mes);
    setFechamento(f);
  }, [ano, mes, iniciarOuCarregarFechamento]);

  // Sincroniza estado local quando o contexto mudar externamente
  const { fechamentos } = useAppContext();
  useEffect(() => {
    if (!fechamento) return;
    const atualizado = fechamentos.find((f) => f.id === fechamento.id);
    if (atualizado) setFechamento(atualizado);
  }, [fechamentos]); // eslint-disable-line react-hooks/exhaustive-deps

  const totais = useMemo(
    () => (fechamento ? calcularTotaisFechamento(fechamento.linhas) : null),
    [fechamento]
  );

  if (!fechamento || !totais) {
    return null;
  }

  const fechado = fechamento.status === "Clôturé";

  function handleChangeEstoqueAtual(linhaId: string, value: number) {
    if (!fechamento) return;
    atualizarLinhaFechamento(fechamento.id, linhaId, "estoqueAtualContado", value);
  }

  function handleChangeObservacao(linhaId: string, value: string) {
    if (!fechamento) return;
    atualizarLinhaFechamento(fechamento.id, linhaId, "observacao", value);
  }

  function handleSalvarRascunho() {
    if (!fechamento) return;
    setSalvando(true);
    salvarRascunhoFechamento(fechamento);
    setTimeout(() => setSalvando(false), 800);
  }

  function handleRegenerarLinhas() {
    if (!fechamento) return;
    const confirmou = window.confirm(
      "Deseja regenerar as linhas do fechamento? Alterações manuais serão perdidas."
    );
    if (!confirmou) return;
    regenerarLinhas(fechamento.id);
  }

  function handleFecharMes() {
    if (!fechamento) return;
    if (totais!.totalInconsistencias > 0) {
      window.alert(
        "Não é possível fechar o mês enquanto houver linhas Incohérents."
      );
      return;
    }
    const confirmou = window.confirm(
      `Deseja fechar o mês de ${mesesLabels[mes]}/${ano}? Após o fechamento, a edição será bloqueada.`
    );
    if (!confirmou) return;
    fecharMes(fechamento.id);
  }

  function handleReabrirMes() {
    if (!fechamento) return;
    const confirmou = window.confirm(
      "Deseja reabrir este fechamento para edição?"
    );
    if (!confirmou) return;
    reabrirMes(fechamento.id);
  }

  return (
    <>
      <PageHeader
        title="Fechamento mensal"
        description="Cálculo mensal de estoque anterior, recebimentos, estoque atual contado e consumo dos gêneros alimentícios."
      />

      <FechamentoResumoCards linhas={fechamento.linhas} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            sx={{direction:"row",alignItems:"center",flexWrap:"wrap",justifyContent:"space-between"}}
       
              spacing={2}
          
              useFlexGap
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                label="Mês"
                value={mes}
                disabled={fechado}
                onChange={(e) => setMes(Number(e.target.value) as MesFechamento)}
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
                onChange={(e) => setAno(Number(e.target.value))}
                sx={{ minWidth: { xs: "100%", md: 140 } }}
                slotProps={{ htmlInput: { min: 2020, max: 2100 } }}
              />
            </Stack>

            <Stack
            sx={{direction:"row",alignItems:"center",flexWrap:"wrap"}}
       
              spacing={1}
          
              useFlexGap
              
            >
              <Chip
                label={
                  fechamento.status === "Clôturé"
                    ? "Clôturé"
                    : fechamento.status === "Rouvert"
                      ? "Rouvert"
                      : "Brouillon" 
                }
                color={fechamento.status === "Clôturé" ? "success" : "default"}
              />
              <Chip
                label={`${totais.totalInconsistencias} inconsistência(s)`}
                color={totais.totalInconsistencias > 0 ? "error" : "success"}
                variant={totais.totalInconsistencias > 0 ? "filled" : "outlined"}
              />
              <Chip
                label={`${totais.totalEstoqueBaixo} estoque baixo`}
                color={totais.totalEstoqueBaixo > 0 ? "warning" : "default"}
                variant="outlined"
              />
            </Stack>
          </Stack>

          {fechamento.fechadoEm ? (
            <Alert severity="success" sx={{ mt: 3 }}>
              Fechamento encerrado em{" "}
              {new Date(fechamento.fechadoEm).toLocaleString("pt-BR")}.
            </Alert>
          ) : null}

          {totais.totalInconsistencias > 0 ? (
            <Alert severity="error" sx={{ mt: 3 }}>
              Existem linhas com consumo negativo. Isso normalmente significa que
              o estoque contado é maior do que o estoque anterior somado aos
              recebimentos do mês.
            </Alert>
          ) : null}

          {!fechado && totais.totalInconsistencias === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
              O fechamento pode ser encerrado. Após fechar, os campos de contagem
              e observação ficarão bloqueados.
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack
            sx={{direction:"row",alignItems:"center",flexWrap:"wrap",justifyContent:"space-between"}}
       
              spacing={3}
          
              
          >
            <Box>
              <Typography variant="h6">
                Relatório de {mesesLabels[mes]}/{ano}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confira a contagem física antes de fechar o mês.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
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

              <Button
                variant="outlined"
                startIcon={<SaveOutlinedIcon />}
                onClick={handleSalvarRascunho}
                disabled={fechado || salvando}
              >
                {salvando ? "Salvando..." : "Salvar rascunho"}
              </Button>
            </Stack>
          </Stack>

          <FechamentoMensalTable
            linhas={fechamento.linhas}
            fechado={fechado}
            onChangeEstoqueAtual={handleChangeEstoqueAtual}
            onChangeObservacao={handleChangeObservacao}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Dados salvos automaticamente no navegador. Use "Salvar rascunho"
              para confirmar alterações antes de fechar o mês.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
