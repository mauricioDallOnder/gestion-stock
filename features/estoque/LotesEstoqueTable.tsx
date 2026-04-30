"use client";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

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

import type { LotStock } from "@/types/estoque";
import type { Produit } from "@/types/produto";

import {
  formaterDate,
  getNomProduit,
  getStatutValidite,
  getStatutValiditeColor,
  origineStockLabels,
  statutValiditeLabels,
} from "./estoqueUtils";

type LotsStockTableProps = {
  lots: LotStock[];
  produits: Produit[];
  onEdit: (lot: LotStock) => void;
  onDelete: (lotId: string) => void;
};

export function LotsStockTable({
  lots,
  produits,
  onEdit,
  onDelete,
}: LotsStockTableProps) {
  if (lots.length === 0) {
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
          Aucun lot trouvé.
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
            <TableCell>Numéro de lot</TableCell>
            <TableCell>Origine</TableCell>
            <TableCell align="right">Reçu</TableCell>
            <TableCell align="right">Actuel</TableCell>
            <TableCell>Réception</TableCell>
            <TableCell>Péremption</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lots.map((lot) => {
            const produit = produits.find((item) => item.id === lot.produitId);
            const statut = getStatutValidite(lot.dateValidite);

            return (
              <TableRow key={lot.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {getNomProduit(produits, lot.produitId)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {lot.numeroLot?.trim() ? lot.numeroLot : "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={origineStockLabels[lot.origine]}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2">
                    {lot.quantiteInitiale} {produit?.unite ?? ""}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>
                    {lot.quantiteActuelle} {produit?.unite ?? ""}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formaterDate(lot.dateReception)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formaterDate(lot.dateValidite)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={statutValiditeLabels[statut]}
                    color={getStatutValiditeColor(statut)}
                    size="small"
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
                        onClick={() => onEdit(lot)}
                        aria-label="Modifier le lot"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Supprimer le lot">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(lot.id)}
                        aria-label="Supprimer le lot"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}