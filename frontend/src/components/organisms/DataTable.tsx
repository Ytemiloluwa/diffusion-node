import type { ReactNode } from 'react';
import { Spinner } from '@/components/atoms';
import { cn } from '@/lib/cn';

type DataTableAlign = 'center' | 'left' | 'right';

const alignClasses: Record<DataTableAlign, string> = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
};

export type DataTableColumn<Row> = {
  align?: DataTableAlign;
  cell: (row: Row) => ReactNode;
  className?: string;
  header: ReactNode;
  headerClassName?: string;
  id: string;
  isRowHeader?: boolean;
  width?: string;
};

export type DataTableProps<Row> = {
  actions?: ReactNode;
  className?: string;
  columns: DataTableColumn<Row>[];
  description?: ReactNode;
  emptyState?: ReactNode;
  isLoading?: boolean;
  rowKey: (row: Row) => string;
  rows: Row[];
  skeletonRowCount?: number;
  title?: ReactNode;
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
  isLoading = false,
  rowKey,
  rows,
  skeletonRowCount = 5,
  title,
}: DataTableProps<Row>) {
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
                  className={cn(
                    'border-b border-line px-4 py-3',
                    alignClasses[column.align ?? 'left'],
                    column.headerClassName,
                  )}
                  key={column.id}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink-soft">
            {isLoading ? (
              <SkeletonRows columns={columns} rowCount={skeletonRowCount} />
            ) : rows.length ? (
              rows.map((row) => (
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
