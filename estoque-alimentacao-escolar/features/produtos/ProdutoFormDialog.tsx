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
  categoriasProduto,
  ProdutoFormValues,
  unidadesProduto,
} from "@/types/produto";
import { produitSchema } from "./produtoSchema";
import {
  categoriaProdutoLabels,
  getProdutoDefaultValues,
  unidadeProdutoLabels,
} from "./produtoUtils";

type ProdutoFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: ProdutoFormValues;
  onClose: () => void;
  onSubmit: (values: ProdutoFormValues) => void;
};

type ProdutoFormErrors = Partial<Record<keyof ProdutoFormValues, string>>;

export function ProdutoFormDialog({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: ProdutoFormDialogProps) {
  const defaultValues = useMemo(() => getProdutoDefaultValues(), []);

  const [values, setValues] = useState<ProdutoFormValues>(defaultValues);
  const [errors, setErrors] = useState<ProdutoFormErrors>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? defaultValues);
      setErrors({});
    }
  }, [defaultValues, initialValues, open]);

  function handleChange<K extends keyof ProdutoFormValues>(
    field: K,
    value: ProdutoFormValues[K]
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

  function handleSubmit() {
    const result = produitSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: ProdutoFormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProdutoFormValues | undefined;

        if (field) {
          fieldErrors[field] = issue.message;
        }
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
            value={values.nome}
            onChange={(event) => handleChange("nome", event.target.value)}
            error={Boolean(errors.nome)}
            helperText={errors.nome ?? "Exemple : Riz paquet 5 kg"}
            fullWidth
            autoFocus
          />

          <TextField
            select
            label="Unité"
            value={values.unidade}
            onChange={(event) =>
              handleChange(
                "unidade",
                event.target.value as ProdutoFormValues["unidade"]
              )
            }
            error={Boolean(errors.unidade)}
            helperText={errors.unidade ?? "Unité utilisée dans le contrôle."}
            fullWidth
          >
            {unidadesProduto.map((unidade) => (
              <MenuItem key={unidade} value={unidade}>
                {unidadeProdutoLabels[unidade]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Catégorie"
            value={values.categoria}
            onChange={(event) =>
              handleChange(
                "categoria",
                event.target.value as ProdutoFormValues["categoria"]
              )
            }
            error={Boolean(errors.categoria)}
            helperText={
              errors.categoria ?? "Classification du produit alimentaire."
            }
            fullWidth
          >
            {categoriasProduto.map((categoria) => (
              <MenuItem key={categoria} value={categoria}>
                {categoriaProdutoLabels[categoria]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Stock minimum"
            type="number"
            value={values.estoqueMinimo}
            onChange={(event) =>
              handleChange("estoqueMinimo", Number(event.target.value))
            }
            error={Boolean(errors.estoqueMinimo)}
            helperText={
              errors.estoqueMinimo ??
              "Quantité minimale avant de générer une alerte de stock faible."
            }
            fullWidth
            slotProps={{
              htmlInput: {
                min: 0,
                step: 1,
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={values.ativo}
                onChange={(event) =>
                  handleChange("ativo", event.target.checked)
                }
              />
            }
            label={values.ativo ? "Produit actif" : "Produit inactif"}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>

        <Button onClick={handleSubmit} variant="contained">
          {mode === "create" ? "Enregistrer le produit" : "Enregistrer les modifications"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}