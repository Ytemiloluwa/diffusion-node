import { Badge, Panel } from '@/components/atoms';
import { SearchBar } from '@/components/molecules';
import { formatCount } from '@/screens/shared';
import type { CompanyFilters } from '@/store';
import { COMPANY_PAGE_SIZE } from '../constants';

type CompanySearchPanelProps = {
  companyFilters: CompanyFilters;
  companyCount: number;
  hasNextPage: boolean;
  isLoading: boolean;
  onClearSearch: () => void;
  onSearchChange: (value: string) => void;
  onSearchCommit: (value: string) => void;
  searchDraft: string;
  searchQuery: string;
};

export function CompanySearchPanel({
  companyFilters,
  companyCount,
  hasNextPage,
  isLoading,
  onClearSearch,
  onSearchChange,
  onSearchCommit,
  searchDraft,
  searchQuery,
}: CompanySearchPanelProps) {
  return (
    <Panel
      actions={
        <Badge tone={hasNextPage ? 'amber' : 'slate'}>
          {hasNextPage ? `${formatCount(COMPANY_PAGE_SIZE)} shown` : `${formatCount(companyCount)} shown`}
        </Badge>
      }
      description="Search the loaded company records by name, aliases, headquarters country, or list status."
      title="Search Companies"
    >
      <SearchBar
        disabled={isLoading}
        label="Search companies"
        onClear={onClearSearch}
        onDebouncedChange={onSearchCommit}
        onSearch={onSearchCommit}
        onValueChange={onSearchChange}
        placeholder="Search company name, alias, country, or list status"
        value={searchDraft}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {companyFilters.country ? <Badge tone="sky">Country: {companyFilters.country}</Badge> : null}
        {companyFilters.entityListStatus ? (
          <Badge tone="amber">Status: {companyFilters.entityListStatus}</Badge>
        ) : null}
        {!companyFilters.country && !companyFilters.entityListStatus && !searchQuery ? (
          <span className="text-sm text-muted">No active filters.</span>
        ) : null}
        {searchQuery ? <Badge tone="slate">Search: {searchQuery}</Badge> : null}
      </div>
    </Panel>
  );
}
