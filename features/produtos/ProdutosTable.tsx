"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { Produit } from "@/types/produto";

type ProduitsTableProps = {
  produits: Produit[];
  onEdit: (produit: Produit) => void;
  onToggleActif: (produitId: string) => void;
};

export function ProduitsTable({
  produits,
  onEdit,
  onToggleActif,
}: ProduitsTableProps) {
  if (produits.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Aucun produit trouvé.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
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
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {produit.nom}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">{produit.categorie}</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">{produit.unite}</Typography>
              </TableCell>

              <TableCell align="right">
                <Typography variant="body2">
                  {produit.stockMinimum} {produit.unite}
                </Typography>
              </TableCell>

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
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 0.5,
                  }}
                >
                  <Tooltip title="Modifier">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(produit)}
                      aria-label={`Modifier ${produit.nom}`}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={produit.actif ? "Inactiver" : "Réactiver"}>
                    <IconButton
                      size="small"
                      color={produit.actif ? "warning" : "success"}
                      onClick={() => onToggleActif(produit.id)}
                      aria-label={
                        produit.actif
                          ? `Inactiver ${produit.nom}`
                          : `Réactiver ${produit.nom}`
                      }
                    >
                      {produit.actif ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
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
