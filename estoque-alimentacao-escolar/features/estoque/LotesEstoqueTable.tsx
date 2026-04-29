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

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { LoteEstoque } from "@/types/estoque";
import { Produto } from "@/types/produto";
import {
  calcularDiasAteValidade,
  formatarData,
  getProdutoNome,
  getStatusValidade,
  getStatusValidadeColor,
  origemEstoqueLabels,
  statusValidadeLabels,
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
        <Typography variant="h6">Nenhum lote encontrado</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Cadastre um recebimento ou ajuste os filtros.
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
            <TableCell>Origem</TableCell>
            <TableCell align="right">Recebido</TableCell>
            <TableCell align="right">Atual</TableCell>
            <TableCell>Recebimento</TableCell>
            <TableCell>Validade</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lotes.map((lote) => {
            const status = getStatusValidade(lote.dataValidade);
            const dias = calcularDiasAteValidade(lote.dataValidade);

            return (
              <TableRow key={lote.id} hover>
                <TableCell>
                  <Typography sx={{fontWeight:"700"}}>
                    {getProdutoNome(produtos, lote.produtoId)}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {lote.id}
                  </Typography>
                </TableCell>

                <TableCell>{origemEstoqueLabels[lote.origem]}</TableCell>

                <TableCell align="right">{lote.quantidadeInicial}</TableCell>

                <TableCell align="right">
                  <Typography sx={{fontWeight:"700"}}>{lote.quantidadeAtual}</Typography>
                </TableCell>

                <TableCell>{formatarData(lote.dataRecebimento)}</TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography>{formatarData(lote.dataValidade)}</Typography>

                    {dias !== null ? (
                      <Typography variant="caption" color="text.secondary">
                        {dias < 0
                          ? `Vencido há ${Math.abs(dias)} dia(s)`
                          : `Vence em ${dias} dia(s)`}
                      </Typography>
                    ) : null}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={statusValidadeLabels[status]}
                    color={getStatusValidadeColor(status)}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <Stack sx={{direction:"row",justifyContent:"flex-end"}}spacing={1} >
                    <Tooltip title="Editar lote">
                      <IconButton onClick={() => onEdit(lote)} size="small">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Excluir lote">
                      <IconButton
                        onClick={() => onDelete(lote.id)}
                        size="small"
                        color="error"
                      >
                        
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}