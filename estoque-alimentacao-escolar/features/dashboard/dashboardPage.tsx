"use client";

import { useMemo } from "react";
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
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppContext } from "@/context/AppContext";
import { getStatusValidite } from "@/features/estoque/estoqueUtils";
import { mesesLabels } from "@/features/fechamento/fechamentoUtils";
import { MesFechamento } from "@/types/fechamento";

// ─── Traductions ───────────────────────────────────────────────────────────────
const statusValidadeFr: Record<string, string> = {
  vencido: "Expiré",
  critico: "Critique",
  atencao: "Attention",
  ok: "OK",
  sem_validade: "Sans date",
};

const statusClotureFr: Record<string, string> = {
  rascunho: "Brouillon",
  fechado: "Clôturé",
  reaberto: "Réouvert",
};

// ─── Carte KPI ─────────────────────────────────────────────────────────────────
type IndicadorCardProps = {
  titulo: string;
  valor: string;
  descricao: string;
  icon: React.ReactNode;
  accent: "primary" | "warning" | "error" | "info";
};

function IndicadorCard({
  titulo,
  valor,
  descricao,
  icon,
  accent,
}: IndicadorCardProps) {
  const accentColors: Record<string, string> = {
    primary: "#1f6f4a",
    warning: "#e6a817",
    error: "#d32f2f",
    info: "#0288d1",
  };
  const accentBg: Record<string, string> = {
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
        <Stack
        sx={{direction:"row",alignItems:"flex-start","justifyContent":"space-between"}}
         
          spacing={2}
        >
          <Box>
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
              {titulo}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                lineHeight: 1,
                mb: 0.75,
                color: "text.primary",
              }}
            >
              {valor}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {descricao}
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
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export function DashboardPage() {
  const { produtos, lotes, fechamentos } = useAppContext();

  const totalProdutosAtivos = produtos.filter((p) => p.ativo).length;

  const alertasValidade = useMemo(
    () =>
      lotes.filter((lote) => {
        const status = getStatusValidite(lote.dataValidade);
        return status === "critique" || status === "attention" || status === "expire";
      }),
    [lotes]
  );

  const produtosEstoqueBaixo = useMemo(
    () =>
      produtos.filter((produto) => {
        if (!produto.ativo) return false;
        const totalEstoque = lotes
          .filter((l) => l.produtoId === produto.id)
          .reduce((sum, l) => sum + l.quantidadeAtual, 0);
        return totalEstoque <= produto.estoqueMinimo;
      }),
    [lotes, produtos]
  );

  const mesAtual = (new Date().getMonth() + 1) as MesFechamento;
  const anoAtual = new Date().getFullYear();
  const fechamentoAtual = fechamentos.find(
    (f) => f.ano === anoAtual && f.mes === mesAtual
  );

  const totalInconsistencias = fechamentoAtual
    ? fechamentoAtual.linhas.filter((l) => l.status === "Incohérent").length
    : 0;

  const agora = new Date().toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Box>
      {/* En-tête */}
      <Stack
        sx={{direction:"row",alignItems:"flex-start","justifyContent":"space-between"}}
        spacing={2}
      >
        <PageHeader
          title="Tableau de bord"
          description="Vue d'ensemble du stock, des dates de péremption et de la clôture mensuelle."
        />

        <Stack
         
          spacing={1}
          sx={{
            direction:"row",
            alignItems:"center",
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
          <AccessTimeOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "capitalize" }}
          >
            {agora}
          </Typography>
        </Stack>
      </Stack>

      {/* Cartes KPI */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <IndicadorCard
            titulo="Produits enregistrés"
            valor={totalProdutosAtivos.toString()}
            descricao="Denrées alimentaires actives"
            icon={<InventoryOutlinedIcon />}
            accent="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <IndicadorCard
            titulo="Alertes de péremption"
            valor={alertasValidade.length.toString()}
            descricao="Critique, attention ou expiré"
            icon={<WarningAmberOutlinedIcon />}
            accent="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <IndicadorCard
            titulo="Clôture mensuelle"
            valor={
              fechamentoAtual
                ? `${mesesLabels[fechamentoAtual.mes].slice(0, 3)}. ${fechamentoAtual.ano}`
                : "—"
            }
            descricao={
              fechamentoAtual
                ? statusClotureFr[fechamentoAtual.status] ?? fechamentoAtual.status
                : "Aucune clôture ce mois"
            }
            icon={<CalendarMonthOutlinedIcon />}
            accent="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <IndicadorCard
            titulo="Incohérences"
            valor={totalInconsistencias.toString()}
            descricao="Lignes à corriger en clôture"
            icon={<ErrorOutlineOutlinedIcon />}
            accent="error"
          />
        </Grid>
      </Grid>

      {/* Section détail */}
      <Grid container spacing={3}>
        {/* Alertes de péremption */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
              sx={{direction:"row",alignItems:"flex-start","justifyContent":"space-between",mb:"1"}}
              
              >
                <Typography variant="h6" sx={{fontWeight:"700"}}>
                  Alertes de péremption
                </Typography>
                {alertasValidade.length > 0 && (
                  <Chip
                    label={`${alertasValidade.length} alerte${alertasValidade.length > 1 ? "s" : ""}`}
                    color="warning"
                    size="small"
                  />
                )}
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

              {alertasValidade.length === 0 ? (
                <Stack sx={{alignItems:"center",py:"5"}}spacing={1} >
                  <TrendingUpIcon
                    sx={{ fontSize: 44, color: "success.main", opacity: 0.6 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Aucune alerte de péremption pour le moment.
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={1.5}>
                  {alertasValidade.slice(0, 5).map((lote) => {
                    const produto = produtos.find((p) => p.id === lote.produtoId);
                    const status = getStatusValidite(lote.dataValidade);
                    const isError = status === "expire" || status === "critique";

                    return (
                      <Box
                        key={lote.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isError ? "error.light" : "warning.light",
                          bgcolor: isError
                            ? "rgba(211,47,47,0.04)"
                            : "rgba(230,168,23,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          transition: "background 0.15s",
                        }}
                      >
                        <Stack sx={{direction:"row",alignItems:"center",minWidth:"1.5"}} spacing={1.5} >
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
                              {produto?.nome ?? "Produit inconnu"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Péremption :{" "}
                              {new Date(
                                `${lote.dataValidade}T00:00:00`
                              ).toLocaleDateString("fr-FR")}{" "}
                              · Qté : {lote.quantidadeAtual} {produto?.unidade}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          label={statusValidadeFr[status] ?? status}
                          color={isError ? "error" : "warning"}
                          size="small"
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
                    );
                  })}

                  {alertasValidade.length > 5 && (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                      +{alertasValidade.length - 5} alerte(s) supplémentaire(s) — consultez la page Stock.
                    </Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stock insuffisant */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
               sx={{direction:"row",alignItems:"center","justifyContent":"space-between",mb:"1"}}
               
          
              >
                <Typography variant="h6" sx={{fontWeight:"700"}} >
                  Stock insuffisant
                </Typography>
                {produtosEstoqueBaixo.length > 0 && (
                  <Chip
                    label={`${produtosEstoqueBaixo.length} produit${produtosEstoqueBaixo.length > 1 ? "s" : ""}`}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

              {produtosEstoqueBaixo.length === 0 ? (
                <Stack sx={{alignItems:"center",py:"5"}} spacing={1} >
                  <TrendingUpIcon
                    sx={{ fontSize: 44, color: "success.main", opacity: 0.6 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Tous les produits sont au-dessus du minimum.
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {produtosEstoqueBaixo.slice(0, 6).map((produto) => {
                    const totalEstoque = lotes
                      .filter((l) => l.produtoId === produto.id)
                      .reduce((sum, l) => sum + l.quantidadeAtual, 0);

                    const pct =
                      produto.estoqueMinimo > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (totalEstoque / produto.estoqueMinimo) * 100
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
                      <Box key={produto.id}>
                        <Stack
                         sx={{direction:"row",alignItems:"center","justifyContent":"space-between", mb:"0.75"}}
                         
                        >
                          <Typography variant="body2" sx={{fontWeight:"700",mr:"1"}} noWrap >
                            {produto.nome}
                          </Typography>
                          <Typography
                            variant="caption"
                           
                            color="error.main"
                            sx={{ flexShrink: 0,fontWeight:"700" }}
                          >
                            {totalEstoque} / {produto.estoqueMinimo} {produto.unidade}
                          </Typography>
                        </Stack>

                        {/* Barre de progression */}
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
                              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}