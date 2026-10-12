import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductFormDialog } from './ProductFormDialog';

/**
 * Primer `.test.tsx` del repo. Cubre el riesgo "Alto" de docs/12 §3
 * (validación de precios): el precio de venta debe ser mayor al de compra.
 *
 * Sin MSW todavía en el repo: se mockean los servicios directamente, igual
 * que `branches.service.spec.ts` mockea el repositorio en el backend.
 */

const mutateAsync = vi.fn().mockResolvedValue({ id: 1 });

vi.mock('@/app/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { branchId: number | null } }) => unknown) =>
    selector({ user: { branchId: null } }),
}));

vi.mock('@/shared/hooks/useBranchOptions', () => ({
  useBranchOptions: () => ({ data: [] }),
}));

vi.mock('@/features/categories/services/categories.service', () => ({
  useCategories: () => ({ data: { data: [{ id: 1, name: 'Bebidas' }] } }),
}));

vi.mock('@/features/suppliers/services/suppliers.service', () => ({
  useSuppliers: () => ({ data: { data: [] } }),
}));

vi.mock('../services/products.service', () => ({
  useCreateProduct: () => ({ mutateAsync }),
  useUpdateProduct: () => ({ mutateAsync: vi.fn() }),
}));

describe('ProductFormDialog', () => {
  it('bloquea el envío cuando el precio de venta no es mayor al de compra', async () => {
    // El resto del formulario debe quedar válido: en zod, el `.refine()` que
    // compara ambos precios no se evalúa si otro campo base (p. ej.
    // `categoryId`) ya falló, así que el caso se aísla completando todo lo demás.
    const user = userEvent.setup();
    render(<ProductFormDialog open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('SKU'), 'ABC-001');
    await user.type(screen.getByLabelText('Nombre'), 'Producto de prueba');
    await user.click(screen.getByLabelText('Categoría'));
    await user.click(await screen.findByText('Bebidas'));
    await user.type(screen.getByLabelText('Precio de compra'), '100');
    await user.type(screen.getByLabelText('Precio de venta'), '50');

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByText('El precio de venta debe ser mayor al precio de compra'),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('permite guardar cuando el precio de venta es mayor al de compra', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ProductFormDialog open onClose={onClose} />);

    await user.type(screen.getByLabelText('SKU'), 'ABC-002');
    await user.type(screen.getByLabelText('Nombre'), 'Producto válido');
    await user.click(screen.getByLabelText('Categoría'));
    await user.click(await screen.findByText('Bebidas'));
    await user.type(screen.getByLabelText('Precio de compra'), '100');
    await user.type(screen.getByLabelText('Precio de venta'), '150');

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });
});
