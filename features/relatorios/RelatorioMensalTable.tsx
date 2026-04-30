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
import { ClotureMensuelle } from "@/types/fechamento";
import {
  calculerTotauxCloture,
  formaterDate,
  formaterNombre,
  getStatutLigneColor,
  moisLabels,
  statutClotureLabels,
  statutLigneLabels,
} from "@/features/fechamento/fechamentoUtils";

type RapportMensuelTableProps = {
  cloture: ClotureMensuelle;
};

export function RapportMensuelTable({ cloture }: RapportMensuelTableProps) {
  const totaux = calculerTotauxCloture(cloture.lignes);

  if (cloture.lignes.length === 0) {
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
        <Typography variant="h6">Aucune ligne dans cette clôture</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Ce mois ne contient aucune ligne de clôture enregistrée.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête du rapport */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Rapport de Clôture Mensuelle — {moisLabels[cloture.mois]} {cloture.annee}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
          Statut : {statutClotureLabels[cloture.statut]}
          {cloture.dateCloture
            ? ` · Clôturé le ${new Date(cloture.dateCloture).toLocaleDateString("fr-FR")}`
            : ""}
        </Typography>
      </Box>

      {/* Cartes de résumé */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: "Produits", valeur: totaux.totalProduits },
          { label: "Total reçu", valeur: formaterNombre(totaux.totalRecu) },
          {
            label: "Total consommé",
            valeur: formaterNombre(totaux.totalConsomme),
          },
          {
            label: "Stock final",
            valeur: formaterNombre(totaux.totalStockActuel),
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
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {item.valeur}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Alertes */}
      {totaux.totalIncoherences > 0 || totaux.totalStockFaible > 0 ? (
        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {totaux.totalIncoherences > 0 && (
            <Chip
              label={`${totaux.totalIncoherences} incohérence(s)`}
              color="error"
              size="small"
            />
          )}
          {totaux.totalStockFaible > 0 && (
            <Chip
              label={`${totaux.totalStockFaible} produit(s) à stock faible`}
              color="warning"
              size="small"
            />
          )}
        </Box>
      ) : null}

      {/* Tableau principal */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Denrée alimentaire
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Un.
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Stock préc.
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Reçu
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Stock compté
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Consommé
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Péremption proche
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Statut
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Observation
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {cloture.lignes.map((ligne) => (
              <TableRow
                key={ligne.id}
                hover
                sx={{
                  bgcolor:
                    ligne.statut === "incoherent"
                      ? "rgba(211, 47, 47, 0.06)"
                      : undefined,
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {ligne.produitNom}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {ligne.unite}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  {formaterNombre(ligne.stockAnterieur)}
                </TableCell>

                <TableCell align="right">
                  {formaterNombre(ligne.quantiteRecue)}
                </TableCell>

                <TableCell align="right">
                  {formaterNombre(ligne.stockActuelCompte)}
                </TableCell>

                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700 }}
                    color={
                      ligne.statut === "incoherent"
                        ? "error.main"
                        : "text.primary"
                    }
                  >
                    {formaterNombre(ligne.quantiteConsommee)}
                  </Typography>
                </TableCell>

                <TableCell>{formaterDate(ligne.validitePlusProche)}</TableCell>

                <TableCell>
                  <Chip
                    label={statutLigneLabels[ligne.statut]}
                    color={getStatutLigneColor(ligne.statut)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {ligne.observation || "—"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell colSpan={2}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Totaux
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formaterNombre(totaux.totalStockAnterieur)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formaterNombre(totaux.totalRecu)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formaterNombre(totaux.totalStockActuel)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formaterNombre(totaux.totalConsomme)}
                </Typography>
              </TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Pied de page */}
      <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary">
          Généré le {new Date().toLocaleString("fr-FR")} · Système de Contrôle
          de la Restauration Scolaire
        </Typography>
      </Box>
    </Box>
  );
}
