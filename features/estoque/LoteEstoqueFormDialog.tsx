"use client";

import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import type { LotStockFormValues, OrigineStock } from "@/types/estoque";
import type { Produit } from "@/types/produto";

import { originesStock } from "@/types/estoque";
import {
  getLotDefaultValues,
  origineStockLabels,
} from "./estoqueUtils";

type LotStockFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  produits: Produit[];
  initialValues?: LotStockFormValues;
  onClose: () => void;
  onSubmit: (values: LotStockFormValues) => void;
};

type FormErrors = Partial<Record<keyof LotStockFormValues, string>>;

export function LotStockFormDialog({
  open,
  mode,
  produits,
  initialValues,
  onClose,
  onSubmit,
}: LotStockFormDialogProps) {
  const [values, setValues] = useState<LotStockFormValues>(
    initialValues ?? getLotDefaultValues()
  );

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;

    setValues(initialValues ?? getLotDefaultValues());
    setErrors({});
  }, [open, initialValues]);

  function updateField<K extends keyof LotStockFormValues>(
    field: K,
    value: LotStockFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!values.produitId) {
      nextErrors.produitId = "Sélectionnez un produit.";
    }

    if (values.numeroLot.trim().length > 80) {
      nextErrors.numeroLot =
        "Le numéro de lot doit contenir au maximum 80 caractères.";
    }

    if (!values.quantiteInitiale || values.quantiteInitiale <= 0) {
      nextErrors.quantiteInitiale =
        "La quantité reçue doit être supérieure à zéro.";
    }

    if (values.quantiteActuelle < 0) {
      nextErrors.quantiteActuelle =
        "La quantité actuelle ne peut pas être négative.";
    }

    if (values.quantiteActuelle > values.quantiteInitiale) {
      nextErrors.quantiteActuelle =
        "La quantité actuelle ne peut pas dépasser la quantité reçue.";
    }

    if (!values.dateReception) {
      nextErrors.dateReception = "Renseignez la date de réception.";
    }

    if (!values.dateValidite) {
      nextErrors.dateValidite = "Renseignez la date de péremption.";
    }

    if (
      values.dateReception &&
      values.dateValidite &&
      values.dateValidite < values.dateReception
    ) {
      nextErrors.dateValidite =
        "La date de péremption ne peut pas être antérieure à la réception.";
    }

    if (values.observation.length > 300) {
      nextErrors.observation =
        "L'observation doit contenir au maximum 300 caractères.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    onSubmit({
      ...values,
      numeroLot: values.numeroLot.trim(),
      observation: values.observation.trim(),
    });
  }

  const produitsActifs = produits.filter((produit) => produit.actif);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "create" ? "Nouvelle réception" : "Modifier le lot"}
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 1,
          }}
        >
          <TextField
            select
            label="Produit"
            value={values.produitId}
            onChange={(event) => updateField("produitId", event.target.value)}
            error={Boolean(errors.produitId)}
            helperText={errors.produitId}
            fullWidth
          >
            {produitsActifs.map((produit) => (
              <MenuItem key={produit.id} value={produit.id}>
                {produit.nom} — {produit.unite}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Numéro de lot"
            placeholder="Exemple : LOT-2026-001"
            value={values.numeroLot}
            onChange={(event) => updateField("numeroLot", event.target.value)}
            error={Boolean(errors.numeroLot)}
            helperText={
              errors.numeroLot ??
              "Champ facultatif. Utilisé pour identifier la réception ou le lot fournisseur."
            }
            fullWidth
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <TextField
              label="Quantité reçue"
              type="number"
              value={values.quantiteInitiale}
              onChange={(event) =>
                updateField("quantiteInitiale", Number(event.target.value))
              }
              error={Boolean(errors.quantiteInitiale)}
              helperText={errors.quantiteInitiale}
              fullWidth
            />

            <TextField
              label="Quantité actuelle"
              type="number"
              value={values.quantiteActuelle}
              onChange={(event) =>
                updateField("quantiteActuelle", Number(event.target.value))
              }
              error={Boolean(errors.quantiteActuelle)}
              helperText={errors.quantiteActuelle}
              fullWidth
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <TextField
              label="Date de réception"
              type="date"
              value={values.dateReception}
              onChange={(event) =>
                updateField("dateReception", event.target.value)
              }
              error={Boolean(errors.dateReception)}
              helperText={errors.dateReception}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Date de péremption"
              type="date"
              value={values.dateValidite}
              onChange={(event) =>
                updateField("dateValidite", event.target.value)
              }
              error={Boolean(errors.dateValidite)}
              helperText={errors.dateValidite}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <TextField
            select
            label="Origine"
            value={values.origine}
            onChange={(event) =>
              updateField("origine", event.target.value as OrigineStock)
            }
            fullWidth
          >
            {originesStock.map((origine) => (
              <MenuItem key={origine} value={origine}>
                {origineStockLabels[origine]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Observation"
            value={values.observation}
            onChange={(event) => updateField("observation", event.target.value)}
            error={Boolean(errors.observation)}
            helperText={errors.observation}
            multiline
            minRows={3}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>

        <Button variant="contained" onClick={handleSubmit}>
          {mode === "create" ? "Ajouter la réception" : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}