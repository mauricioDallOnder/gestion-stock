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
import { LoteEstoque } from "@/types/estoque";
import { Produto } from "@/types/produto";
import {
  calculerJoursJusquaValidite,
  formaterDate,
  getNomProduit,
  getStatusValidite,
  getStatusValiditeColor,
  origineStockLabels,
  statusValiditeLabels,
} from "./estoqueUtils";

type LotesEstoqueTableProps = {
  lotes: LoteEstoque[];
  produtos: Produto[];
  onEdit: (lote: LoteEstoque) => void;
  onDelete: (loteId: string) => void;
};

export function LotesEstoqueTable({
  lotes,
  produtos,
  onEdit,
  onDelete,
}: LotesEstoqueTableProps) {
  if (lotes.length === 0) {
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
            <TableCell>Date de péremption</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lotes.map((lote) => {
            const status = getStatusValidite(lote.dataValidade);
            const dias = calculerJoursJusquaValidite(lote.dataValidade);

            return (
              <TableRow key={lote.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>
                    {getNomProduit(produtos, lote.produtoId)}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {lote.id}
                  </Typography>
                </TableCell>

                <TableCell>{origineStockLabels[lote.origem]}</TableCell>

                <TableCell align="right">{lote.quantidadeInicial}</TableCell>

                <TableCell align="right">
                  <Typography sx={{ fontWeight: 700 }}>
                    {lote.quantidadeAtual}
                  </Typography>
                </TableCell>

                <TableCell>{formaterDate(lote.dataRecebimento)}</TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography>{formaterDate(lote.dataValidade)}</Typography>

                    {dias !== null ? (
                      <Typography variant="caption" color="text.secondary">
                        {dias < 0
                          ? `Expiré depuis ${Math.abs(dias)} jour(s)`
                          : `Expire dans ${dias} jour(s)`}
                      </Typography>
                    ) : null}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={statusValiditeLabels[status]}
                    color={getStatusValiditeColor(status)}
                    size="small"
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
                    <Tooltip title="Modifier le lot">
                      <IconButton onClick={() => onEdit(lote)} size="small">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Supprimer le lot">
                      <IconButton
                        onClick={() => onDelete(lote.id)}
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