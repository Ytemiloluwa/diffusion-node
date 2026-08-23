import { PaginationControls } from '@/components/molecules';
import { DataTable, type DataTableColumn } from '@/components/organisms';
import type { Company, PageInfo } from '@/lib/api';

type CompanyResultsTableProps = {
  columns: DataTableColumn<Company>[];
  cursorStack: string[];
  isLoading: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageInfo: PageInfo;
  rows: Company[];
};

export function CompanyResultsTable({
  columns,
  cursorStack,
  isLoading,
  onNextPage,
  onPreviousPage,
  pageInfo,
  rows,
}: CompanyResultsTableProps) {
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
      description="Curated company records with headquarters and policy exposure."
      emptyState="No companies match the current search and filters."
      isLoading={isLoading}
      rowKey={(company) => company.id}
      rows={rows}
      title="Company Results"
    />
  );
}
