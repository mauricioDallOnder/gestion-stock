"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
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
import { LotStock } from "@/types/estoque";
import { Produit } from "@/types/produto";
import {
  calculerJoursJusquaValidite,
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
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6">Aucun lot trouvé</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Enregistrez une réception ou ajustez les filtres.
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
            const statut = getStatutValidite(lot.dateValidite);
            const jours = calculerJoursJusquaValidite(lot.dateValidite);

            return (
              <TableRow key={lot.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>
                    {getNomProduit(produits, lot.produitId)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lot.id}
                  </Typography>
                </TableCell>

                <TableCell>{origineStockLabels[lot.origine]}</TableCell>

                <TableCell align="right">{lot.quantiteInitiale}</TableCell>

                <TableCell align="right">
                  <Typography sx={{ fontWeight: 700 }}>
                    {lot.quantiteActuelle}
                  </Typography>
                </TableCell>

                <TableCell>{formaterDate(lot.dateReception)}</TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography>{formaterDate(lot.dateValidite)}</Typography>
                    {jours !== null ? (
                      <Typography variant="caption" color="text.secondary">
                        {jours < 0
                          ? `Expiré depuis ${Math.abs(jours)} jour(s)`
                          : `Expire dans ${jours} jour(s)`}
                      </Typography>
                    ) : null}
                  </Stack>
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
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Tooltip title="Modifier le lot">
                      <IconButton onClick={() => onEdit(lot)} size="small">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer le lot">
                      <IconButton
                        onClick={() => onDelete(lot.id)}
                        size="small"
                        color="error"
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
