import { Chip, type ChipProps } from '@mui/material';
import type { StockLevel } from '@/shared/lib/stock';

export type { StockLevel };

const styles: Record<
  StockLevel,
  { label: string; color: ChipProps['color']; variant: ChipProps['variant'] }
> = {
  healthy: { label: 'Disponible', color: 'success', variant: 'filled' },
  low: { label: 'Stock bajo', color: 'warning', variant: 'filled' },
  critical: { label: 'Agotado', color: 'error', variant: 'filled' },
  unknown: { label: 'Sin dato', color: 'default', variant: 'outlined' },
};

export interface StatusBadgeProps {
  level: StockLevel;
  /** Sobrescribe la etiqueta por defecto. */
  label?: string;
}

/**
 * Distintivo visual del nivel de stock.
 *
 * El color nunca es la unica senal: cada estado lleva tambien su texto, para
 * no depender solo de la percepcion del color (RNF-12).
 */
export function StatusBadge({ level, label }: StatusBadgeProps) {
  const style = styles[level];
  return (
    <Chip size="small" label={label ?? style.label} color={style.color} variant={style.variant} />
  );
}
