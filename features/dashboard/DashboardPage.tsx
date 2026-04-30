"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { PageHeader } from "@/components/ui/PageHeader";
import { useAppContext } from "@/context/AppContext";

import {
  getStatutValidite,
  statutValiditeLabels,
} from "@/features/estoque/estoqueUtils";

import {
  moisLabels,
  statutClotureLabels,
} from "@/features/fechamento/fechamentoUtils";

import type { MoisCloture } from "@/types/fechamento";

type IndicateurCardProps = {
  titre: string;
  valeur: string;
  description: string;
  icon: ReactNode;
  accent: "primary" | "warning" | "error" | "info";
};

function IndicateurCard({
  titre,
  valeur,
  description,
  icon,
  accent,
}: IndicateurCardProps) {
  const accentColors: Record<IndicateurCardProps["accent"], string> = {
    primary: "#1f6f4a",
    warning: "#e6a817",
    error: "#d32f2f",
    info: "#0288d1",
  };

  const accentBg: Record<IndicateurCardProps["accent"], string> = {
    primary: "rgba(31,111,74,0.09)",
    warning: "rgba(230,168,23,0.09)",
    error: "rgba(211,47,47,0.09)",
    info: "rgba(2,136,209,0.09)",
  };

  const color = accentColors[accent];
  const bg = accentBg[accent];

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 16px 40px rgba(15,23,42,0.10)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: color,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontSize: "0.68rem",
                mb: 0.75,
              }}
            >
              {titre}
            </Typography>

            <Typography
              sx={{
                fontWeight: 800,
                lineHeight: 1,
                mb: 0.75,
                color: "text.primary",
                fontSize: "2rem",
              }}
            >
              {valeur}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2.5,
              bgcolor: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color,
              "& svg": { fontSize: 26 },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { produits, lots, clotures } = useAppContext();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const produitsById = useMemo(
    () => new Map(produits.map((produit) => [produit.id, produit])),
    [produits]
  );

  const produitsActifs = useMemo(
    () => produits.filter((produit) => produit.actif),
    [produits]
  );

  /*
    Importante:
    Aqui filtramos apenas lotes ligados a produtos existentes E ativos.

    Se um produto foi desativado, seus lotes continuam preservados no histórico,
    mas não aparecem mais no dashboard como alerta operacional.
  */
  const lotsAvecProduitActif = useMemo(
    () =>
      lots.filter((lot) => {
        const produit = produitsById.get(lot.produitId);
        return produit?.actif === true;
      }),
    [lots, produitsById]
  );

  const totalProduitsActifs = produitsActifs.length;

  const alertesValidite = useMemo(
    () =>
      lotsAvecProduitActif.filter((lot) => {
        const statut = getStatutValidite(lot.dateValidite);

        return (
          statut === "critique" ||
          statut === "attention" ||
          statut === "expire"
        );
      }),
    [lotsAvecProduitActif]
  );

  const produitsStockFaible = useMemo(
    () =>
      produitsActifs.filter((produit) => {
        const totalStock = lotsAvecProduitActif
          .filter((lot) => lot.produitId === produit.id)
          .reduce((sum, lot) => sum + lot.quantiteActuelle, 0);

        return totalStock <= produit.stockMinimum;
      }),
    [lotsAvecProduitActif, produitsActifs]
  );

  const moisActuel = (new Date().getMonth() + 1) as MoisCloture;
  const anneeActuelle = new Date().getFullYear();

  const clotureActuelle = clotures.find(
    (cloture) =>
      cloture.annee === anneeActuelle && cloture.mois === moisActuel
  );

  const totalIncoherences = clotureActuelle
    ? clotureActuelle.lignes.filter((ligne) => ligne.statut === "incoherent")
        .length
    : 0;

  const maintenant = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!mounted) {
    return (
      <Box>
        <PageHeader
          title="Tableau de bord"
          description="Vue d'ensemble du stock, des dates de péremption et de la clôture mensuelle."
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <PageHeader
          title="Tableau de bord"
          description="Vue d'ensemble du stock, des dates de péremption et de la clôture mensuelle."
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
            mb: { xs: 0, sm: 3 },
          }}
        >
          <AccessTimeOutlinedIcon
            sx={{ fontSize: 15, color: "text.disabled" }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "capitalize" }}
          >
            {maintenant}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <IndicateurCard
            titre="Produits enregistrés"
            valeur={totalProduitsActifs.toString()}
            description="Denrées alimentaires actives"
            icon={<InventoryOutlinedIcon />}
            accent="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <IndicateurCard
            titre="Alertes de péremption"
            valeur={alertesValidite.length.toString()}
            description="Produits actifs uniquement"
            icon={<WarningAmberOutlinedIcon />}
            accent="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <IndicateurCard
            titre="Clôture mensuelle"
            valeur={
              clotureActuelle
                ? `${moisLabels[clotureActuelle.mois].slice(0, 3)}. ${
                    clotureActuelle.annee
                  }`
                : "—"
            }
            description={
              clotureActuelle
                ? statutClotureLabels[clotureActuelle.statut]
                : "Aucune clôture ce mois"
            }
            icon={<CalendarMonthOutlinedIcon />}
            accent="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <IndicateurCard
            titre="Incohérences"
            valeur={totalIncoherences.toString()}
            description="Lignes à corriger en clôture"
            icon={<ErrorOutlineOutlinedIcon />}
            accent="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 1,
                }}
              >
                <Typography variant="h6" sx={{fontWeight:"700"}}>
                  Alertes de péremption
                </Typography>

                {alertesValidite.length > 0 && (
                  <Chip
                    label={`${alertesValidite.length} alerte${
                      alertesValidite.length > 1 ? "s" : ""
                    }`}
                    color="warning"
                    size="small"
                  />
                )}
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              {alertesValidite.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    py: 5,
                  }}
                >
                  <TrendingUpIcon
                    sx={{ fontSize: 44, color: "success.main", opacity: 0.6 }}
                  />

                  <Typography variant="body2" color="text.secondary">
                    Aucune alerte de péremption pour les produits actifs.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  {alertesValidite.slice(0, 5).map((lot) => {
                    const produit = produitsById.get(lot.produitId);

                    if (!produit || !produit.actif) return null;

                    const statut = getStatutValidite(lot.dateValidite);

                    const isError =
                      statut === "expire" || statut === "critique";

                    return (
                      <Box
                        key={lot.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isError
                            ? "error.light"
                            : "warning.light",
                          bgcolor: isError
                            ? "rgba(211,47,47,0.04)"
                            : "rgba(230,168,23,0.04)",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                            minWidth: 0,
                          }}
                        >
                          <FiberManualRecordIcon
                            sx={{
                              fontSize: 10,
                              color: isError ? "error.main" : "warning.main",
                              flexShrink: 0,
                            }}
                          />

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{fontWeight:"700"}}
                              noWrap
                            >
                              {produit.nom}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Péremption :{" "}
{new Date(`${lot.dateValidite}T00:00:00`).toLocaleDateString("fr-FR")}
{lot.numeroLot?.trim() ? ` · Lot : ${lot.numeroLot}` : ""}
{" "}· Qté : {lot.quantiteActuelle} {produit.unite}
                            </Typography>
                          </Box>
                        </Box>

                        <Chip
                          label={statutValiditeLabels[statut]}
                          color={isError ? "error" : "warning"}
                          size="small"
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
                    );
                  })}

                  {alertesValidite.length > 5 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ pl: 0.5 }}
                    >
                      +{alertesValidite.length - 5} alerte(s)
                      supplémentaire(s) — consultez la page Stock.
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 1,
                }}
              >
                <Typography variant="h6" sx={{fontWeight:"700"}}>
                  Stock insuffisant
                </Typography>

                {produitsStockFaible.length > 0 && (
                  <Chip
                    label={`${produitsStockFaible.length} produit${
                      produitsStockFaible.length > 1 ? "s" : ""
                    }`}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              {produitsStockFaible.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    py: 5,
                  }}
                >
                  <TrendingUpIcon
                    sx={{ fontSize: 44, color: "success.main", opacity: 0.6 }}
                  />

                  <Typography variant="body2" color="text.secondary">
                    Tous les produits actifs sont au-dessus du minimum.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {produitsStockFaible.slice(0, 6).map((produit) => {
                    const totalStock = lotsAvecProduitActif
                      .filter((lot) => lot.produitId === produit.id)
                      .reduce((sum, lot) => sum + lot.quantiteActuelle, 0);

                    const pct =
                      produit.stockMinimum > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (totalStock / produit.stockMinimum) * 100
                            )
                          )
                        : 0;

                    const barColor =
                      pct <= 25
                        ? "error.main"
                        : pct <= 60
                          ? "warning.main"
                          : "success.main";

                    return (
                      <Box key={produit.id}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            mb: 0.75,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{fontWeight:"700", mr:"1"}}
                            noWrap
                           
                          >
                            {produit.nom}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{fontWeight:"700",flexShrink: 0}}
                            color="error.main"
                           
                          >
                            {totalStock} / {produit.stockMinimum}{" "}
                            {produit.unite}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            height: 7,
                            borderRadius: 4,
                            bgcolor: "grey.200",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${pct}%`,
                              bgcolor: barColor,
                              borderRadius: 4,
                              transition:
                                "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>

  );
}
