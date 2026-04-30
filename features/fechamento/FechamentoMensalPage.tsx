"use client";

import { useEffect, useMemo, useState } from "react";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

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

import {
  ClotureMensuelle,
  MoisCloture,
  moisCloture,
} from "@/types/fechamento";

import { ClotureMensuelleTable } from "./FechamentoMensalTable";
import { ClotureResumeCards } from "./FechamentoResumoCards";

import {
  calculerTotauxCloture,
  moisLabels,
  statutClotureLabels,
} from "./fechamentoUtils";

export function ClotureMensuellePage() {
  const {
    clotures,
    initierOuChargerCloture,
    enregistrerBrouillonCloture,
    modifierLigneCloture,
    cloturerMois,
    rouvrirMois,
    regenererLignes,
  } = useAppContext();

  const anneeActuelle = new Date().getFullYear();
  const moisActuel = (new Date().getMonth() + 1) as MoisCloture;

  const [annee, setAnnee] = useState(anneeActuelle);
  const [mois, setMois] = useState<MoisCloture>(moisActuel);
  const [cloture, setCloture] = useState<ClotureMensuelle | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    const clotureChargee = initierOuChargerCloture(annee, mois);
    setCloture(clotureChargee);
  }, [annee, mois, initierOuChargerCloture]);

  useEffect(() => {
    if (!cloture) return;

    const miseAJour = clotures.find((item) => item.id === cloture.id);

    if (miseAJour) {
      setCloture(miseAJour);
    }
  }, [clotures]); // eslint-disable-line react-hooks/exhaustive-deps

  const totaux = useMemo(
    () => (cloture ? calculerTotauxCloture(cloture.lignes) : null),
    [cloture]
  );

  if (!cloture || !totaux) {
    return (
      <>
        <PageHeader
          title="Clôture mensuelle"
          description="Calcul mensuel du stock précédent, des réceptions, du stock compté et de la consommation des denrées alimentaires."
        />

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Chargement de la clôture mensuelle...
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  const verrouille = cloture.statut === "cloture";

  function handleChangeStockActuel(ligneId: string, value: number) {
    if (!cloture) return;

    modifierLigneCloture(cloture.id, ligneId, "stockActuelCompte", value);
  }

  function handleChangeObservation(ligneId: string, value: string) {
    if (!cloture) return;

    modifierLigneCloture(cloture.id, ligneId, "observation", value);
  }

  function handleEnregistrerBrouillon() {
    if (!cloture) return;

    setEnregistrement(true);
    enregistrerBrouillonCloture(cloture);

    window.setTimeout(() => {
      setEnregistrement(false);
    }, 800);
  }

  function handleRegenererLignes() {
    if (!cloture) return;

    const confirme = window.confirm(
      "Voulez-vous régénérer les lignes de clôture ? Les modifications manuelles seront perdues."
    );

    if (!confirme) return;

    regenererLignes(cloture.id);
  }

  function handleCloturerMois() {
    if (!cloture) return;

    if (totaux.totalIncoherences > 0) {
      window.alert(
        "Impossible de clôturer le mois tant que des lignes sont incohérentes."
      );
      return;
    }

    const confirme = window.confirm(
      `Voulez-vous clôturer le mois de ${moisLabels[mois]} ${annee} ? Après la clôture, l'édition sera bloquée.`
    );

    if (!confirme) return;

    cloturerMois(cloture.id);
  }

  function handleRouvrirMois() {
    if (!cloture) return;

    const confirme = window.confirm(
      "Voulez-vous rouvrir cette clôture pour la modifier ?"
    );

    if (!confirme) return;

    rouvrirMois(cloture.id);
  }

  return (
    <>
      <PageHeader
        title="Clôture mensuelle"
        description="Calcul mensuel du stock précédent, des réceptions, du stock compté et de la consommation des denrées alimentaires."
      />

      <ClotureResumeCards lignes={cloture.lignes} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: { xs: "stretch", lg: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Mois"
                value={mois}
                disabled={verrouille}
                onChange={(event) =>
                  setMois(Number(event.target.value) as MoisCloture)
                }
                sx={{ minWidth: { xs: "100%", md: 220 } }}
              >
                {moisCloture.map((moisItem) => (
                  <MenuItem key={moisItem} value={moisItem}>
                    {moisLabels[moisItem]}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Année"
                type="number"
                value={annee}
                disabled={verrouille}
                onChange={(event) => setAnnee(Number(event.target.value))}
                onFocus={(event) => event.target.select()}
                sx={{ minWidth: { xs: "100%", md: 140 } }}
                slotProps={{
                  htmlInput: {
                    min: 2020,
                    max: 2100,
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Chip
                label={statutClotureLabels[cloture.statut]}
                color={cloture.statut === "cloture" ? "success" : "default"}
              />

              <Chip
                label={`${totaux.totalIncoherences} incohérence(s)`}
                color={totaux.totalIncoherences > 0 ? "error" : "success"}
                variant={totaux.totalIncoherences > 0 ? "filled" : "outlined"}
              />

              <Chip
                label={`${totaux.totalStockFaible} stock faible`}
                color={totaux.totalStockFaible > 0 ? "warning" : "default"}
                variant="outlined"
              />
            </Box>
          </Box>

          {cloture.dateCloture ? (
            <Alert severity="success" sx={{ mt: 3 }}>
              Clôture effectuée le{" "}
              {new Date(cloture.dateCloture).toLocaleString("fr-FR")}.
            </Alert>
          ) : null}

          {totaux.totalIncoherences > 0 ? (
            <Alert severity="error" sx={{ mt: 3 }}>
              Certaines lignes présentent une consommation négative. Cela
              signifie en général que le stock compté est supérieur au stock
              précédent additionné des réceptions du mois.
            </Alert>
          ) : null}

          {!verrouille && totaux.totalIncoherences === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
              La clôture peut être validée. Après clôture, les champs de
              comptage et d&apos;observation seront verrouillés.
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h6">
                Rapport de {moisLabels[mois]} {annee}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Vérifiez le comptage physique avant de clôturer le mois.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {!verrouille ? (
                <Button
                  variant="outlined"
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={handleRegenererLignes}
                >
                  Régénérer les lignes
                </Button>
              ) : null}

              {verrouille ? (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<LockOpenOutlinedIcon />}
                  onClick={handleRouvrirMois}
                >
                  Rouvrir le mois
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<LockOutlinedIcon />}
                  onClick={handleCloturerMois}
                >
                  Clôturer le mois
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<SaveOutlinedIcon />}
                onClick={handleEnregistrerBrouillon}
                disabled={verrouille || enregistrement}
              >
                {enregistrement
                  ? "Enregistrement..."
                  : "Enregistrer le brouillon"}
              </Button>
            </Box>
          </Box>

          <ClotureMensuelleTable
            lignes={cloture.lignes}
            verrouille={verrouille}
            onChangeStockActuel={handleChangeStockActuel}
            onChangeObservation={handleChangeObservation}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Données enregistrées automatiquement dans le navigateur. Utilisez
              « Enregistrer le brouillon » pour confirmer les modifications
              avant de clôturer le mois.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}