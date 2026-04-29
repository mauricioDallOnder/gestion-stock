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
  getLoteDefaultValues,
  origemEstoqueLabels,
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
  const defaultValues = useMemo(() => getLoteDefaultValues(), []);

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
        {mode === "create" ? "Novo recebimento / lote" : "Editar lote"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            select
            label="Produto"
            value={values.produtoId}
            onChange={(event) => handleChange("produtoId", event.target.value)}
            error={Boolean(errors.produtoId)}
            helperText={errors.produtoId ?? "Selecione o gênero alimentício."}
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
            label="Quantidade recebida"
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
              "Quantidade que entrou no estoque neste recebimento."
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
            label="Quantidade atual"
            type="number"
            value={values.quantidadeAtual}
            onChange={(event) =>
              handleChange("quantidadeAtual", Number(event.target.value))
            }
            error={Boolean(errors.quantidadeAtual)}
            helperText={
              errors.quantidadeAtual ??
              "Saldo físico ainda existente deste lote."
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
            label="Data de recebimento"
            type="date"
            value={values.dataRecebimento}
            onChange={(event) =>
              handleChange("dataRecebimento", event.target.value)
            }
            error={Boolean(errors.dataRecebimento)}
            helperText={errors.dataRecebimento ?? "Data de entrada no estoque."}
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="Data de validade"
            type="date"
            value={values.dataValidade}
            onChange={(event) => handleChange("dataValidade", event.target.value)}
            error={Boolean(errors.dataValidade)}
            helperText={
              errors.dataValidade ??
              "Obrigatório para gerar alertas de vencimento."
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
            label="Origem"
            value={values.origem}
            onChange={(event) =>
              handleChange(
                "origem",
                event.target.value as LoteEstoqueFormValues["origem"]
              )
            }
            error={Boolean(errors.origem)}
            helperText={errors.origem ?? "Origem da entrada no estoque."}
            fullWidth
          >
            {origensEstoque.map((origem) => (
              <MenuItem key={origem} value={origem}>
                {origemEstoqueLabels[origem]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Observação"
            value={values.observacao}
            onChange={(event) => handleChange("observacao", event.target.value)}
            error={Boolean(errors.observacao)}
            helperText={
              errors.observacao ??
              "Exemplo: priorizar uso, divergência, ajuste manual etc."
            }
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>

        <Button onClick={handleSubmit} variant="contained">
          {mode === "create" ? "Registrar recebimento" : "Salvar alterações"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}