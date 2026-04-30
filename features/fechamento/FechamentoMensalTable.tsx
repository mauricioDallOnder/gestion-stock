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
import { LigneClotureMensuelle } from "@/types/fechamento";
import {
  formaterDate,
  formaterNombre,
  getStatutLigneColor,
  statutLigneLabels,
} from "./fechamentoUtils";

type ClotureMensuelleTableProps = {
  lignes: LigneClotureMensuelle[];
  verrouille: boolean;
  onChangeStockActuel: (ligneId: string, value: number) => void;
  onChangeObservation: (ligneId: string, value: string) => void;
};

export function ClotureMensuelleTable({
  lignes,
  verrouille,
  onChangeStockActuel,
  onChangeObservation,
}: ClotureMensuelleTableProps) {
  if (lignes.length === 0) {
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
            <TableCell>Denrée alimentaire</TableCell>
            <TableCell align="right">Stock précédent</TableCell>
            <TableCell align="right">Reçu dans le mois</TableCell>
            <TableCell align="right">Stock compté</TableCell>
            <TableCell align="right">Consommé</TableCell>
            <TableCell>Péremption proche</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Observation</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lignes.map((ligne) => {
            const isIncoherent = ligne.statut === "incoherent";

            return (
              <TableRow
                key={ligne.id}
                hover
                sx={{
                  bgcolor: isIncoherent
                    ? "rgba(211, 47, 47, 0.06)"
                    : undefined,
                }}
              >
                <TableCell sx={{ minWidth: 240 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {ligne.produitNom}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Unité : {ligne.unite} · Minimum : {ligne.stockMinimum}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  {formaterNombre(ligne.stockAnterieur)}
                </TableCell>

                <TableCell align="right">
                  {formaterNombre(ligne.quantiteRecue)}
                </TableCell>

                <TableCell align="right" sx={{ minWidth: 140 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={
                      ligne.stockActuelCompte === 0
                        ? ""
                        : ligne.stockActuelCompte
                    }
                    disabled={verrouille}
                    onChange={(event) => {
                      const v = event.target.value;
                      onChangeStockActuel(
                        ligne.id,
                        v === "" ? 0 : Number(v)
                      );
                    }}
                    onFocus={(event) => event.target.select()}
                    error={isIncoherent}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 1,
                        style: { textAlign: "right" },
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
                      color={isIncoherent ? "error.main" : "text.primary"}
                    >
                      {formaterNombre(ligne.quantiteConsommee)}
                    </Typography>
                    {isIncoherent ? (
                      <Typography variant="caption" color="error.main">
                        Consommation négative
                      </Typography>
                    ) : null}
                  </Box>
                </TableCell>

                <TableCell>{formaterDate(ligne.validitePlusProche)}</TableCell>

                <TableCell>
                  <Chip
                    label={statutLigneLabels[ligne.statut]}
                    color={getStatutLigneColor(ligne.statut)}
                    size="small"
                  />
                </TableCell>

                <TableCell sx={{ minWidth: 220 }}>
                  <TextField
                    size="small"
                    value={ligne.observation}
                    disabled={verrouille}
                    onChange={(event) =>
                      onChangeObservation(ligne.id, event.target.value)
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
