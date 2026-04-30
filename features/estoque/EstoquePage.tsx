"use client";

import { useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { PageHeader } from "@/components/ui/PageHeader";
import { useAppContext } from "@/context/AppContext";

import type { LotStock, LotStockFormValues } from "@/types/estoque";

import {
  calculerResumeStockParProduit,
  getNomProduit,
  getStatutValidite,
  lotVersFormValues,
} from "./estoqueUtils";

import { LotStockFormDialog } from "./LoteEstoqueFormDialog";
import { LotsStockTable } from "./LotesEstoqueTable";
import { StockResumeTable } from "./EstoqueResumoTable";

type StockTab = "resume" | "lots";
type FiltreValidite = "tous" | "expires" | "alertes" | "ok";

export function StockPage() {
  const { produits, lots, ajouterLot, modifierLot, supprimerLot } =
    useAppContext();

  const [mounted, setMounted] = useState(false);

  const [tab, setTab] = useState<StockTab>("resume");
  const [recherche, setRecherche] = useState("");
  const [filtreValidite, setFiltreValidite] =
    useState<FiltreValidite>("tous");
  const [dialogueOuvert, setDialogueOuvert] = useState(false);
  const [lotEnEdition, setLotEnEdition] = useState<LotStock | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resume = useMemo(
    () => calculerResumeStockParProduit(produits, lots),
    [lots, produits]
  );

  const lotsFiltres = useMemo(() => {
    const rechercheNormalisee = recherche.trim().toLowerCase();

    return lots
      .filter((lot) => {
        const produitNom = getNomProduit(produits, lot.produitId).toLowerCase();

        const correspondRecherche = produitNom.includes(rechercheNormalisee);

        const statut = getStatutValidite(lot.dateValidite);

        const correspondValidite =
          filtreValidite === "tous" ||
          (filtreValidite === "expires" && statut === "expire") ||
          (filtreValidite === "alertes" &&
            ["critique", "attention"].includes(statut)) ||
          (filtreValidite === "ok" && statut === "ok");

        return correspondRecherche && correspondValidite;
      })
      .sort((a, b) => a.dateValidite.localeCompare(b.dateValidite));
  }, [recherche, filtreValidite, lots, produits]);

  const totalProduitsEnStock = resume.length;
  const totalLots = lots.length;

  const totalAlertes = lots.filter((lot) => {
    const statut = getStatutValidite(lot.dateValidite);
    return statut === "critique" || statut === "attention";
  }).length;

  const totalExpires = lots.filter(
    (lot) => getStatutValidite(lot.dateValidite) === "expire"
  ).length;

  function handleNouveauLot() {
    setLotEnEdition(null);
    setDialogueOuvert(true);
  }

  function handleModifierLot(lot: LotStock) {
    setLotEnEdition(lot);
    setDialogueOuvert(true);
  }

  function handleFermerDialogue() {
    setDialogueOuvert(false);
    setLotEnEdition(null);
  }

  function handleEnregistrerLot(values: LotStockFormValues) {
    if (lotEnEdition) {
      modifierLot(lotEnEdition.id, values);
    } else {
      ajouterLot(values);
    }

    handleFermerDialogue();
  }

  function handleSupprimerLot(lotId: string) {
    const lot = lots.find((item) => item.id === lotId);

    if (!lot) return;

    const produitNom = getNomProduit(produits, lot.produitId);

    const confirme = window.confirm(
      `Voulez-vous vraiment supprimer le lot de « ${produitNom} » ?`
    );

    if (!confirme) return;

    supprimerLot(lotId);
  }

  if (!mounted) {
    return (
      <>
        <PageHeader
          title="Stock"
          description="Suivi des réceptions, des lots, des soldes actuels et des dates de péremption des denrées alimentaires."
        />

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Chargement du stock...
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Stock"
        description="Suivi des réceptions, des lots, des soldes actuels et des dates de péremption des denrées alimentaires."
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Inventory2OutlinedIcon color="primary" />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Produits en stock
                  </Typography>

                  <Typography variant="h5">
                    {totalProduitsEnStock}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Inventory2OutlinedIcon color="primary" />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Lots enregistrés
                  </Typography>

                  <Typography variant="h5">{totalLots}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <WarningAmberOutlinedIcon color="warning" />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Alertes de péremption
                  </Typography>

                  <Typography variant="h5">{totalAlertes}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <ErrorOutlineOutlinedIcon color="error" />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Lots expirés
                  </Typography>

                  <Typography variant="h5">{totalExpires}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Chip label={`${totalLots} lots`} />
          <Chip label={`${totalAlertes} alertes`} color="warning" />
          <Chip label={`${totalExpires} expirés`} color="error" />
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNouveauLot}
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            whiteSpace: "nowrap",
          }}
        >
          Nouvelle réception
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(_, value: StockTab) => setTab(value)}
            sx={{ mb: 3 }}
          >
            <Tab value="resume" label="Résumé par produit" />
            <Tab value="lots" label="Lots et péremptions" />
          </Tabs>

          {tab === "resume" ? (
            <StockResumeTable resume={resume} />
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <TextField
                  label="Rechercher un produit"
                  placeholder="Exemple : riz, haricots, lait..."
                  value={recherche}
                  onChange={(event) => setRecherche(event.target.value)}
                  fullWidth
                />

                <TextField
                  select
                  label="Validité"
                  value={filtreValidite}
                  onChange={(event) =>
                    setFiltreValidite(event.target.value as FiltreValidite)
                  }
                  sx={{ minWidth: { xs: "100%", md: 240 } }}
                >
                  <MenuItem value="tous">Tous</MenuItem>
                  <MenuItem value="expires">Expirés</MenuItem>
                  <MenuItem value="alertes">Critique / attention</MenuItem>
                  <MenuItem value="ok">OK</MenuItem>
                </TextField>
              </Box>

              <LotsStockTable
                lots={lotsFiltres}
                produits={produits}
                onEdit={handleModifierLot}
                onDelete={handleSupprimerLot}
              />
            </>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Données enregistrées automatiquement dans le navigateur via
              localStorage.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <LotStockFormDialog
        open={dialogueOuvert}
        mode={lotEnEdition ? "edit" : "create"}
        produits={produits}
        initialValues={
          lotEnEdition ? lotVersFormValues(lotEnEdition) : undefined
        }
        onClose={handleFermerDialogue}
        onSubmit={handleEnregistrerLot}
      />
    </>
  );
}