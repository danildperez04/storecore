import { useState } from 'react';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Ban, Pencil, Plus, Tag } from 'lucide-react';
import { Button, EmptyState, PageHeader } from '@/design-system/ui';
import { useCategoryTree, useDeactivateCategory } from '../services/categories.service';
import type { Category } from '../services/categories.service';
import { flattenCategoryTree } from '../lib/flatten-category-tree';
import { CategoryFormDialog } from '../components/CategoryFormDialog';

interface DialogState {
  open: boolean;
  category?: Category;
}

/** Catálogo de categorías en árbol, con alta, edición y desactivación (RF-07). */
export function CategoriesListView() {
  const { data: tree, isLoading } = useCategoryTree();
  const deactivate = useDeactivateCategory();
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });

  const rows = flattenCategoryTree(tree ?? []);

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organiza el catálogo en categorías y subcategorías."
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setDialogState({ open: true })}
          >
            Nueva categoría
          </Button>
        }
      />

      {!isLoading && rows.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Sin categorías todavía"
          description="Crea la primera categoría para empezar a clasificar el catálogo."
          action={
            <Button variant="contained" onClick={() => setDialogState({ open: true })}>
              Nueva categoría
            </Button>
          }
        />
      ) : (
        <Stack
          divider={<Divider />}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {rows.map(({ category, depth }) => (
            <Stack
              key={category.id}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', px: 2, py: 1.25, pl: 2 + depth * 3 }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {category.name}
                </Typography>
                {!category.isActive ? (
                  <Typography variant="caption" color="text.secondary">
                    Inactiva
                  </Typography>
                ) : null}
              </Box>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => setDialogState({ open: true, category })}>
                  <Pencil size={16} />
                </IconButton>
              </Tooltip>
              {category.isActive ? (
                <Tooltip title="Desactivar">
                  <IconButton size="small" onClick={() => deactivate.mutate(category.id)}>
                    <Ban size={16} />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Stack>
          ))}
        </Stack>
      )}

      <CategoryFormDialog
        open={dialogState.open}
        category={dialogState.category}
        onClose={() => setDialogState({ open: false })}
      />
    </>
  );
}
