import { z } from 'zod';

/** Esquema de validación de categorías (RF-07, capa cliente). */
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres'),
  parentId: z.number().nullable().optional(),
  icon: z.string().max(50, 'El icono no puede exceder 50 caracteres').optional().or(z.literal('')),
});

export type CategoryInput = z.infer<typeof categorySchema>;
