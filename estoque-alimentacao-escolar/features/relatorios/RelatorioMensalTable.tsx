"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { FechamentoMensal } from "@/types/fechamento";
import {
  calcularTotaisFechamento,
  formatarData,
  formatarNumero,
  getStatusLinhaColor,
  mesesLabels,
  statusLinhaLabels,
} from "@/features/fechamento/fechamentoUtils";

type RelatorioMensalTableProps = {
  fechamento: FechamentoMensal;
};

export function RelatorioMensalTable({ fechamento }: RelatorioMensalTableProps) {
  const totais = calcularTotaisFechamento(fechamento.linhas);

  if (fechamento.linhas.length === 0) {
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
        <Typography variant="h6">Nenhuma linha neste fechamento</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Este mês não possui linhas de fechamento registradas.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho do relatório */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
        }}
      >
        <Typography sx={{fontWeight:"700"}}variant="h6" >
          Relatório de Fechamento Mensal — {mesesLabels[fechamento.mes]}/
          {fechamento.ano}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
          Status:{" "}
          {fechamento.status === "Clôturé"
            ? "Clôturé"
            : fechamento.status === "Rouvert"
              ? "Rouvert"
              : "Brouillon" }
          {fechamento.fechadoEm
            ? ` · Encerrado em ${new Date(fechamento.fechadoEm).toLocaleDateString("pt-BR")}`
            : ""}
        </Typography>
      </Box>

      {/* Cards de resumo inline */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: "Produtos", valor: totais.totalProdutos },
          {
            label: "Total recebido",
            valor: formatarNumero(totais.totalRecebido),
          },
          {
            label: "Total consumido",
            valor: formatarNumero(totais.totalConsumido),
          },
          {
            label: "Estoque final",
            valor: formatarNumero(totais.totalEstoqueAtual),
          },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h6" sx={{fontWeight:"700"}}>
              {item.valor}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Alertas */}
      {totais.totalInconsistencias > 0 || totais.totalEstoqueBaixo > 0 ? (
        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {totais.totalInconsistencias > 0 && (
            <Chip
              label={`${totais.totalInconsistencias} inconsistência(s)`}
              color="error"
              size="small"
            />
          )}
          {totais.totalEstoqueBaixo > 0 && (
            <Chip
              label={`${totais.totalEstoqueBaixo} produto(s) com estoque baixo`}
              color="warning"
              size="small"
            />
          )}
        </Box>
      ) : null}

      {/* Tabela principal */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Gênero alimentício
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Un.
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Est. anterior
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Recebido
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Est. contado
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Consumido
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Validade próxima
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Status
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{fontWeight:"700"}}>
                  Observação
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {fechamento.linhas.map((linha) => (
              <TableRow
                key={linha.id}
                hover
                sx={{
                  bgcolor:
                    linha.status === "Incohérent"
                      ? "rgba(211, 47, 47, 0.06)"
                      : undefined,
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{fontWeight:"700"}}>
                    {linha.produtoNome}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {linha.unidade}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  {formatarNumero(linha.estoqueAnterior)}
                </TableCell>

                <TableCell align="right">
                  {formatarNumero(linha.quantidadeRecebida)}
                </TableCell>

                <TableCell align="right">
                  {formatarNumero(linha.estoqueAtualContado)}
                </TableCell>

                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{fontWeight:"700"}}
                    color={
                      linha.status === "Incohérent"
                        ? "error.main"
                        : "text.primary"
                    }
                  >
                    {formatarNumero(linha.quantidadeConsumida)}
                  </Typography>
                </TableCell>

                <TableCell>{formatarData(linha.validadeMaisProxima)}</TableCell>

                <TableCell>
                  <Chip
                    label={statusLinhaLabels[linha.status]}
                    color={getStatusLinhaColor(linha.status)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {linha.observacao || "—"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell colSpan={2}>
                <Typography variant="body2" sx={{fontWeight:"700"}}>
                  Totais
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{fontWeight:"700"}}>
                  {formatarNumero(totais.totalEstoqueAnterior)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{fontWeight:"700"}}>
                  {formatarNumero(totais.totalRecebido)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{fontWeight:"700"}}>
                  {formatarNumero(totais.totalEstoqueAtual)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{fontWeight:"700"}}>
                  {formatarNumero(totais.totalConsumido)}
                </Typography>
              </TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Rodapé do relatório */}
      <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary">
          Gerado em {new Date().toLocaleString("pt-BR")} · Sistema de Controle
          de Alimentação Escolar
        </Typography>
      </Box>
    </Box>
  );
}
