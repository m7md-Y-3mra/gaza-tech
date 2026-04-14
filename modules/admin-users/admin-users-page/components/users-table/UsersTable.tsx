'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from './constants';
import { flexRender } from '@tanstack/react-table';
import type { AdminUserListResult } from '@/modules/admin-users/types';
import { UsersTableToolbar } from '@/modules/admin-users/components/users-table-toolbar/UsersTableToolbar';
import { BulkActionBar } from '@/modules/admin-users/components/bulk-action-bar';
import { useUsersTable } from './hooks/useUsersTable';

interface UsersTableProps {
  initialData: AdminUserListResult;
  currentAdminUserId: string;
}

export function UsersTable({
  initialData,
  currentAdminUserId,
}: UsersTableProps) {
  const t = useTranslations('AdminUsers');
  const { table, isLoading, error, refetch, resetFilters, setParams, params } =
    useUsersTable({ initialData, currentAdminUserId });

  const hasSelection = Object.keys(table.getState().rowSelection).length > 0;

  return (
    <div className="space-y-4" data-testid="users-table">
      <UsersTableToolbar
        table={table}
        q={params.q}
        role={params.role}
        status={params.status}
        setParams={setParams as (params: Record<string, unknown>) => void}
        resetFilters={resetFilters}
      />

      <div className="overflow-x-auto rounded-md border">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="text-destructive text-sm">{t('error.title')}</p>
            <Button size="sm" variant="outline" onClick={refetch}>
              {t('error.retry')}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: params.size }).map((_, i) => (
                  <TableRow key={i}>
                    {table
                      .getAllColumns()
                      .filter((c) => c.getIsVisible())
                      .map((col) => (
                        <TableCell key={col.id}>
                          <div className="bg-muted h-4 animate-pulse rounded" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium">{t('empty.title')}</p>
                      <p className="text-muted-foreground text-sm">
                        {t('empty.description')}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetFilters}
                      >
                        {t('filters.reset')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
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
        )}
      </div>

      {/* Pagination with PAGE_SIZE_OPTIONS [10,20,50,100] — not reset by Reset Filters (T036) */}
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} / {params.size} rows
          selected
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rows per page</span>
            <Select
              value={`${params.size}`}
              onValueChange={(v) => {
                setParams({ size: Number(v), page: 0 });
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={`${s}`}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {params.page + 1} of{' '}
            {Math.max(1, Math.ceil(table.getPageCount()))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setParams({ page: 0 })}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">First page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setParams({ page: params.page - 1 })}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setParams({ page: params.page + 1 })}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setParams({ page: table.getPageCount() - 1 })}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {hasSelection && (
        <BulkActionBar
          table={table}
          currentAdminUserId={currentAdminUserId}
          onAfterBulk={refetch}
        />
      )}
    </div>
  );
}
