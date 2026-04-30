"use client";

import { useEffect, useMemo, useState } from "react";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { PageHeader } from "@/components/ui/PageHeader";
import { useAppContext } from "@/context/AppContext";

import type { MoisCloture } from "@/types/fechamento";
import { moisCloture } from "@/types/fechamento";

import {
  moisLabels,
  statutClotureLabels,
} from "@/features/fechamento/fechamentoUtils";

import { RapportMensuelTable } from "./RelatorioMensalTable";

export function RapportsPage() {
  const { clotures } = useAppContext();

  const anneeActuelle = new Date().getFullYear();
  const moisActuel = (new Date().getMonth() + 1) as MoisCloture;

  const [mounted, setMounted] = useState(false);

  const [annee, setAnnee] = useState(anneeActuelle);
  const [mois, setMois] = useState<MoisCloture>(moisActuel);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cloture = useMemo(
    () => clotures.find((item) => item.annee === annee && item.mois === mois),
    [clotures, annee, mois]
  );

  const anneesDisponibles = useMemo(() => {
    const annees = new Set(clotures.map((item) => item.annee));
    annees.add(anneeActuelle);

    return Array.from(annees).sort((a, b) => b - a);
  }, [clotures, anneeActuelle]);

  function handleImprimer() {
    window.print();
  }

  function handleExporterCSV() {
    if (!cloture) return;

    const entete = [
      "Produit",
      "Unité",
      "Stock précédent",
      "Reçu",
      "Stock compté",
      "Consommé",
      "Péremption proche",
      "Statut",
      "Observation",
    ].join(";");

    const lignes = cloture.lignes.map((ligne) =>
      [
        ligne.produitNom,
        ligne.unite,
        ligne.stockAnterieur,
        ligne.quantiteRecue,
        ligne.stockActuelCompte,
        ligne.quantiteConsommee,
        ligne.validitePlusProche ?? "",
        ligne.statut,
        ligne.observation,
      ].join(";")
    );

    const csv = [entete, ...lignes].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `cloture_${moisLabels[mois].toLowerCase()}_${annee}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  if (!mounted) {
    return (
      <>
        <PageHeader
          title="Rapports"
          description="Consultez et exportez les rapports mensuels de clôture du stock scolaire."
        />

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Chargement des rapports...
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Consultez et exportez les rapports mensuels de clôture du stock scolaire."
      />

      {/* Sélecteur de période */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Mois"
                value={mois}
                onChange={(event) =>
                  setMois(Number(event.target.value) as MoisCloture)
                }
                sx={{ minWidth: { xs: "100%", sm: 200 } }}
              >
                {moisCloture.map((moisItem) => (
                  <MenuItem key={moisItem} value={moisItem}>
                    {moisLabels[moisItem]}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Année"
                value={annee}
                onChange={(event) => setAnnee(Number(event.target.value))}
                sx={{ minWidth: { xs: "100%", sm: 140 } }}
              >
                {anneesDisponibles.map((anneeItem) => (
                  <MenuItem key={anneeItem} value={anneeItem}>
                    {anneeItem}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
              }}
            >
              {cloture ? (
                <Chip
                  label={statutClotureLabels[cloture.statut]}
                  color={cloture.statut === "cloture" ? "success" : "default"}
                  size="small"
                />
              ) : null}

              <Button
                variant="outlined"
                startIcon={<PrintOutlinedIcon />}
                onClick={handleImprimer}
                disabled={!cloture}
                size="small"
              >
                Imprimer
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadOutlinedIcon />}
                onClick={handleExporterCSV}
                disabled={!cloture}
                size="small"
              >
                Exporter CSV
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Contenu du rapport */}
      {cloture ? (
        <Card>
          <CardContent>
            <RapportMensuelTable cloture={cloture} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Alert severity="info">
              Aucune clôture trouvée pour{" "}
              <strong>
                {moisLabels[mois]} {annee}
              </strong>
              . Rendez-vous sur la page <strong>Clôture mensuelle</strong> pour
              créer et enregistrer la clôture de cette période.
            </Alert>

            {clotures.length > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Clôtures disponibles :
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {clotures.map((item) => (
                    <Chip
                      key={item.id}
                      label={`${moisLabels[item.mois]} ${item.annee}`}
                      variant="outlined"
                      size="small"
                      color={item.statut === "cloture" ? "success" : "default"}
                      onClick={() => {
                        setAnnee(item.annee);
                        setMois(item.mois);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Aucune clôture enregistrée pour le moment. Allez sur la page
                  Clôture mensuelle, remplissez les données et cliquez sur
                  « Enregistrer le brouillon » ou « Clôturer le mois ».
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}