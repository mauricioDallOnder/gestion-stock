"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/ui/PageHeader";
import { produtosMock } from "@/features/produtos/produtosMock";
import { LoteEstoque, LoteEstoqueFormValues } from "@/types/estoque";
import {
  atualizarLoteEstoque,
  calcularResumoEstoquePorProduto,
  criarLoteEstoque,
  getProdutoNome,
  getStatusValidade,
  loteParaFormValues,
} from "./estoqueUtils";
import { lotesEstoqueMock } from "./estoqueMock";
import { LoteEstoqueFormDialog } from "./LoteEstoqueFormDialog";
import { LotesEstoqueTable } from "./LotesEstoqueTable";
import { EstoqueResumoTable } from "./EstoqueResumoTable";

type EstoqueTab = "resumo" | "lotes";
type FiltroValidade = "todos" | "vencidos" | "alertas" | "ok";

export function EstoquePage() {
  const [lotes, setLotes] = useState<LoteEstoque[]>(lotesEstoqueMock);
  const [tab, setTab] = useState<EstoqueTab>("resumo");
  const [busca, setBusca] = useState("");
  const [filtroValidade, setFiltroValidade] =
    useState<FiltroValidade>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loteEmEdicao, setLoteEmEdicao] = useState<LoteEstoque | null>(null);

  const produtos = produtosMock;

  const resumo = useMemo(() => {
    return calcularResumoEstoquePorProduto(produtos, lotes);
  }, [lotes, produtos]);

  const lotesFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();

    return lotes
      .filter((lote) => {
        const produtoNome = getProdutoNome(produtos, lote.produtoId).toLowerCase();

        const correspondeBusca = produtoNome.includes(buscaNormalizada);

        const status = getStatusValidade(lote.dataValidade);

        const correspondeValidade =
          filtroValidade === "todos" ||
          (filtroValidade === "vencidos" && status === "vencido") ||
          (filtroValidade === "alertas" &&
            ["critico", "atencao"].includes(status)) ||
          (filtroValidade === "ok" && status === "ok");

        return correspondeBusca && correspondeValidade;
      })
      .sort((a, b) => a.dataValidade.localeCompare(b.dataValidade));
  }, [busca, filtroValidade, lotes, produtos]);

  const totalLotes = lotes.length;

  const totalProdutosComEstoque = resumo.length;

  const totalAlertas = lotes.filter((lote) => {
    const status = getStatusValidade(lote.dataValidade);
    return status === "critico" || status === "atencao";
  }).length;

  const totalVencidos = lotes.filter(
    (lote) => getStatusValidade(lote.dataValidade) === "vencido"
  ).length;

  function handleNovoLote() {
    setLoteEmEdicao(null);
    setDialogOpen(true);
  }

  function handleEditarLote(lote: LoteEstoque) {
    setLoteEmEdicao(lote);
    setDialogOpen(true);
  }

  function handleFecharDialog() {
    setDialogOpen(false);
    setLoteEmEdicao(null);
  }

  function handleSalvarLote(values: LoteEstoqueFormValues) {
    if (loteEmEdicao) {
      setLotes((current) =>
        current.map((lote) =>
          lote.id === loteEmEdicao.id
            ? atualizarLoteEstoque(lote, values)
            : lote
        )
      );
    } else {
      setLotes((current) => [criarLoteEstoque(values), ...current]);
    }

    handleFecharDialog();
  }

  function handleDeleteLote(loteId: string) {
    const lote = lotes.find((item) => item.id === loteId);

    if (!lote) {
      return;
    }

    const produtoNome = getProdutoNome(produtos, lote.produtoId);

    const confirmou = window.confirm(
      `Deseja realmente excluir o lote de "${produtoNome}"?`
    );

    if (!confirmou) {
      return;
    }

    setLotes((current) => current.filter((item) => item.id !== loteId));
  }

  return (
    <>
      <PageHeader
        title="Estoque"
        description="Controle de recebimentos, lotes, saldos atuais e prazos de validade dos gêneros alimentícios."
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack sx={{direction:"row",alignItems:"center"}}spacing={2} >
                <Inventory2OutlinedIcon color="primary" />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Produtos com estoque
                  </Typography>

                  <Typography variant="h5">{totalProdutosComEstoque}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack sx={{direction:"row",alignItems:"center"}}spacing={2}>
                <Inventory2OutlinedIcon color="primary" />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Lotes cadastrados
                  </Typography>

                  <Typography variant="h5">{totalLotes}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack sx={{direction:"row",alignItems:"center"}}spacing={2}>
                <WarningAmberOutlinedIcon color="warning" />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Alertas de validade
                  </Typography>

                  <Typography variant="h5">{totalAlertas}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack sx={{direction:"row",alignItems:"center"}}spacing={2}>
                <ErrorOutlineOutlinedIcon color="error" />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Lotes vencidos
                  </Typography>

                  <Typography variant="h5">{totalVencidos}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack
      sx={{direction:"row",alignItems:"center",md:"3", justifyContent:"space-between"}}spacing={2}
        
       
        
       
      >
        <Stack sx={{direction:"row",flexWrap:"wrap"}}spacing={1}  useFlexGap>
          <Chip label={`${totalLotes} lotes`} />
          <Chip label={`${totalAlertas} alertas`} color="warning" />
          <Chip label={`${totalVencidos} vencidos`} color="error" />
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNovoLote}
        >
          Novo recebimento
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(_, value: EstoqueTab) => setTab(value)}
            sx={{ mb: 3 }}
          >
            <Tab value="resumo" label="Resumo por produto" />
            <Tab value="lotes" label="Lotes e validades" />
          </Tabs>

          {tab === "resumo" ? (
            <EstoqueResumoTable resumo={resumo} />
          ) : (
            <>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <TextField
                  label="Buscar produto"
                  placeholder="Exemplo: arroz, feijão, leite..."
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  fullWidth
                />

                <TextField
                  select
                  label="Validade"
                  value={filtroValidade}
                  onChange={(event) =>
                    setFiltroValidade(event.target.value as FiltroValidade)
                  }
                  sx={{ minWidth: { xs: "100%", md: 240 } }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="vencidos">Vencidos</MenuItem>
                  <MenuItem value="alertas">Crítico / atenção</MenuItem>
                  <MenuItem value="ok">OK</MenuItem>
                </TextField>
              </Stack>

              <LotesEstoqueTable
                lotes={lotesFiltrados}
                produtos={produtos}
                onEdit={handleEditarLote}
                onDelete={handleDeleteLote}
              />
            </>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Nesta versão demonstrativa, os lotes ficam apenas na memória do
              navegador. Ao atualizar a página, os dados voltam ao estado
              inicial. Depois conectaremos isso ao banco de dados.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <LoteEstoqueFormDialog
        open={dialogOpen}
        mode={loteEmEdicao ? "edit" : "create"}
        produtos={produtos}
        initialValues={
          loteEmEdicao ? loteParaFormValues(loteEmEdicao) : undefined
        }
        onClose={handleFecharDialog}
        onSubmit={handleSalvarLote}
      />
    </>
  );
}