import { PaginationControls } from '@/components/molecules';
import { DataTable, type DataTableColumn } from '@/components/organisms';
import type { PageInfo, Technology } from '@/lib/api';

type TechnologyResultsTableProps = {
  columns: DataTableColumn<Technology>[];
  cursorStack: string[];
  isLoading: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageInfo: PageInfo;
  rows: Technology[];
};

export function TechnologyResultsTable({
  columns,
  cursorStack,
  isLoading,
  onNextPage,
  onPreviousPage,
  pageInfo,
  rows,
}: TechnologyResultsTableProps) {
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
      description="Technology records with category, policy, company, and country exposure."
      emptyState="No technologies match the current search and filters."
      isLoading={isLoading}
      rowKey={(technology) => technology.id}
      rows={rows}
      title="Technology Results"
    />
  );
}
