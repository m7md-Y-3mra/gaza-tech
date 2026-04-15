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
import { deleteLocationAction } from '../../actions';
import { LocationForm } from '../forms/LocationForm';
import type { Location } from '../../types';

interface LocationsTableProps {
  initialData: Location[];
}

export function LocationsTable({ initialData }: LocationsTableProps) {
  const t = useTranslations('CategoryLocation');
  const [data, setData] = useState<Location[]>(initialData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Location | undefined>(
    undefined
  );
  const [isPending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<Location>[]>(
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
        accessorKey: 'sort_order',
        header: t('table.sortOrder'),
        cell: ({ getValue }) => getValue() ?? '—',
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
              aria-label={t('editLocation')}
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
              aria-label={t('deleteLocation')}
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

  function handleFormSuccess(item: Location) {
    setData((prev) => {
      const exists = prev.some((l) => l.location_id === item.location_id);
      return exists
        ? prev.map((l) => (l.location_id === item.location_id ? item : l))
        : [...prev, item];
    });
    setFormOpen(false);
    setEditTarget(undefined);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.location_id;
    setDeleteTarget(undefined);

    startTransition(async () => {
      const result = await deleteLocationAction(targetId);
      if (!result.success) {
        if (result.code === 'LOCATION_IN_USE') {
          toast.error(t('delete.inUseDescription', { entity: t('locations') }));
        } else {
          toast.error(result.message);
        }
        return;
      }
      setData((prev) => prev.filter((l) => l.location_id !== targetId));
      toast.success(t('success.locationDeleted'));
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
          {t('addLocation')}
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
              {editTarget ? t('editLocation') : t('addLocation')}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <LocationForm
              location={editTarget}
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
