import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateLayout, RequireAdmin, RequireAuth } from './guards/RequireAuth';
import { LoginView } from '@/features/auth/views/LoginView';
import { DashboardView } from '@/features/dashboard/views/DashboardView';
import { NotFoundView } from './views/NotFoundView';

/**
 * Rutas de la aplicacion.
 *
 * Las vistas de cada modulo de negocio se registran a medida que se
 * implementan (Sprint 1 en adelante). El esqueleto del Sprint 0 cubre
 * autenticacion, layout y dashboard.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />

      <Route element={<RequireAuth />}>
        <Route element={<PrivateLayout />}>
          <Route index element={<DashboardView />} />

          {/* Restringidas al ADMIN (RF-02). El server valida igual. */}
          <Route element={<RequireAdmin />}>
            <Route path="sucursales" element={<DashboardView />} />
            <Route path="usuarios" element={<DashboardView />} />
            <Route path="compras" element={<DashboardView />} />
            <Route path="proveedores" element={<DashboardView />} />
            <Route path="clientes" element={<DashboardView />} />
            <Route path="reportes" element={<DashboardView />} />
          </Route>
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundView />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
