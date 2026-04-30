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
import { LoteEstoqueFormValues, origensEstoque } from "@/types/estoque";
import { Produto } from "@/types/produto";
import { loteEstoqueSchema } from "./estoqueSchema";
import {
  getLotDefaultValues,
  origineStockLabels,
} from "./estoqueUtils";

type LoteEstoqueFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  produtos: Produto[];
  initialValues?: LoteEstoqueFormValues;
  onClose: () => void;
  onSubmit: (values: LoteEstoqueFormValues) => void;
};

type LoteEstoqueFormErrors = Partial<
  Record<keyof LoteEstoqueFormValues, string>
>;

export function LoteEstoqueFormDialog({
  open,
  mode,
  produtos,
  initialValues,
  onClose,
  onSubmit,
}: LoteEstoqueFormDialogProps) {
  const defaultValues = useMemo(() => getLotDefaultValues(), []);

  const [values, setValues] = useState<LoteEstoqueFormValues>(defaultValues);
  const [errors, setErrors] = useState<LoteEstoqueFormErrors>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? defaultValues);
      setErrors({});
    }
  }, [defaultValues, initialValues, open]);

  function handleChange<K extends keyof LoteEstoqueFormValues>(
    field: K,
    value: LoteEstoqueFormValues[K]
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
    const result = loteEstoqueSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: LoteEstoqueFormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoteEstoqueFormValues | undefined;

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
        {mode === "create" ? "Nouvelle réception / lot" : "Modifier le lot"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            select
            label="Produit"
            value={values.produtoId}
            onChange={(event) => handleChange("produtoId", event.target.value)}
            error={Boolean(errors.produtoId)}
            helperText={errors.produtoId ?? "Sélectionnez le produit alimentaire."}
            fullWidth
            autoFocus
          >
            {produtos
              .filter((produto) => produto.ativo)
              .map((produto) => (
                <MenuItem key={produto.id} value={produto.id}>
                  {produto.nome}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            label="Quantité reçue"
            type="number"
            value={values.quantidadeInicial}
            onChange={(event) => {
              const quantidade = Number(event.target.value);

              handleChange("quantidadeInicial", quantidade);

              if (mode === "create") {
                handleChange("quantidadeAtual", quantidade);
              }
            }}
            error={Boolean(errors.quantidadeInicial)}
            helperText={
              errors.quantidadeInicial ??
              "Quantité entrée en stock lors de cette réception."
            }
            fullWidth
            slotProps={{
              htmlInput: {
                min: 0,
                step: 1,
              },
            }}
          />

          <TextField
            label="Quantité actuelle"
            type="number"
            value={values.quantidadeAtual}
            onChange={(event) =>
              handleChange("quantidadeAtual", Number(event.target.value))
            }
            error={Boolean(errors.quantidadeAtual)}
            helperText={
              errors.quantidadeAtual ??
              "Solde physique encore disponible pour ce lot."
            }
            fullWidth
            slotProps={{
              htmlInput: {
                min: 0,
                step: 1,
              },
            }}
          />

          <TextField
            label="Date de réception"
            type="date"
            value={values.dataRecebimento}
            onChange={(event) =>
              handleChange("dataRecebimento", event.target.value)
            }
            error={Boolean(errors.dataRecebimento)}
            helperText={errors.dataRecebimento ?? "Date d’entrée en stock."}
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="Date de péremption"
            type="date"
            value={values.dataValidade}
            onChange={(event) => handleChange("dataValidade", event.target.value)}
            error={Boolean(errors.dataValidade)}
            helperText={
              errors.dataValidade ??
              "Obligatoire pour générer les alertes de péremption."
            }
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            select
            label="Origine"
            value={values.origem}
            onChange={(event) =>
              handleChange(
                "origem",
                event.target.value as LoteEstoqueFormValues["origem"]
              )
            }
            error={Boolean(errors.origem)}
            helperText={errors.origem ?? "Origine de l’entrée en stock."}
            fullWidth
          >
            {origensEstoque.map((origem) => (
              <MenuItem key={origem} value={origem}>
                {origineStockLabels[origem]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Observation"
            value={values.observacao}
            onChange={(event) => handleChange("observacao", event.target.value)}
            error={Boolean(errors.observacao)}
            helperText={
              errors.observacao ??
              "Exemple : prioriser l’utilisation, divergence, ajustement manuel, etc."
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
          {mode === "create" ? "Enregistrer la réception" : "Enregistrer les modifications"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}