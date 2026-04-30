import { z } from "zod";
import { originesStock } from "@/types/estoque";

export const lotStockSchema = z
  .object({
    produitId: z.string().min(1, "Sélectionnez un produit."),

    quantiteInitiale: z.coerce
      .number()
      .positive("La quantité reçue doit être supérieure à zéro.")
      .max(999999, "Quantité trop élevée."),

    quantiteActuelle: z.coerce
      .number()
      .min(0, "La quantité actuelle ne peut pas être négative.")
      .max(999999, "Quantité trop élevée."),

    dateReception: z.string().min(1, "Renseignez la date de réception."),

    dateValidite: z.string().min(1, "Renseignez la date de péremption."),

    origine: z.enum(originesStock),

    observation: z
      .string()
      .max(300, "L'observation doit contenir au maximum 300 caractères."),
  })
  .refine((data) => data.quantiteActuelle <= data.quantiteInitiale, {
    path: ["quantiteActuelle"],
    message: "La quantité actuelle ne peut pas dépasser la quantité reçue.",
  })
  .refine((data) => data.dateValidite >= data.dateReception, {
    path: ["dateValidite"],
    message: "La date de péremption ne peut pas être antérieure à la réception.",
  });

export type LotStockSchemaInput = z.infer<typeof lotStockSchema>;
