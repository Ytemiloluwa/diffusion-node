import { PaginationControls } from '@/components/molecules';
import { DataTable, type DataTableColumn } from '@/components/organisms';
import type { PageInfo } from '@/lib/api';
import type { CountryExposure } from '../types';

type CountryResultsTableProps = {
  columns: DataTableColumn<CountryExposure>[];
  cursorStack: string[];
  isLoading: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageInfo: PageInfo;
  rows: CountryExposure[];
};

export function CountryResultsTable({
  columns,
  cursorStack,
  isLoading,
  onNextPage,
  onPreviousPage,
  pageInfo,
  rows,
}: CountryResultsTableProps) {
  return (
    <DataTable
      actions={
        <PaginationControls
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={cursorStack.length > 0}
          isLoading={isLoading}
          onNext={onNextPage}
          onPrevious={onPreviousPage}
          pageLabel={`Page ${cursorStack.length + 1}`}
        />
      }
      columns={columns}
      description="Curated country records with jurisdiction, company, and technology exposure."
      emptyState="No countries match the current search and filters."
      isLoading={isLoading}
      rowKey={(country) => country.id}
      rows={rows}
      title="Country Results"
    />
  );
}
