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
import { EstoqueResumoProduto } from "@/types/estoque";
import {
  formaterDate,
  getStatusValiditeColor,
  statusValiditeLabels,
} from "./estoqueUtils";

type EstoqueResumoTableProps = {
  resumo: EstoqueResumoProduto[];
};

export function EstoqueResumoTable({ resumo }: EstoqueResumoTableProps) {
  if (resumo.length === 0) {
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
        <Typography variant="h6">Aucun produit avec stock actuel</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Le résumé apparaîtra lorsqu’il y aura des lots avec une quantité
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
            <TableCell>Date de péremption la plus proche</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {resumo.map((item) => (
            <TableRow key={item.produtoId} hover>
              <TableCell>
                <Typography sx={{ fontWeight: "700" }}>
                  {item.produtoNome}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <Typography sx={{ fontWeight: "700" }}>
                  {item.quantidadeTotal} {item.unidade}
                </Typography>
              </TableCell>

              <TableCell align="right">{item.quantidadeLotes}</TableCell>

              <TableCell>{formaterDate(item.validadeMaisProxima)}</TableCell>

              <TableCell>
                <Chip
                  label={statusValiditeLabels[item.statusValidade]}
                  color={getStatusValiditeColor(item.statusValidade)}
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