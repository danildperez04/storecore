import type { ReactNode } from 'react';
import MuiAutocomplete, {
  type AutocompleteProps as MuiAutocompleteProps,
} from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { TextField } from './TextField';

export type AutocompleteProps<T> = Omit<
  MuiAutocompleteProps<T, false, false, false>,
  'renderInput'
> & {
  label?: string;
  error?: boolean;
  helperText?: ReactNode;
  /** Ícono al inicio del campo, p. ej. para hacer juego con el ícono de la sección en la navegación. */
  startAdornment?: ReactNode;
};

/**
 * Selector con búsqueda para listas de catálogo (categoría, proveedor).
 *
 * Único, no múltiple ni `freeSolo`: los formularios de producto solo
 * necesitan elegir una opción existente, nunca escribir una nueva.
 */
export function Autocomplete<T>({
  label,
  error,
  helperText,
  loading,
  startAdornment,
  ...props
}: AutocompleteProps<T>) {
  return (
    <MuiAutocomplete
      size="small"
      fullWidth
      loading={loading}
      loadingText="Cargando…"
      noOptionsText="Sin resultados"
      {...props}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              startAdornment: startAdornment ?? params.slotProps.input.startAdornment,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
