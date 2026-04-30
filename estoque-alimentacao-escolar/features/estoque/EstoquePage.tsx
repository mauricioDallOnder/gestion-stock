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
import { LoteEstoque, LoteEstoqueFormValues } from "@/types/estoque";
import {
  calculerResumeStockParProduit,
  getNomProduit,
  getStatusValidite,
  lotVersFormValues,
} from "./estoqueUtils";
import { LoteEstoqueFormDialog } from "./LoteEstoqueFormDialog";
import { LotesEstoqueTable } from "./LotesEstoqueTable";
import { EstoqueResumoTable } from "./EstoqueResumoTable";
import { useAppContext } from "@/context/AppContext";

type EstoqueTab = "resumo" | "lotes";
type FiltroValidade = "todos" | "vencidos" | "alertas" | "ok";

export function EstoquePage() {
  const { produtos, lotes, adicionarLote, editarLote, deletarLote } =
    useAppContext();

  const [tab, setTab] = useState<EstoqueTab>("resumo");
  const [busca, setBusca] = useState("");
  const [filtroValidade, setFiltroValidade] = useState<FiltroValidade>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loteEmEdicao, setLoteEmEdicao] = useState<LoteEstoque | null>(null);

  const resumo = useMemo(
    () => calculerResumeStockParProduit(produtos, lotes),
    [lotes, produtos]
  );

  const lotesFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();
    return lotes
      .filter((lote) => {
        const produtoNome = getNomProduit(produtos, lote.produtoId).toLowerCase();
        const correspondeBusca = produtoNome.includes(buscaNormalizada);
        const status = getStatusValidite(lote.dataValidade);
        const correspondeValidade =
          filtroValidade === "todos" ||
          (filtroValidade === "vencidos" && status === "expire") ||
          (filtroValidade === "alertas" &&
            ["critique", "attention"].includes(status)) ||
          (filtroValidade === "ok" && status === "ok");
        return correspondeBusca && correspondeValidade;
      })
      .sort((a, b) => a.dataValidade.localeCompare(b.dataValidade));
  }, [busca, filtroValidade, lotes, produtos]);

  const totalProdutosComEstoque = resumo.length;
  const totalLotes = lotes.length;
  const totalAlertas = lotes.filter((lote) => {
    const status = getStatusValidite(lote.dataValidade);
    return status === "critique" || status === "attention";
  }).length;
  const totalVencidos = lotes.filter(
    (lote) => getStatusValidite(lote.dataValidade) === "expire"
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
      editarLote(loteEmEdicao.id, values);
    } else {
      adicionarLote(values);
    }
    handleFecharDialog();
  }

  function handleDeleteLote(loteId: string) {
    const lote = lotes.find((item) => item.id === loteId);
    if (!lote) return;
    const produtoNome = getNomProduit(produtos, lote.produtoId);
    const confirmou = window.confirm(
      `Voulez-vous vraiment supprimer le lot de "${produtoNome}"?`
    );
    if (!confirmou) return;
    deletarLote(loteId);
  }

  return (
    <>
      <PageHeader
        title="Estoque"
        description="Contrôle des réceptions, des lots, des soldes actuels et des dates de péremption des produits alimentaires."
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack sx={{direction:"row",alignItems:"center"}} spacing={2} >
                <Inventory2OutlinedIcon color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Produits en stock
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
              <Stack sx={{direction:"row",alignItems:"center"}} spacing={2}>
                <Inventory2OutlinedIcon color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                   Lots enregistrés
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
              <Stack sx={{direction:"row",alignItems:"center"}} spacing={2}>
                <WarningAmberOutlinedIcon color="warning" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                   alertes d'expiration
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
              <Stack sx={{direction:"row",alignItems:"center"}} spacing={2}>
                <ErrorOutlineOutlinedIcon color="error" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                  Lots expirés
                  </Typography>
                  <Typography variant="h5">{totalVencidos}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack
        sx={{direction:"row",alignItems:"center",justifyContent:"space-between", mb:"3"}} spacing={2}
        
      >
        <Stack sx={{direction:"row",flexWrap:"wrap"}} spacing={1} useFlexGap>
          <Chip label={`${totalLotes} lotes`} />
          <Chip label={`${totalAlertas} alertas`} color="warning" />
          <Chip label={`${totalVencidos} vencidos`} color="error" />
        </Stack>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNovoLote}>
          Nouveau réception
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(_, value: EstoqueTab) => setTab(value)}
            sx={{ mb: 3 }}
          >
            <Tab value="resumo" label="Sommaire par produit" />
            <Tab value="lotes" label="Lots et dates de péremption" />
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
                  label="Rechercher un produit"
                  placeholder="Exemple: riz, poivre, lait..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  fullWidth
                />
                <TextField
                  select
                  label="Date de péremption"
                  value={filtroValidade}
                  onChange={(e) =>
                    setFiltroValidade(e.target.value as FiltroValidade)
                  }
                  sx={{ minWidth: { xs: "100%", md: 240 } }}
                >
                  <MenuItem value="todos">Tous</MenuItem>
                  <MenuItem value="vencidos">Expirés</MenuItem>
                  <MenuItem value="alertas">Critique / Attention</MenuItem>
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
              Données sauvegardées automatiquement dans le navigateur via localStorage.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <LoteEstoqueFormDialog
        open={dialogOpen}
        mode={loteEmEdicao ? "edit" : "create"}
        produtos={produtos}
        initialValues={loteEmEdicao ? lotVersFormValues(loteEmEdicao) : undefined}
        onClose={handleFecharDialog}
        onSubmit={handleSalvarLote}
      />
    </>
  );
}
