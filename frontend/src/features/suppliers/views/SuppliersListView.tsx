import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Ban, Pencil, Plus, Truck } from 'lucide-react';
import { Button, EmptyState, PageHeader, TextField } from '@/design-system/ui';
import { useDeactivateSupplier, useSuppliers, type Supplier } from '../services/suppliers.service';
import { SupplierFormDialog } from '../components/SupplierFormDialog';

interface DialogState {
  open: boolean;
  supplier?: Supplier;
}

/** Catálogo de proveedores, con búsqueda, alta, edición y desactivación (RF-08). */
export function SuppliersListView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const { data, isLoading } = useSuppliers({ search: search || undefined, isActive: true });
  const deactivate = useDeactivateSupplier();
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });

  const suppliers = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Proveedores"
        description="Gestiona los proveedores habituales del catálogo."
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setDialogState({ open: true })}
          >
            Nuevo proveedor
          </Button>
        }
      />

      <Box sx={{ mb: 2, maxWidth: 360 }}>
        <TextField
          label="Buscar por nombre"
          value={search}
          onChange={(event) => {
            const next = event.target.value;
            setSearchParams((previous) => {
              const params = new URLSearchParams(previous);
              if (next) params.set('search', next);
              else params.delete('search');
              return params;
            });
          }}
        />
      </Box>

      {!isLoading && suppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Sin proveedores todavía"
          description="Registra el primer proveedor para asociarlo a tus productos."
          action={
            <Button variant="contained" onClick={() => setDialogState({ open: true })}>
              Nuevo proveedor
            </Button>
          }
        />
      ) : (
        <Stack
          divider={<Divider />}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {suppliers.map((supplier) => (
            <Stack
              key={supplier.id}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', px: 2, py: 1.25 }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {supplier.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {[supplier.contactName, supplier.phone].filter(Boolean).join(' · ') || '—'}
                </Typography>
              </Box>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => setDialogState({ open: true, supplier })}>
                  <Pencil size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Desactivar">
                <IconButton size="small" onClick={() => deactivate.mutate(supplier.id)}>
                  <Ban size={16} />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}

      <SupplierFormDialog
        open={dialogState.open}
        supplier={dialogState.supplier}
        onClose={() => setDialogState({ open: false })}
      />
    </>
  );
}
