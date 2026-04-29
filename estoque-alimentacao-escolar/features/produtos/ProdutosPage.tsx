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
import { produtosMock } from "./produtosMock";
import { ProdutosTable } from "./ProdutosTable";
import {
  atualizarProduto,
  criarProduto,
  produtoParaFormValues,
} from "./produtoUtils";

type StatusFiltro = "todos" | "ativos" | "inativos";

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>(produtosMock);
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

  const totalAtivos = produtos.filter((produto) => produto.ativo).length;
  const totalInativos = produtos.filter((produto) => !produto.ativo).length;

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
      setProdutos((current) =>
        current.map((produto) =>
          produto.id === produtoEmEdicao.id
            ? atualizarProduto(produto, values)
            : produto
        )
      );
    } else {
      setProdutos((current) => [criarProduto(values), ...current]);
    }

    handleFecharDialog();
  }

  function handleToggleAtivo(produtoId: string) {
    setProdutos((current) =>
      current.map((produto) =>
        produto.id === produtoId
          ? {
              ...produto,
              ativo: !produto.ativo,
              atualizadoEm: new Date().toISOString(),
            }
          : produto
      )
    );
  }

  function handleDeleteProduto(produtoId: string) {
    const produto = produtos.find((item) => item.id === produtoId);

    if (!produto) {
      return;
    }

    const confirmou = window.confirm(
      `Deseja realmente excluir o produto "${produto.nome}"?`
    );

    if (!confirmou) {
      return;
    }

    setProdutos((current) => current.filter((item) => item.id !== produtoId));
  }

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Cadastro dos gêneros alimentícios usados no controle de estoque, recebimentos e fechamento mensal."
      />

      <Stack sx={{direction:"column",alignItems:"center",justifyContent:"space-between",mb:"3"}} spacing={1}
       
      >
        <Stack sx={{direction:"row", flexWrap:"wrap"}} spacing={1} useFlexGap>
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
              onChange={(event) => setBusca(event.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Status"
              value={statusFiltro}
              onChange={(event) =>
                setStatusFiltro(event.target.value as StatusFiltro)
              }
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
            onToggleAtivo={handleToggleAtivo}
            onDelete={handleDeleteProduto}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Nesta versão de demonstração, os produtos ficam apenas na memória
              do navegador. Ao atualizar a página, os dados voltam ao estado
              inicial. O banco de dados será conectado depois.
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