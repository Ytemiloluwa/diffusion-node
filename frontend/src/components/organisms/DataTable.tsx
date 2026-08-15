'use client';

import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/atoms';
import { cn } from '@/lib/cn';

type DataTableAlign = 'center' | 'left' | 'right';
type DataTableSortDirection = 'asc' | 'desc';
type DataTableSortValue = boolean | Date | number | string | null | undefined;

type DataTableSortState = {
  columnId: string;
  direction: DataTableSortDirection;
};

const alignClasses: Record<DataTableAlign, string> = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
};

const headerButtonAlignClasses: Record<DataTableAlign, string> = {
  center: 'mx-auto justify-center',
  left: 'justify-start',
  right: 'ml-auto justify-end',
};

const sortCollator = new Intl.Collator('en-US', {
  numeric: true,
  sensitivity: 'base',
});

export type DataTableColumn<Row> = {
  align?: DataTableAlign;
  cell: (row: Row) => ReactNode;
  className?: string;
  header: ReactNode;
  headerClassName?: string;
  id: string;
  isRowHeader?: boolean;
  sortValue?: (row: Row) => DataTableSortValue;
  width?: string;
};

export type DataTableProps<Row> = {
  actions?: ReactNode;
  className?: string;
  columns: DataTableColumn<Row>[];
  description?: ReactNode;
  emptyState?: ReactNode;
  initialSortColumnId?: string;
  initialSortDirection?: DataTableSortDirection;
  isLoading?: boolean;
  rowKey: (row: Row) => string;
  rows: Row[];
  skeletonRowCount?: number;
  title?: ReactNode;
};

const normalizeSortValue = (value: DataTableSortValue): number | string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();

    return Number.isNaN(timestamp) ? null : timestamp;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  return value.trim();
};

const compareSortValues = (left: number | string, right: number | string): number => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return sortCollator.compare(String(left), String(right));
};

function SkeletonRows<Row>({
  columns,
  rowCount,
}: {
  columns: DataTableColumn<Row>[];
  rowCount: number;
}) {
  return Array.from({ length: rowCount }, (_, index) => (
    <tr className="border-b border-line last:border-0" key={index}>
      {columns.map((column) => (
        <td className="px-4 py-4" key={column.id}>
          <span
            className={cn(
              'block h-4 rounded-control bg-line',
              column.align === 'right' ? 'ml-auto' : undefined,
              column.align === 'center' ? 'mx-auto' : undefined,
              column.width ? undefined : 'w-24',
            )}
            style={column.width ? { width: column.width } : undefined}
          />
        </td>
      ))}
    </tr>
  ));
}

export function DataTable<Row>({
  actions,
  className,
  columns,
  description,
  emptyState = 'No records found.',
  initialSortColumnId,
  initialSortDirection = 'asc',
  isLoading = false,
  rowKey,
  rows,
  skeletonRowCount = 5,
  title,
}: DataTableProps<Row>) {
  const [sortState, setSortState] = useState<DataTableSortState | null>(() =>
    initialSortColumnId
      ? {
          columnId: initialSortColumnId,
          direction: initialSortDirection,
        }
      : null,
  );

  const sortedRows = useMemo(() => {
    if (!sortState) {
      return rows;
    }

    const sortColumn = columns.find(
      (column) => column.id === sortState.columnId && column.sortValue,
    );

    if (!sortColumn?.sortValue) {
      return rows;
    }

    return rows
      .map((row, index) => ({ index, row }))
      .sort((leftEntry, rightEntry) => {
        const left = normalizeSortValue(sortColumn.sortValue?.(leftEntry.row));
        const right = normalizeSortValue(sortColumn.sortValue?.(rightEntry.row));

        if (left === null && right === null) {
          return leftEntry.index - rightEntry.index;
        }

        if (left === null) {
          return 1;
        }

        if (right === null) {
          return -1;
        }

        const comparison = compareSortValues(left, right);

        if (comparison === 0) {
          return leftEntry.index - rightEntry.index;
        }

        return sortState.direction === 'asc' ? comparison : -comparison;
      })
      .map(({ row }) => row);
  }, [columns, rows, sortState]);

  const updateSort = (columnId: string) => {
    setSortState((currentSort) => {
      if (currentSort?.columnId === columnId) {
        return {
          columnId,
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return { columnId, direction: 'asc' };
    });
  };

  return (
    <section
      aria-busy={isLoading}
      className={cn('overflow-hidden rounded-panel border border-line bg-surface shadow-panel', className)}
    >
      {title || description || actions ? (
        <header className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-semibold text-ink">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-[56rem] w-full border-separate border-spacing-0 text-sm">
          <thead className="bg-surface-muted text-xs font-semibold uppercase text-muted">
            <tr>
              {columns.map((column) => (
                <th
                  aria-sort={
                    column.sortValue
                      ? sortState?.columnId === column.id
                        ? sortState.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                  className={cn(
                    'border-b border-line px-4 py-3',
                    alignClasses[column.align ?? 'left'],
                    column.headerClassName,
                  )}
                  key={column.id}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.sortValue ? (
                    <button
                      className={cn(
                        'inline-flex max-w-full items-center gap-1.5 rounded-control text-left transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                        headerButtonAlignClasses[column.align ?? 'left'],
                      )}
                      onClick={() => updateSort(column.id)}
                      type="button"
                    >
                      <span className="truncate">{column.header}</span>
                      {sortState?.columnId === column.id ? (
                        sortState.direction === 'asc' ? (
                          <ArrowUp aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
                        ) : (
                          <ArrowDown aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
                        )
                      ) : (
                        <ArrowDownUp aria-hidden="true" className="size-3.5 shrink-0 text-subtle" strokeWidth={2} />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink-soft">
            {isLoading ? (
              <SkeletonRows columns={columns} rowCount={skeletonRowCount} />
            ) : sortedRows.length ? (
              sortedRows.map((row) => (
                <tr className="transition-colors hover:bg-surface-muted/80" key={rowKey(row)}>
                  {columns.map((column) =>
                    column.isRowHeader ? (
                      <th
                        className={cn(
                          'px-4 py-3 font-medium text-ink',
                          alignClasses[column.align ?? 'left'],
                          column.className,
                        )}
                        key={column.id}
                        scope="row"
                        style={column.width ? { width: column.width } : undefined}
                      >
                        {column.cell(row)}
                      </th>
                    ) : (
                      <td
                        className={cn(
                          'px-4 py-3 align-middle',
                          alignClasses[column.align ?? 'left'],
                          column.className,
                        )}
                        key={column.id}
                        style={column.width ? { width: column.width } : undefined}
                      >
                        {column.cell(row)}
                      </td>
                    ),
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted" colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-3">
                    {isLoading ? <Spinner label="Loading records" /> : null}
                    <span>{emptyState}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
