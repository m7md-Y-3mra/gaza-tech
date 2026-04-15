'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Pencil, Trash2, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteCategoryAction } from '../../actions';
import { CategoryForm } from '../forms/CategoryForm';
import type { MarketplaceCategory } from '../../types';

interface CategoriesTableProps {
  initialData: MarketplaceCategory[];
}

export function CategoriesTable({ initialData }: CategoriesTableProps) {
  const t = useTranslations('CategoryLocation');
  const [data, setData] = useState<MarketplaceCategory[]>(initialData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MarketplaceCategory | undefined>(
    undefined
  );
  const [deleteTarget, setDeleteTarget] = useState<
    MarketplaceCategory | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<MarketplaceCategory>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('table.name'),
      },
      {
        accessorKey: 'name_ar',
        header: t('table.name_ar'),
      },
      {
        accessorKey: 'slug',
        header: t('table.slug'),
      },
      {
        accessorKey: 'is_active',
        header: t('table.status'),
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge variant="default">{t('table.active')}</Badge>
          ) : (
            <Badge variant="secondary">{t('table.inactive')}</Badge>
          ),
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('editCategory')}
              onClick={() => {
                setEditTarget(row.original);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('deleteCategory')}
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="text-destructive h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  function handleFormSuccess(item: MarketplaceCategory) {
    setData((prev) => {
      const exists = prev.some(
        (c) => c.marketplace_category_id === item.marketplace_category_id
      );
      return exists
        ? prev.map((c) =>
            c.marketplace_category_id === item.marketplace_category_id
              ? item
              : c
          )
        : [...prev, item];
    });
    setFormOpen(false);
    setEditTarget(undefined);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.marketplace_category_id;
    setDeleteTarget(undefined);

    startTransition(async () => {
      const result = await deleteCategoryAction(targetId);
      if (!result.success) {
        if (result.code === 'CATEGORY_IN_USE') {
          toast.error(
            t('delete.inUseDescription', { entity: t('categories') })
          );
        } else {
          toast.error(result.message);
        }
        return;
      }
      setData((prev) =>
        prev.filter((c) => c.marketplace_category_id !== targetId)
      );
      toast.success(t('success.categoryDeleted'));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('table.searchPlaceholder')}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
            aria-label={t('table.searchPlaceholder')}
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGlobalFilter('')}
              aria-label={t('table.clearFilters')}
            >
              <X className="me-1 h-4 w-4" />
              {t('table.clearFilters')}
            </Button>
          )}
        </div>
        <Button
          onClick={() => {
            setEditTarget(undefined);
            setFormOpen(true);
          }}
        >
          <PlusCircle className="me-2 h-4 w-4" />
          {t('addCategory')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground py-8 text-center"
                >
                  {t('table.noResults')}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditTarget(undefined);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? t('editCategory') : t('addCategory')}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <CategoryForm
              category={editTarget}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setFormOpen(false);
                setEditTarget(undefined);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('delete.confirmTitle', {
                name: deleteTarget?.name ?? '',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.confirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
