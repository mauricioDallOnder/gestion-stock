"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import {
  categoriesProduit,
  ProduitFormValues,
  unitesProduit,
} from "@/types/produto";
import { produitSchema } from "./produtoSchema";
import {
  categorieProduitLabels,
  getProduitDefaultValues,
  uniteProduitLabels,
} from "./produtoUtils";

type ProduitFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: ProduitFormValues;
  onClose: () => void;
  onSubmit: (values: ProduitFormValues) => void;
};

type ProduitFormErrors = Partial<Record<keyof ProduitFormValues, string>>;

export function ProduitFormDialog({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: ProduitFormDialogProps) {
  const defaultValues = useMemo(() => getProduitDefaultValues(), []);

  const [values, setValues] = useState<ProduitFormValues>(defaultValues);
  const [errors, setErrors] = useState<ProduitFormErrors>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? defaultValues);
      setErrors({});
    }
  }, [defaultValues, initialValues, open]);

  function handleChange<K extends keyof ProduitFormValues>(
    field: K,
    value: ProduitFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit() {
    const result = produitSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: ProduitFormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProduitFormValues | undefined;
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
        {mode === "create" ? "Nouveau produit" : "Modifier le produit"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            label="Nom du produit"
            value={values.nom}
            onChange={(event) => handleChange("nom", event.target.value)}
            error={Boolean(errors.nom)}
            helperText={errors.nom ?? "Exemple : Riz paquet 5 kg"}
            fullWidth
            autoFocus
          />

          <TextField
            select
            label="Unité"
            value={values.unite}
            onChange={(event) =>
              handleChange(
                "unite",
                event.target.value as ProduitFormValues["unite"]
              )
            }
            error={Boolean(errors.unite)}
            helperText={errors.unite ?? "Unité utilisée pour le suivi."}
            fullWidth
          >
            {unitesProduit.map((unite) => (
              <MenuItem key={unite} value={unite}>
                {uniteProduitLabels[unite]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Catégorie"
            value={values.categorie}
            onChange={(event) =>
              handleChange(
                "categorie",
                event.target.value as ProduitFormValues["categorie"]
              )
            }
            error={Boolean(errors.categorie)}
            helperText={
              errors.categorie ?? "Classification du produit alimentaire."
            }
            fullWidth
          >
            {categoriesProduit.map((categorie) => (
              <MenuItem key={categorie} value={categorie}>
                {categorieProduitLabels[categorie]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Stock minimum"
            type="number"
            value={values.stockMinimum === 0 ? "" : values.stockMinimum}
            onChange={(event) => {
              const v = event.target.value;
              handleChange("stockMinimum", v === "" ? 0 : Number(v));
            }}
            onFocus={(event) => event.target.select()}
            error={Boolean(errors.stockMinimum)}
            helperText={
              errors.stockMinimum ??
              "Quantité minimale avant déclenchement d'une alerte de stock faible."
            }
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={values.actif}
                onChange={(event) =>
                  handleChange("actif", event.target.checked)
                }
              />
            }
            label={values.actif ? "Produit actif" : "Produit inactif"}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === "create"
            ? "Enregistrer le produit"
            : "Enregistrer les modifications"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
