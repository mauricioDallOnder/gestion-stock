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
  formatarData,
  getStatusValidadeColor,
  statusValidadeLabels,
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
        <Typography variant="h6">Nenhum produto com estoque atual</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          O resumo aparecerá quando houver lotes com quantidade atual maior que
          zero.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell align="right">Quantidade total</TableCell>
            <TableCell align="right">Lotes</TableCell>
            <TableCell>Validade mais próxima</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {resumo.map((item) => (
            <TableRow key={item.produtoId} hover>
              <TableCell>
                <Typography sx={{fontWeight:"700"}}>{item.produtoNome}</Typography>
              </TableCell>

              <TableCell align="right">
                <Typography sx={{fontWeight:"700"}}>
                  {item.quantidadeTotal} {item.unidade}
                </Typography>
              </TableCell>

              <TableCell align="right">{item.quantidadeLotes}</TableCell>

              <TableCell>{formatarData(item.validadeMaisProxima)}</TableCell>

              <TableCell>
                <Chip
                  label={statusValidadeLabels[item.statusValidade]}
                  color={getStatusValidadeColor(item.statusValidade)}
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