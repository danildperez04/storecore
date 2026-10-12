import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { TextField, Button, FormError } from '@/design-system/ui';
import { ApiError } from '@/app/services/api';
import { useCreateSupplier, useUpdateSupplier, type Supplier } from '../services/suppliers.service';
import { supplierSchema, type SupplierInput } from '../schemas/supplier.schema';

export interface SupplierFormDialogProps {
  open: boolean;
  /** Si viene, el diálogo edita este proveedor; si no, crea uno nuevo. */
  supplier?: Supplier;
  onClose: () => void;
}

/**
 * Crea o edita un proveedor (RF-08).
 *
 * El contenido solo se monta mientras `open` es verdadero, con `key` por
 * proveedor: así cada apertura nace con sus propios valores iniciales, sin
 * necesitar un efecto que reinicie el formulario o el mensaje de error.
 */
export function SupplierFormDialog({ open, supplier, onClose }: SupplierFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {open ? (
        <SupplierFormDialogContent
          key={supplier?.id ?? 'new'}
          supplier={supplier}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
}

function SupplierFormDialogContent({
  supplier,
  onClose,
}: {
  supplier?: Supplier;
  onClose: () => void;
}) {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? '',
      contactName: supplier?.contactName ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      address: supplier?.address ?? '',
      notes: supplier?.notes ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const input: SupplierInput = {
      name: values.name,
      contactName: values.contactName || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
      notes: values.notes || undefined,
    };
    try {
      if (supplier) {
        await updateSupplier.mutateAsync({ id: supplier.id, input });
      } else {
        await createSupplier.mutateAsync(input);
      }
      onClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'No se pudo guardar el proveedor.');
    }
  });

  return (
    <>
      <DialogTitle>{supplier ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
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
            <TextField
              {...register('contactName')}
              label="Contacto (opcional)"
              error={Boolean(errors.contactName)}
              helperText={errors.contactName?.message}
            />
            <TextField
              {...register('phone')}
              label="Teléfono (opcional)"
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
            />
            <TextField
              {...register('email')}
              label="Correo (opcional)"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <TextField
              {...register('address')}
              label="Dirección (opcional)"
              error={Boolean(errors.address)}
              helperText={errors.address?.message}
            />
            <TextField
              {...register('notes')}
              label="Notas (opcional)"
              multiline
              minRows={2}
              error={Boolean(errors.notes)}
              helperText={errors.notes?.message}
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
