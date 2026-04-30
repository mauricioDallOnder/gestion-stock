"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
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
import { Produto, ProdutoFormValues } from "@/types/produto";
import { ProdutoFormDialog } from "./ProdutoFormDialog";
import { ProdutosTable } from "./ProdutosTable";
import { produtoParaFormValues } from "./produtoUtils";
import { useAppContext } from "@/context/AppContext";

type StatusFiltro = "todos" | "ativos" | "inativos";

export function ProdutosPage() {
  const {
    produtos,
    adicionarProduto,
    editarProduto,
    toggleAtivoProduto,
    deletarProduto,
  } = useAppContext();

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);

  const produtosFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();
    return produtos.filter((produto) => {
      const correspondeBusca = produto.nome
        .toLowerCase()
        .includes(buscaNormalizada);
      const correspondeStatus =
        statusFiltro === "todos" ||
        (statusFiltro === "ativos" && produto.ativo) ||
        (statusFiltro === "inativos" && !produto.ativo);
      return correspondeBusca && correspondeStatus;
    });
  }, [busca, produtos, statusFiltro]);

  const totalAtivos = produtos.filter((p) => p.ativo).length;
  const totalInativos = produtos.filter((p) => !p.ativo).length;

  function handleNovoProduto() {
    setProdutoEmEdicao(null);
    setDialogOpen(true);
  }

  function handleEditarProduto(produto: Produto) {
    setProdutoEmEdicao(produto);
    setDialogOpen(true);
  }

  function handleFecharDialog() {
    setDialogOpen(false);
    setProdutoEmEdicao(null);
  }

  function handleSalvarProduto(values: ProdutoFormValues) {
    if (produtoEmEdicao) {
      editarProduto(produtoEmEdicao.id, values);
    } else {
      adicionarProduto(values);
    }
    handleFecharDialog();
  }

  function handleDeleteProduto(produtoId: string) {
    const produto = produtos.find((item) => item.id === produtoId);
    if (!produto) return;
    const confirmou = window.confirm(
      `Deseja realmente excluir o produto "${produto.nome}"?`
    );
    if (!confirmou) return;
    deletarProduto(produtoId);
  }

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Cadastro dos gêneros alimentícios usados no controle de estoque, recebimentos e fechamento mensal."
      />

      <Stack
       sx={{direction:"row",alignItems:"center",justifyContent:"space-between",mb:"3"}} spacing={2} useFlexGap
       
      >
        <Stack sx={{direction:"row",flexWrap:"wrap"}} spacing={1} useFlexGap >
          <Chip label={`${produtos.length} produtos cadastrados`} />
          <Chip label={`${totalAtivos} ativos`} color="success" />
          <Chip label={`${totalInativos} inativos`} variant="outlined" />
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNovoProduto}
        >
          Novo produto
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <TextField
              label="Buscar produto"
              placeholder="Exemplo: arroz, feijão, leite..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value as StatusFiltro)}
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ativos">Apenas ativos</MenuItem>
              <MenuItem value="inativos">Apenas inativos</MenuItem>
            </TextField>
          </Stack>

          <ProdutosTable
            produtos={produtosFiltrados}
            onEdit={handleEditarProduto}
            onToggleAtivo={toggleAtivoProduto}
            onDelete={handleDeleteProduto}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Os dados são salvos automaticamente no navegador via localStorage.
              Eles persistem entre sessões até que o cache seja limpo.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <ProdutoFormDialog
        open={dialogOpen}
        mode={produtoEmEdicao ? "edit" : "create"}
        initialValues={
          produtoEmEdicao ? produtoParaFormValues(produtoEmEdicao) : undefined
        }
        onClose={handleFecharDialog}
        onSubmit={handleSalvarProduto}
      />
    </>
  );
}
