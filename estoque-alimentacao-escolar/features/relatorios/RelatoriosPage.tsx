"use client";

import { useMemo, useState } from "react";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
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
import { MesFechamento, mesesFechamento } from "@/types/fechamento";
import { mesesLabels } from "@/features/fechamento/fechamentoUtils";
import { RelatorioMensalTable } from "./RelatorioMensalTable";
import { useAppContext } from "@/context/AppContext";

export function RelatoriosPage() {
  const { fechamentos } = useAppContext();

  const anoAtual = new Date().getFullYear();
  const mesAtual = (new Date().getMonth() + 1) as MesFechamento;

  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState<MesFechamento>(mesAtual);

  const fechamento = useMemo(
    () => fechamentos.find((f) => f.ano === ano && f.mes === mes),
    [fechamentos, ano, mes]
  );

  // Lista de anos com fechamentos registrados (+ ano atual)
  const anosDisponiveis = useMemo(() => {
    const anos = new Set(fechamentos.map((f) => f.ano));
    anos.add(anoAtual);
    return Array.from(anos).sort((a, b) => b - a);
  }, [fechamentos, anoAtual]);

  function handleImprimir() {
    window.print();
  }

  function handleExportarCSV() {
    if (!fechamento) return;

    const cabecalho = [
      "Produto",
      "Unidade",
      "Estoque anterior",
      "Recebido",
      "Est. contado",
      "Consumido",
      "Validade próxima",
      "Status",
      "Observação",
    ].join(";");

    const linhas = fechamento.linhas.map((linha) =>
      [
        linha.produtoNome,
        linha.unidade,
        linha.estoqueAnterior,
        linha.quantidadeRecebida,
        linha.estoqueAtualContado,
        linha.quantidadeConsumida,
        linha.validadeMaisProxima ?? "",
        linha.status,
        linha.observacao,
      ].join(";")
    );

    const csv = [cabecalho, ...linhas].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fechamento_${mesesLabels[mes].toLowerCase()}_${ano}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Visualize e exporte os relatórios mensais de fechamento do estoque escolar."
      />

      {/* Seletor de período */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
          sx={{direction:"row",alignItems:"center",justifyContent:"space-between"}}

            spacing={2}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Mês"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value) as MesFechamento)}
                sx={{ minWidth: { xs: "100%", sm: 200 } }}
              >
                {mesesFechamento.map((mesItem) => (
                  <MenuItem key={mesItem} value={mesItem}>
                    {mesesLabels[mesItem]}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Ano"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                sx={{ minWidth: { xs: "100%", sm: 140 } }}
              >
                {anosDisponiveis.map((anoItem) => (
                  <MenuItem key={anoItem} value={anoItem}>
                    {anoItem}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {fechamento ? (
                <Chip
                  label={
                    fechamento.status === "Clôturé"
                      ? "Clôturé"
                      : fechamento.status === "Rouvert"
                        ? "Rouvert"
                        : "Brouillon"
                  }
                  color={fechamento.status === "Clôturé" ? "success" : "default"}
                  size="small"
                />
              ) : null}

              <Button
                variant="outlined"
                startIcon={<PrintOutlinedIcon />}
                onClick={handleImprimir}
                disabled={!fechamento}
                size="small"
              >
                Imprimir
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadOutlinedIcon />}
                onClick={handleExportarCSV}
                disabled={!fechamento}
                size="small"
              >
                Exportar CSV
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Conteúdo do relatório */}
      {fechamento ? (
        <Card>
          <CardContent>
            <RelatorioMensalTable fechamento={fechamento} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Alert severity="info">
              Nenhum fechamento encontrado para{" "}
              <strong>
                {mesesLabels[mes]}/{ano}
              </strong>
              . Acesse a página de{" "}
              <strong>Fechamento mensal</strong> para criar e salvar o
              fechamento deste período.
            </Alert>

            {fechamentos.length > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Fechamentos disponíveis:
                </Typography>
                <Stack sx={{direction:"row",flexWrap:"wrap"}} spacing={1} useFlexGap>
                  {fechamentos.map((f) => (
                    <Chip
                      key={f.id}
                      label={`${mesesLabels[f.mes]}/${f.ano}`}
                      variant="outlined"
                      size="small"
                      color={f.status === "Clôturé" ? "success" : "default"}
                      onClick={() => {
                        setAno(f.ano);
                        setMes(f.mes);
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            ) : (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum fechamento salvo ainda. Vá para a página de Fechamento
                  mensal, preencha os dados e clique em "Salvar rascunho" ou
                  "Fechar mês".
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
