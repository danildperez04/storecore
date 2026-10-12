import { z } from 'zod';

/** Esquema de validación de proveedores (RF-08, capa cliente). */
export const supplierSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  contactName: z
    .string()
    .max(120, 'El contacto no puede exceder 120 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  email: z.string().email('El correo no es válido').optional().or(z.literal('')),
  address: z
    .string()
    .max(255, 'La dirección no puede exceder 255 caracteres')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
