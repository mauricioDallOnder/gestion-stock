"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import { Produto } from "@/types/produto";
import {
  categoriaProdutoLabels,
  unidadeProdutoLabels,
} from "./produtoUtils";

type ProdutosTableProps = {
  produtos: Produto[];
  onEdit: (produto: Produto) => void;
  onToggleAtivo: (produtoId: string) => void;
  onDelete: (produtoId: string) => void;
};

export function ProdutosTable({
  produtos,
  onEdit,
  onToggleAtivo,
  onDelete,
}: ProdutosTableProps) {
  if (produtos.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6">Aucun produit trouvé</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Ajustez les filtres ou enregistrez un nouveau produit.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Produit</TableCell>
            <TableCell>Catégorie</TableCell>
            <TableCell>Unité</TableCell>
            <TableCell align="right">Stock minimum</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {produtos.map((produto) => (
            <TableRow key={produto.id} hover>
              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>
                  {produto.nome}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {produto.id}
                </Typography>
              </TableCell>

              <TableCell>{categoriaProdutoLabels[produto.categoria]}</TableCell>

              <TableCell>{unidadeProdutoLabels[produto.unidade]}</TableCell>

              <TableCell align="right">{produto.estoqueMinimo}</TableCell>

              <TableCell>
                <Chip
                  label={produto.ativo ? "Actif" : "Inactif"}
                  color={produto.ativo ? "success" : "default"}
                  size="small"
                  variant={produto.ativo ? "filled" : "outlined"}
                />
              </TableCell>

              <TableCell align="right">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <Tooltip title="Modifier le produit">
                    <IconButton onClick={() => onEdit(produto)} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip
                    title={
                      produto.ativo
                        ? "Désactiver le produit"
                        : "Activer le produit"
                    }
                  >
                    <IconButton
                      onClick={() => onToggleAtivo(produto.id)}
                      size="small"
                    >
                      {produto.ativo ? (
                        <ToggleOnOutlinedIcon fontSize="small" />
                      ) : (
                        <ToggleOffOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Supprimer le produit">
                    <IconButton
                      onClick={() => onDelete(produto.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}