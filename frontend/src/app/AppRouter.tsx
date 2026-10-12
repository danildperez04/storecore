import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateLayout, RequireAdmin, RequireAuth } from './guards/RequireAuth';
import { LoginView } from '@/features/auth/views/LoginView';
import { DashboardView } from '@/features/dashboard/views/DashboardView';
import { CategoriesListView } from '@/features/categories';
import { SuppliersListView } from '@/features/suppliers';
import { ProductsListView } from '@/features/products';
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

          {/* El catálogo lo consulta cualquier usuario autenticado; solo el
              ADMIN puede escribir (el server valida los permisos de escritura
              en cada endpoint, esto es solo la vista). */}
          <Route path="productos" element={<ProductsListView />} />

          {/* Restringidas al ADMIN (RF-02). El server valida igual. */}
          <Route element={<RequireAdmin />}>
            <Route path="categorias" element={<CategoriesListView />} />
            <Route path="proveedores" element={<SuppliersListView />} />
          </Route>
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundView />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
