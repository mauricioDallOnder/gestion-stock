"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { StockResumeProduit } from "@/types/estoque";
import {
  formaterDate,
  getStatutValiditeColor,
  statutValiditeLabels,
} from "./estoqueUtils";

type StockResumeTableProps = {
  resume: StockResumeProduit[];
};

export function StockResumeTable({ resume }: StockResumeTableProps) {
  if (resume.length === 0) {
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
        <Typography variant="h6">Aucun produit en stock</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Le résumé apparaîtra dès qu'il y aura des lots avec une quantité
          actuelle supérieure à zéro.
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
            <TableCell align="right">Quantité totale</TableCell>
            <TableCell align="right">Lots</TableCell>
            <TableCell>Péremption la plus proche</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {resume.map((item) => (
            <TableRow key={item.produitId} hover>
              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>
                  {item.produitNom}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <Typography sx={{ fontWeight: 700 }}>
                  {item.quantiteTotale} {item.unite}
                </Typography>
              </TableCell>

              <TableCell align="right">{item.nombreLots}</TableCell>

              <TableCell>{formaterDate(item.validitePlusProche)}</TableCell>

              <TableCell>
                <Chip
                  label={statutValiditeLabels[item.statutValidite]}
                  color={getStatutValiditeColor(item.statutValidite)}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
