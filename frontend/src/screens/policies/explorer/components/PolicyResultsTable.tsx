import { PaginationControls } from '@/components/molecules';
import { DataTable } from '@/components/organisms';
import type { PageInfo, Policy } from '@/lib/api';
import { policyExplorerColumns } from '../policyExplorerColumns';

type PolicyResultsTableProps = {
  cursorStack: string[];
  isLoading: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageInfo: PageInfo;
  policies: Policy[];
};

export function PolicyResultsTable({
  cursorStack,
  isLoading,
  onNextPage,
  onPreviousPage,
  pageInfo,
  policies,
}: PolicyResultsTableProps) {
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
      columns={policyExplorerColumns}
      description="Current policy matches from the curated export-control dataset."
      emptyState="No policies match the current search and filters."
      isLoading={isLoading}
      rowKey={(policy) => policy.id}
      rows={policies}
      title="Policy Results"
    />
  );
}
