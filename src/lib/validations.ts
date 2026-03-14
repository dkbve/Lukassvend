import { z } from "zod";

export const createRecordSchema = z.object({
  title: z
    .string()
    .min(2, "Titel skal være mindst 2 tegn")
    .max(200, "Titel må maks. være 200 tegn"),
  description: z
    .string()
    .min(10, "Beskrivelse skal være mindst 10 tegn")
    .max(5000, "Beskrivelse må maks. være 5000 tegn"),
  workAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
});

export const updateRecordSchema = createRecordSchema.partial();

export const createUnitSchema = z.object({
  name: z
    .string()
    .min(2, "Navn skal være mindst 2 tegn")
    .max(200, "Navn må maks. være 200 tegn"),
  address: z.string().max(500, "Adresse må maks. være 500 tegn").optional(),
});

export const updateUnitSchema = createUnitSchema.partial();

export const loginSchema = z.object({
  email: z.string().email("Ugyldig email-adresse"),
  password: z.string().min(6, "Adgangskode skal være mindst 6 tegn"),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
