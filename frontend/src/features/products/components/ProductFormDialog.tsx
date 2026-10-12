import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { Autocomplete, Button, FormError, NumberField, TextField } from '@/design-system/ui';
import { ApiError } from '@/app/services/api';
import { useAuthStore } from '@/app/stores/auth.store';
import { useBranchOptions } from '@/shared/hooks/useBranchOptions';
import { useCategories } from '@/features/categories/services/categories.service';
import { useSuppliers } from '@/features/suppliers/services/suppliers.service';
import { productSchema, type ProductInput } from '../schemas/product.schema';
import { useCreateProduct, useUpdateProduct, type Product } from '../services/products.service';

const UNIT_OPTIONS = [
  { value: 'UNIT', label: 'Unidad' },
  { value: 'KG', label: 'Kilogramo' },
  { value: 'LT', label: 'Litro' },
] as const;

export interface ProductFormDialogProps {
  open: boolean;
  /** Si viene, el diálogo edita este producto; si no, crea uno nuevo. */
  product?: Product;
  onClose: () => void;
}

/**
 * Crea o edita un producto (RF-09, RF-10, RF-12).
 *
 * El contenido solo se monta mientras `open` es verdadero, con `key` por
 * producto: así cada apertura nace con sus propios valores iniciales, sin
 * necesitar un efecto que reinicie el formulario o el mensaje de error.
 * `branchId`/`initialStock` solo se muestran al crear: ajustar el stock de un
 * producto existente es tarea del módulo de inventario (Sprint 2).
 */
export function ProductFormDialog({ open, product, onClose }: ProductFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {open ? (
        <ProductFormDialogContent key={product?.id ?? 'new'} product={product} onClose={onClose} />
      ) : null}
    </Dialog>
  );
}

function ProductFormDialogContent({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const isEditing = Boolean(product);
  const currentBranchId = useAuthStore((state) => state.user?.branchId);
  const { data: categories } = useCategories({ isActive: true, limit: 100 });
  const { data: suppliers } = useSuppliers({ isActive: true, limit: 100 });
  const { data: branches } = useBranchOptions();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: product?.sku ?? '',
      barcode: product?.barcode ?? '',
      name: product?.name ?? '',
      description: product?.description ?? '',
      categoryId: product?.categoryId,
      supplierId: product?.supplierId ?? null,
      unit: product?.unit ?? 'UNIT',
      purchasePrice: product ? Number(product.purchasePrice) : 0,
      salePrice: product ? Number(product.salePrice) : 0,
      minStock: product ? Number(product.minStock) : 0,
      branchId: currentBranchId ?? undefined,
      initialStock: 0,
    },
  });

  const categoryOptions = categories?.data ?? [];
  const supplierOptions = suppliers?.data ?? [];
  const branchOptions = branches ?? [];

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          input: {
            sku: values.sku,
            barcode: values.barcode || undefined,
            name: values.name,
            description: values.description || undefined,
            categoryId: values.categoryId,
            supplierId: values.supplierId,
            unit: values.unit,
            purchasePrice: values.purchasePrice,
            salePrice: values.salePrice,
            minStock: values.minStock,
          },
        });
      } else {
        await createProduct.mutateAsync({
          ...values,
          barcode: values.barcode || undefined,
          description: values.description || undefined,
        });
      }
      onClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'No se pudo guardar el producto.');
    }
  });

  return (
    <>
      <DialogTitle>{product ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
      <form onSubmit={onSubmit} noValidate>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              {...register('sku')}
              label="SKU"
              autoFocus
              error={Boolean(errors.sku)}
              helperText={errors.sku?.message}
            />
            <TextField
              {...register('barcode')}
              label="Código de barras (opcional)"
              error={Boolean(errors.barcode)}
              helperText={errors.barcode?.message}
            />
            <TextField
              {...register('name')}
              label="Nombre"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('description')}
              label="Descripción (opcional)"
              multiline
              minRows={2}
            />

            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Autocomplete
                  options={categoryOptions}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={categoryOptions.find((option) => option.id === field.value) ?? null}
                  onChange={(_event, value) => field.onChange(value?.id)}
                  label="Categoría"
                  error={Boolean(errors.categoryId)}
                  helperText={errors.categoryId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="supplierId"
              render={({ field }) => (
                <Autocomplete
                  options={supplierOptions}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={supplierOptions.find((option) => option.id === field.value) ?? null}
                  onChange={(_event, value) => field.onChange(value?.id ?? null)}
                  label="Proveedor (opcional)"
                />
              )}
            />

            <TextField
              {...register('unit')}
              label="Unidad"
              select
              error={Boolean(errors.unit)}
              helperText={errors.unit?.message}
            >
              {UNIT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={2}>
              <Controller
                control={control}
                name="purchasePrice"
                render={({ field }) => (
                  <NumberField
                    label="Precio de compra"
                    decimals={2}
                    value={String(field.value ?? '')}
                    onChange={(value) => field.onChange(value === '' ? undefined : Number(value))}
                    error={Boolean(errors.purchasePrice)}
                    helperText={errors.purchasePrice?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="salePrice"
                render={({ field }) => (
                  <NumberField
                    label="Precio de venta"
                    decimals={2}
                    value={String(field.value ?? '')}
                    onChange={(value) => field.onChange(value === '' ? undefined : Number(value))}
                    error={Boolean(errors.salePrice)}
                    helperText={errors.salePrice?.message}
                  />
                )}
              />
            </Stack>

            <Controller
              control={control}
              name="minStock"
              render={({ field }) => (
                <NumberField
                  label="Stock mínimo (opcional)"
                  decimals={3}
                  value={String(field.value ?? '')}
                  onChange={(value) => field.onChange(value === '' ? undefined : Number(value))}
                />
              )}
            />

            {!isEditing ? (
              <>
                <Divider />
                <Typography variant="subtitle2">Stock inicial (opcional)</Typography>
                <Controller
                  control={control}
                  name="branchId"
                  render={({ field }) => (
                    <Autocomplete
                      options={branchOptions}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={branchOptions.find((option) => option.id === field.value) ?? null}
                      onChange={(_event, value) => field.onChange(value?.id)}
                      label="Sucursal"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="initialStock"
                  render={({ field }) => (
                    <NumberField
                      label="Cantidad inicial"
                      decimals={3}
                      value={String(field.value ?? '')}
                      onChange={(value) => field.onChange(value === '' ? undefined : Number(value))}
                    />
                  )}
                />
              </>
            ) : null}

            <FormError message={formError} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </>
  );
}
