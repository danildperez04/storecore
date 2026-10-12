import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProductsListView } from './ProductsListView';

/**
 * Cubre el riesgo "Alto" de docs/12 §3 (búsqueda): escribir en el buscador
 * debe terminar por enviarse como filtro a `useProducts`, con el retraso del
 * debounce de por medio.
 */

const useProductsMock = vi.fn().mockReturnValue({
  data: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 },
  isLoading: false,
  isFetching: false,
});

vi.mock('../services/products.service', () => ({
  useProducts: (...args: unknown[]) => useProductsMock(...args),
  useDeactivateProduct: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/features/categories/services/categories.service', () => ({
  useCategories: () => ({ data: { data: [] } }),
}));

vi.mock('@/features/suppliers/services/suppliers.service', () => ({
  useSuppliers: () => ({ data: { data: [] } }),
}));

describe('ProductsListView', () => {
  it('escribir en el buscador actualiza el filtro de búsqueda enviado a useProducts', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProductsListView />
      </MemoryRouter>,
    );

    const searchInput = screen.getByLabelText('Buscar');
    await user.type(searchInput, 'coca');

    await waitFor(() =>
      expect(useProductsMock).toHaveBeenCalledWith(expect.objectContaining({ search: 'coca' })),
    );
  });

  it('muestra el estado vacío cuando no hay productos', () => {
    render(
      <MemoryRouter>
        <ProductsListView />
      </MemoryRouter>,
    );

    expect(screen.getByText('Sin productos todavía')).toBeInTheDocument();
  });
});
