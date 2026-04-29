"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { LinhaFechamentoMensal } from "@/types/fechamento";
import {
  formatarData,
  formatarNumero,
  getStatusLinhaColor,
  statusLinhaLabels,
} from "./fechamentoUtils";

type FechamentoMensalTableProps = {
  linhas: LinhaFechamentoMensal[];
  fechado: boolean;
  onChangeEstoqueAtual: (linhaId: string, value: number) => void;
  onChangeObservacao: (linhaId: string, value: string) => void;
};

export function FechamentoMensalTable({
  linhas,
  fechado,
  onChangeEstoqueAtual,
  onChangeObservacao,
}: FechamentoMensalTableProps) {
  if (linhas.length === 0) {
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
        <Typography variant="h6">Nenhuma linha de fechamento</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Cadastre produtos ativos para gerar o fechamento mensal.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Gênero alimentício</TableCell>
            <TableCell align="right">Estoque anterior</TableCell>
            <TableCell align="right">Recebido no mês</TableCell>
            <TableCell align="right">Estoque contado</TableCell>
            <TableCell align="right">Consumido</TableCell>
            <TableCell>Validade próxima</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Observação</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {linhas.map((linha) => {
            const inconsistente = linha.status === "inconsistente";

            return (
              <TableRow
                key={linha.id}
                hover
                sx={{
                  bgcolor: inconsistente ? "rgba(211, 47, 47, 0.06)" : undefined,
                }}
              >
                <TableCell sx={{ minWidth: 240 }}>
                  <Typography fontWeight={700}>{linha.produtoNome}</Typography>

                  <Typography variant="caption" color="text.secondary">
                    Unidade: {linha.unidade} · Mínimo: {linha.estoqueMinimo}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  {formatarNumero(linha.estoqueAnterior)}
                </TableCell>

                <TableCell align="right">
                  {formatarNumero(linha.quantidadeRecebida)}
                </TableCell>

                <TableCell align="right" sx={{ minWidth: 140 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={linha.estoqueAtualContado}
                    disabled={fechado}
                    onChange={(event) =>
                      onChangeEstoqueAtual(linha.id, Number(event.target.value))
                    }
                    error={inconsistente}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 1,
                        style: {
                          textAlign: "right",
                        },
                      },
                    }}
                  />
                </TableCell>

                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      alignItems: "flex-end",
                    }}
                  >
                    <Typography
                      fontWeight={700}
                      color={inconsistente ? "error.main" : "text.primary"}
                    >
                      {formatarNumero(linha.quantidadeConsumida)}
                    </Typography>

                    {inconsistente ? (
                      <Typography variant="caption" color="error.main">
                        Consumo negativo
                      </Typography>
                    ) : null}
                  </Box>
                </TableCell>

                <TableCell>{formatarData(linha.validadeMaisProxima)}</TableCell>

                <TableCell>
                  <Chip
                    label={statusLinhaLabels[linha.status]}
                    color={getStatusLinhaColor(linha.status)}
                    size="small"
                  />
                </TableCell>

                <TableCell sx={{ minWidth: 220 }}>
                  <TextField
                    size="small"
                    value={linha.observacao}
                    disabled={fechado}
                    onChange={(event) =>
                      onChangeObservacao(linha.id, event.target.value)
                    }
                    placeholder="Opcional"
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}