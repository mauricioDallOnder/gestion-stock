"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { LotStockFormValues, originesStock } from "@/types/estoque";
import { Produit } from "@/types/produto";
import { lotStockSchema } from "./estoqueSchema";
import { getLotDefaultValues, origineStockLabels } from "./estoqueUtils";

type LotStockFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  produits: Produit[];
  initialValues?: LotStockFormValues;
  onClose: () => void;
  onSubmit: (values: LotStockFormValues) => void;
};

type LotStockFormErrors = Partial<Record<keyof LotStockFormValues, string>>;

export function LotStockFormDialog({
  open,
  mode,
  produits,
  initialValues,
  onClose,
  onSubmit,
}: LotStockFormDialogProps) {
  const defaultValues = useMemo(() => getLotDefaultValues(), []);

  const [values, setValues] = useState<LotStockFormValues>(defaultValues);
  const [errors, setErrors] = useState<LotStockFormErrors>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? defaultValues);
      setErrors({});
    }
  }, [defaultValues, initialValues, open]);

  function handleChange<K extends keyof LotStockFormValues>(
    field: K,
    value: LotStockFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit() {
    const result = lotStockSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: LotStockFormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LotStockFormValues | undefined;
        if (field) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "create" ? "Nouvelle réception / lot" : "Modifier le lot"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            select
            label="Produit"
            value={values.produitId}
            onChange={(event) => handleChange("produitId", event.target.value)}
            error={Boolean(errors.produitId)}
            helperText={errors.produitId ?? "Sélectionnez la denrée."}
            fullWidth
            autoFocus
          >
            {produits
              .filter((produit) => produit.actif)
              .map((produit) => (
                <MenuItem key={produit.id} value={produit.id}>
                  {produit.nom}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            label="Quantité reçue"
            type="number"
            value={values.quantiteInitiale === 0 ? "" : values.quantiteInitiale}
            onChange={(event) => {
              const v = event.target.value;
              const quantite = v === "" ? 0 : Number(v);
              handleChange("quantiteInitiale", quantite);
              if (mode === "create") {
                handleChange("quantiteActuelle", quantite);
              }
            }}
            onFocus={(event) => event.target.select()}
            error={Boolean(errors.quantiteInitiale)}
            helperText={
              errors.quantiteInitiale ??
              "Quantité entrée en stock lors de cette réception."
            }
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />

          <TextField
            label="Quantité actuelle"
            type="number"
            value={values.quantiteActuelle === 0 ? "" : values.quantiteActuelle}
            onChange={(event) => {
              const v = event.target.value;
              handleChange("quantiteActuelle", v === "" ? 0 : Number(v));
            }}
            onFocus={(event) => event.target.select()}
            error={Boolean(errors.quantiteActuelle)}
            helperText={
              errors.quantiteActuelle ??
              "Solde physique encore disponible pour ce lot."
            }
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />

          <TextField
            label="Date de réception"
            type="date"
            value={values.dateReception}
            onChange={(event) =>
              handleChange("dateReception", event.target.value)
            }
            error={Boolean(errors.dateReception)}
            helperText={errors.dateReception ?? "Date d'entrée en stock."}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Date de péremption"
            type="date"
            value={values.dateValidite}
            onChange={(event) =>
              handleChange("dateValidite", event.target.value)
            }
            error={Boolean(errors.dateValidite)}
            helperText={
              errors.dateValidite ??
              "Obligatoire pour générer les alertes de péremption."
            }
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            select
            label="Origine"
            value={values.origine}
            onChange={(event) =>
              handleChange(
                "origine",
                event.target.value as LotStockFormValues["origine"]
              )
            }
            error={Boolean(errors.origine)}
            helperText={errors.origine ?? "Origine de l'entrée en stock."}
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
            onChange={(event) =>
              handleChange("observation", event.target.value)
            }
            error={Boolean(errors.observation)}
            helperText={
              errors.observation ??
              "Exemple : prioriser l'utilisation, divergence, ajustement manuel, etc."
            }
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === "create"
            ? "Enregistrer la réception"
            : "Enregistrer les modifications"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
