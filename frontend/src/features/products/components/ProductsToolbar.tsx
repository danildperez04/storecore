import { Box, Divider, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Search, Tag, Truck, X } from 'lucide-react';
import { Autocomplete, Button, TextField } from '@/design-system/ui';
import { useCategories } from '@/features/categories/services/categories.service';
import { useSuppliers } from '@/features/suppliers/services/suppliers.service';

export type StatusFilter = 'active' | 'inactive' | 'all';

export interface ProductsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: number | undefined;
  onCategoryChange: (id: number | undefined) => void;
  supplierId: number | undefined;
  onSupplierChange: (id: number | undefined) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  /** Se muestra solo cuando hay algo que limpiar. */
  onClearAll?: () => void;
}

/**
 * Búsqueda y filtros del catálogo de productos (RF-11).
 *
 * Una sola superficie de control, no cuatro campos sueltos: el buscador
 * lidera porque es la acción que más se usa en el mostrador, y los selectores
 * de categoría/proveedor llevan los mismos íconos que esas secciones tienen
 * en la navegación, para que se reconozcan de un vistazo.
 */
export function ProductsToolbar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  supplierId,
  onSupplierChange,
  status,
  onStatusChange,
  onClearAll,
}: ProductsToolbarProps) {
  const { data: categories } = useCategories({ isActive: true, limit: 100 });
  const { data: suppliers } = useSuppliers({ isActive: true, limit: 100 });
  const categoryOptions = categories?.data ?? [];
  const supplierOptions = suppliers?.data ?? [];

  return (
    <Box
      sx={(theme) => ({
        mb: 2,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      })}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        divider={
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
        }
        sx={{ alignItems: { md: 'center' } }}
      >
        <TextField
          label="Buscar"
          placeholder="Nombre, SKU o código de barras"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          sx={{ flexGrow: 1, minWidth: { md: 220 } }}
          slotProps={{
            input: {
              startAdornment: <Search size={17} style={{ opacity: 0.55 }} />,
              endAdornment: search ? (
                <Box
                  component="button"
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => onSearchChange('')}
                  sx={{
                    display: 'inline-flex',
                    border: 'none',
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    color: 'text.secondary',
                    p: 0.5,
                    borderRadius: '50%',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <X size={15} />
                </Box>
              ) : undefined,
            },
          }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexGrow: 1 }}>
          <Autocomplete
            options={categoryOptions}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={categoryOptions.find((option) => option.id === categoryId) ?? null}
            onChange={(_event, value) => onCategoryChange(value?.id)}
            label="Categoría"
            startAdornment={<Tag size={16} style={{ opacity: 0.55 }} />}
            sx={{ minWidth: { sm: 180 } }}
          />
          <Autocomplete
            options={supplierOptions}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={supplierOptions.find((option) => option.id === supplierId) ?? null}
            onChange={(_event, value) => onSupplierChange(value?.id)}
            label="Proveedor"
            startAdornment={<Truck size={16} style={{ opacity: 0.55 }} />}
            sx={{ minWidth: { sm: 180 } }}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <ToggleButtonGroup
            size="small"
            exclusive
            value={status}
            onChange={(_event, value: StatusFilter | null) => {
              if (value) onStatusChange(value);
            }}
          >
            <ToggleButton
              value="active"
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  '&:hover': { bgcolor: 'success.dark' },
                },
              }}
            >
              Activos
            </ToggleButton>
            <ToggleButton value="inactive">Inactivos</ToggleButton>
            <ToggleButton value="all">Todos</ToggleButton>
          </ToggleButtonGroup>

          {onClearAll ? (
            <Button
              size="small"
              color="inherit"
              onClick={onClearAll}
              sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
            >
              Limpiar
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
