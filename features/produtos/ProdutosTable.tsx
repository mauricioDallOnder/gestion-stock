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
import { Produit } from "@/types/produto";
import {
  categorieProduitLabels,
  uniteProduitLabels,
} from "./produtoUtils";

type ProduitsTableProps = {
  produits: Produit[];
  onEdit: (produit: Produit) => void;
  onToggleActif: (produitId: string) => void;
  onDelete: (produitId: string) => void;
};

export function ProduitsTable({
  produits,
  onEdit,
  onToggleActif,
  onDelete,
}: ProduitsTableProps) {
  if (produits.length === 0) {
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
          {produits.map((produit) => (
            <TableRow key={produit.id} hover>
              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>{produit.nom}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {produit.id}
                </Typography>
              </TableCell>

              <TableCell>{categorieProduitLabels[produit.categorie]}</TableCell>

              <TableCell>{uniteProduitLabels[produit.unite]}</TableCell>

              <TableCell align="right">{produit.stockMinimum}</TableCell>

              <TableCell>
                <Chip
                  label={produit.actif ? "Actif" : "Inactif"}
                  color={produit.actif ? "success" : "default"}
                  size="small"
                  variant={produit.actif ? "filled" : "outlined"}
                />
              </TableCell>

              <TableCell align="right">
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                  <Tooltip title="Modifier le produit">
                    <IconButton onClick={() => onEdit(produit)} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip
                    title={
                      produit.actif
                        ? "Désactiver le produit"
                        : "Activer le produit"
                    }
                  >
                    <IconButton
                      onClick={() => onToggleActif(produit.id)}
                      size="small"
                    >
                      {produit.actif ? (
                        <ToggleOnOutlinedIcon fontSize="small" />
                      ) : (
                        <ToggleOffOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Supprimer le produit">
                    <IconButton
                      onClick={() => onDelete(produit.id)}
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
