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
import { LigneClotureMensuelle } from "@/types/fechamento";
import { calculerTotauxCloture, formaterNombre } from "./fechamentoUtils";

type ClotureResumeCardsProps = {
  lignes: LigneClotureMensuelle[];
};

export function ClotureResumeCards({ lignes }: ClotureResumeCardsProps) {
  const totaux = calculerTotauxCloture(lignes);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack sx={{direction:"row",alignItems: "center"}} spacing={2}>
              <Inventory2OutlinedIcon color="primary" />
              <div>
                <Typography variant="body2" color="text.secondary">
                  Produits
                </Typography>
                <Typography variant="h5">{totaux.totalProduits}</Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack sx={{direction:"row",alignItems: "center"}} spacing={2}>
              <TrendingDownOutlinedIcon color="primary" />
              <div>
                <Typography variant="body2" color="text.secondary">
                  Consommation totale
                </Typography>
                <Typography variant="h5">
                  {formaterNombre(totaux.totalConsomme)}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack sx={{direction:"row",alignItems: "center"}} spacing={2}>
              <WarningAmberOutlinedIcon color="warning" />
              <div>
                <Typography variant="body2" color="text.secondary">
                  Stock faible
                </Typography>
                <Typography variant="h5">{totaux.totalStockFaible}</Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack sx={{direction:"row",alignItems: "center"}} spacing={2}>
              <ErrorOutlineOutlinedIcon color="error" />
              <div>
                <Typography variant="body2" color="text.secondary">
                  Incohérences
                </Typography>
                <Typography variant="h5">{totaux.totalIncoherences}</Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
