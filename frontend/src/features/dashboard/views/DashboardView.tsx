import { Grid, Stack, Typography } from '@mui/material';
import { PageHeader, StatCard } from '@/design-system/ui';
import { AlertTriangle, Boxes, Receipt, ShoppingCart, Truck, Users } from 'lucide-react';

/**
 * Dashboard del dueño (RF-43).
 *
 * Los indicadores reales llegan del endpoint de reportes en el Sprint 6. En el
 * Sprint 0 la vista muestra la estructura con valores de ejemplo marcados como
 * tales, para no presentar como dato real lo que aún no existe.
 */
export function DashboardView() {
  return (
    <>
      <PageHeader title="Inicio" description="Resumen de la operación de la tienda" />

      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Ventas de hoy"
              value="—"
              hint="Disponible en el Sprint 6"
              icon={ShoppingCart}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Tickets de hoy"
              value="—"
              hint="Disponible en el Sprint 6"
              icon={Receipt}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Productos bajo mínimo"
              value="—"
              hint="Disponible en el Sprint 2"
              icon={AlertTriangle}
              tone="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Adeudos pendientes"
              value="—"
              hint="Disponible en el Sprint 5"
              icon={Users}
              tone="error"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <StatCard
              label="Inventario"
              value="Sin cargar"
              hint="El catálogo se carga en el Sprint 1"
              icon={Boxes}
              tone="neutral"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <StatCard
              label="Compras pendientes"
              value="—"
              hint="Disponible en el Sprint 4"
              icon={Truck}
              tone="neutral"
            />
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary">
          Los indicadores mostrados se activan por sprint. Consulta{' '}
          <code>docs/08-plan-desarrollo.md</code> para el calendario completo.
        </Typography>
      </Stack>
    </>
  );
}
