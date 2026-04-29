"use client";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LinhaFechamentoMensal } from "@/types/fechamento";
import { calcularTotaisFechamento, formatarNumero } from "./fechamentoUtils";

type FechamentoResumoCardsProps = {
  linhas: LinhaFechamentoMensal[];
};

export function FechamentoResumoCards({ linhas }: FechamentoResumoCardsProps) {
  const totais = calcularTotaisFechamento(linhas);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Inventory2OutlinedIcon color="primary" />

              <div>
                <Typography variant="body2" color="text.secondary">
                  Produtos
                </Typography>

                <Typography variant="h5">{totais.totalProdutos}</Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <TrendingDownOutlinedIcon color="primary" />

              <div>
                <Typography variant="body2" color="text.secondary">
                  Consumo total
                </Typography>

                <Typography variant="h5">
                  {formatarNumero(totais.totalConsumido)}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <WarningAmberOutlinedIcon color="warning" />

              <div>
                <Typography variant="body2" color="text.secondary">
                  Estoque baixo
                </Typography>

                <Typography variant="h5">{totais.totalEstoqueBaixo}</Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ErrorOutlineOutlinedIcon color="error" />

              <div>
                <Typography variant="body2" color="text.secondary">
                  Inconsistências
                </Typography>

                <Typography variant="h5">
                  {totais.totalInconsistencias}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}