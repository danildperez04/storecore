import { z } from 'zod';

/** Esquema de validación de productos (RF-09, RF-10, capa cliente). */
export const productSchema = z
  .object({
    sku: z
      .string()
      .min(2, 'El SKU debe tener al menos 2 caracteres')
      .max(50, 'El SKU no puede exceder 50 caracteres'),
    barcode: z
      .string()
      .max(50, 'El código de barras no puede exceder 50 caracteres')
      .optional()
      .or(z.literal('')),
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(180, 'El nombre no puede exceder 180 caracteres'),
    description: z.string().optional().or(z.literal('')),
    categoryId: z.number('Selecciona una categoría'),
    supplierId: z.number().nullable().optional(),
    unit: z.enum(['UNIT', 'KG', 'LT'], 'Selecciona una unidad'),
    purchasePrice: z
      .number('El precio de compra es obligatorio')
      .min(0, 'El precio de compra no puede ser negativo'),
    salePrice: z
      .number('El precio de venta es obligatorio')
      .min(0, 'El precio de venta no puede ser negativo'),
    minStock: z.number().min(0, 'El stock mínimo no puede ser negativo').optional(),
    branchId: z.number().optional(),
    initialStock: z.number().min(0, 'El stock inicial no puede ser negativo').optional(),
  })
  .refine((data) => data.salePrice > data.purchasePrice, {
    message: 'El precio de venta debe ser mayor al precio de compra',
    path: ['salePrice'],
  });

export type ProductInput = z.infer<typeof productSchema>;
