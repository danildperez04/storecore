import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { Ban, Package, Pencil, Plus } from 'lucide-react';
import { Button, EmptyState, PageHeader } from '@/design-system/ui';
import { formatMoney } from '@/shared/lib/format';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useDeactivateProduct, useProducts, type Product } from '../services/products.service';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ProductsToolbar, type StatusFilter } from '../components/ProductsToolbar';

interface DialogState {
  open: boolean;
  product?: Product;
}

const DEFAULT_PAGE_SIZE = 20;

/**
 * Catálogo de productos (RF-09 a RF-12).
 *
 * Paginación en modo `server`: el backend ya pagina (`PaginationDto`), así que
 * traer todo el catálogo para paginar en memoria desperdiciaría ese trabajo y
 * no escalaría con un catálogo de varios miles de SKUs.
 */
export function ProductsListView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const deactivate = useDeactivateProduct();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const categoryId = searchParams.get('categoryId')
    ? Number(searchParams.get('categoryId'))
    : undefined;
  const supplierId = searchParams.get('supplierId')
    ? Number(searchParams.get('supplierId'))
    : undefined;
  const status = (searchParams.get('status') as StatusFilter | null) ?? 'active';
  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('pageSize') ?? DEFAULT_PAGE_SIZE);

  // El buscador se escribe de inmediato pero la consulta y la URL se
  // actualizan con retraso, para no disparar una petición por cada tecla.
  useEffect(() => {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (debouncedSearch) params.set('search', debouncedSearch);
        else params.delete('search');
        params.set('page', '1');
        return params;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const updateParam = (key: string, value: string | undefined) => {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);
      if (value) params.set(key, value);
      else params.delete(key);
      params.set('page', '1');
      return params;
    });
  };

  const isActive = status === 'all' ? undefined : status === 'active';

  const hasActiveFilters =
    Boolean(searchInput) ||
    categoryId !== undefined ||
    supplierId !== undefined ||
    status !== 'active';

  const handleClearAll = () => {
    setSearchInput('');
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);
      params.delete('search');
      params.delete('categoryId');
      params.delete('supplierId');
      params.delete('status');
      params.set('page', '1');
      return params;
    });
  };

  const { data, isLoading, isFetching } = useProducts({
    search: debouncedSearch || undefined,
    categoryId,
    supplierId,
    isActive,
    page,
    limit: pageSize,
  });

  const columns: GridColDef<Product>[] = [
    { field: 'sku', headerName: 'SKU', width: 120 },
    {
      field: 'barcode',
      headerName: 'Código de barras',
      width: 140,
      valueGetter: (_value, row) => row.barcode ?? '—',
    },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200 },
    {
      field: 'category',
      headerName: 'Categoría',
      width: 150,
      valueGetter: (_value, row) => row.category?.name ?? '—',
    },
    {
      field: 'supplier',
      headerName: 'Proveedor',
      width: 150,
      valueGetter: (_value, row) => row.supplier?.name ?? '—',
    },
    { field: 'unit', headerName: 'Unidad', width: 90 },
    {
      field: 'purchasePrice',
      headerName: 'Precio compra',
      width: 130,
      valueGetter: (_value, row) => formatMoney(row.purchasePrice),
    },
    {
      field: 'salePrice',
      headerName: 'Precio venta',
      width: 130,
      valueGetter: (_value, row) => formatMoney(row.salePrice),
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 110,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.isActive ? 'Activo' : 'Inactivo'}
          color={params.row.isActive ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Pencil size={16} />}
          label="Editar"
          onClick={() => setDialogState({ open: true, product: params.row })}
        />,
        ...(params.row.isActive
          ? [
              <GridActionsCellItem
                key="deactivate"
                icon={<Ban size={16} />}
                label="Desactivar"
                onClick={() => deactivate.mutate(params.row.id)}
              />,
            ]
          : []),
      ],
    },
  ];

  const isEmpty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <>
      <PageHeader
        title="Productos"
        description="El catálogo que el dueño carga para empezar a operar con inventario real."
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setDialogState({ open: true })}
          >
            Nuevo producto
          </Button>
        }
      />

      <ProductsToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        categoryId={categoryId}
        onCategoryChange={(id) => updateParam('categoryId', id ? String(id) : undefined)}
        supplierId={supplierId}
        onSupplierChange={(id) => updateParam('supplierId', id ? String(id) : undefined)}
        status={status}
        onStatusChange={(next) => updateParam('status', next === 'active' ? undefined : next)}
        onClearAll={hasActiveFilters ? handleClearAll : undefined}
      />

      {isEmpty ? (
        <EmptyState
          icon={Package}
          title="Sin productos todavía"
          description="Carga el primer producto para empezar a construir el catálogo."
          action={
            <Button variant="contained" onClick={() => setDialogState({ open: true })}>
              Nuevo producto
            </Button>
          }
        />
      ) : (
        <div style={{ height: 560, width: '100%' }}>
          <DataGrid
            rows={data?.data ?? []}
            columns={columns}
            getRowId={(row) => row.id}
            loading={isLoading || isFetching}
            paginationMode="server"
            rowCount={data?.total ?? 0}
            paginationModel={{ page: page - 1, pageSize }}
            onPaginationModelChange={(model) => {
              setSearchParams((previous) => {
                const params = new URLSearchParams(previous);
                params.set('page', String(model.page + 1));
                params.set('pageSize', String(model.pageSize));
                return params;
              });
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
          />
        </div>
      )}

      <ProductFormDialog
        open={dialogState.open}
        product={dialogState.product}
        onClose={() => setDialogState({ open: false })}
      />
    </>
  );
}
