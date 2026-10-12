import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { TextField, Button, FormError, Autocomplete } from '@/design-system/ui';
import { ApiError } from '@/app/services/api';
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  type Category,
} from '../services/categories.service';
import { categorySchema, type CategoryInput } from '../schemas/category.schema';
import { collectDescendantIds, flattenCategoryTree } from '../lib/flatten-category-tree';

export interface CategoryFormDialogProps {
  open: boolean;
  /** Si viene, el diálogo edita esta categoría; si no, crea una nueva. */
  category?: Category;
  onClose: () => void;
}

/**
 * Crea o edita una categoría, con selector jerárquico de categoría padre (RF-07).
 *
 * El contenido solo se monta mientras `open` es verdadero, con `key` por
 * categoría: así cada apertura nace con sus propios valores iniciales, sin
 * necesitar un efecto que reinicie el formulario o el mensaje de error.
 */
export function CategoryFormDialog({ open, category, onClose }: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {open ? (
        <CategoryFormDialogContent
          key={category?.id ?? 'new'}
          category={category}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
}

function CategoryFormDialogContent({
  category,
  onClose,
}: {
  category?: Category;
  onClose: () => void;
}) {
  const { data: tree } = useCategoryTree();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      parentId: category?.parentId ?? null,
      icon: category?.icon ?? '',
    },
  });

  const excludedIds = category ? collectDescendantIds(category) : new Set<number>();
  const parentOptions = flattenCategoryTree(tree ?? [])
    .map((row) => row.category)
    .filter((candidate) => !excludedIds.has(candidate.id));

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const input = { ...values, icon: values.icon || undefined };
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, input });
      } else {
        await createCategory.mutateAsync(input);
      }
      onClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'No se pudo guardar la categoría.');
    }
  });

  return (
    <>
      <DialogTitle>{category ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
      <form onSubmit={onSubmit} noValidate>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              {...register('name')}
              label="Nombre"
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />

            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <Autocomplete
                  options={parentOptions}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={parentOptions.find((option) => option.id === field.value) ?? null}
                  onChange={(_event, value) => field.onChange(value?.id ?? null)}
                  label="Categoría padre (opcional)"
                />
              )}
            />

            <TextField
              {...register('icon')}
              label="Icono (opcional)"
              error={Boolean(errors.icon)}
              helperText={errors.icon?.message}
            />

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
