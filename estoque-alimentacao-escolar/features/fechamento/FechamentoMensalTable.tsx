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
        <Typography variant="h6">Aucune ligne de clôture</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Enregistrez des produits actifs pour générer la clôture mensuelle.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Produit alimentaire</TableCell>
            <TableCell align="right">Stock précédent</TableCell>
            <TableCell align="right">Reçu pendant le mois</TableCell>
            <TableCell align="right">Stock compté</TableCell>
            <TableCell align="right">Consommé</TableCell>
            <TableCell>Date de péremption proche</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Observation</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {linhas.map((linha) => {
            const Incohérent = linha.status === "Incohérent";

            return (
              <TableRow
                key={linha.id}
                hover
                sx={{
                  bgcolor: Incohérent ? "rgba(211, 47, 47, 0.06)" : undefined,
                }}
              >
                <TableCell sx={{ minWidth: 240 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {linha.produtoNome}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Unité : {linha.unidade} · Minimum : {linha.estoqueMinimo}
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
                    error={Incohérent}
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
                      sx={{ fontWeight: 700 }}
                      color={Incohérent ? "error.main" : "text.primary"}
                    >
                      {formatarNumero(linha.quantidadeConsumida)}
                    </Typography>

                    {Incohérent ? (
                      <Typography variant="caption" color="error.main">
                        Consommation négative
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
                    placeholder="Facultatif"
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