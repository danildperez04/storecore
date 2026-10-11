import { forwardRef } from 'react';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { TextField } from './TextField';

export interface NumberFieldProps extends Omit<
  MuiTextFieldProps,
  'type' | 'value' | 'onChange' | 'slotProps'
> {
  value: string;
  onChange: (value: string) => void;
  /** Decimales permitidos: 2 para dinero, 3 para cantidad. */
  decimals?: number;
}

/**
 * Campo numérico controlado.
 *
 * No usa `type="number"`: su comportamiento con decimales y separadores
 * varía entre navegadores. Se usa `inputMode="decimal"` y se filtra el texto
 * a mano, para que el valor que llega al formulario sea siempre un string
 * numérico limpio, listo para `Number()` o para enviarse a la API.
 */
export const NumberField = forwardRef<HTMLDivElement, NumberFieldProps>(function NumberField(
  { value, onChange, decimals = 2, ...props },
  ref,
) {
  const pattern = decimals > 0 ? new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`) : /^\d*$/;

  return (
    <TextField
      ref={ref}
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        if (next === '' || pattern.test(next)) onChange(next);
      }}
      slotProps={{ htmlInput: { inputMode: 'decimal' } }}
      {...props}
    />
  );
});
