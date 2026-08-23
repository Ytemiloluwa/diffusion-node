import { Badge, Panel } from '@/components/atoms';
import { SearchBar } from '@/components/molecules';
import type { PageInfo } from '@/lib/api';
import { formatCount } from '@/screens/shared';
import { POLICY_EXPLORER_PAGE_SIZE } from '../constants';
import type { ActivePolicyFilter } from '../types';

type PolicySearchPanelProps = {
  activeFilters: ActivePolicyFilter[];
  isLoading: boolean;
  onSearch: (value: string) => void;
  onSearchValueChange: (value: string) => void;
  pageInfo: PageInfo;
  policyCount: number;
  searchValue: string;
};

export function PolicySearchPanel({
  activeFilters,
  isLoading,
  onSearch,
  onSearchValueChange,
  pageInfo,
  policyCount,
  searchValue,
}: PolicySearchPanelProps) {
  return (
    <Panel
      actions={
        <Badge tone={pageInfo.hasNextPage ? 'amber' : 'slate'}>
          {pageInfo.hasNextPage
            ? `${formatCount(POLICY_EXPLORER_PAGE_SIZE)} shown`
            : `${formatCount(policyCount)} shown`}
        </Badge>
      }
      description="Cross-reference controls, sources, companies, technologies, and jurisdictions."
      title="Search Policies"
    >
      <SearchBar
        disabled={isLoading}
        label="Search policies"
        onClear={() => onSearch('')}
        onDebouncedChange={onSearch}
        onSearch={onSearch}
        onValueChange={onSearchValueChange}
        placeholder="Search policy title, summary, source, company, or country"
        value={searchValue}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {activeFilters.length ? (
          activeFilters.map((filter) => (
            <Badge key={filter.key} tone="sky">
              {filter.label}: {filter.value}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted">No active filters.</span>
        )}
      </div>
    </Panel>
  );
}
