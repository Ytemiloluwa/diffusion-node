import { Badge, Panel } from '@/components/atoms';
import { SearchBar } from '@/components/molecules';
import { formatCount } from '@/screens/shared';
import type { TechnologyFilters } from '@/store';
import { TECHNOLOGY_PAGE_SIZE } from '../constants';

type TechnologySearchPanelProps = {
  hasNextPage: boolean;
  isLoading: boolean;
  onClearSearch: () => void;
  onSearchChange: (value: string) => void;
  onSearchCommit: (value: string) => void;
  searchDraft: string;
  searchQuery: string;
  technologyCount: number;
  technologyFilters: TechnologyFilters;
};

export function TechnologySearchPanel({
  hasNextPage,
  isLoading,
  onClearSearch,
  onSearchChange,
  onSearchCommit,
  searchDraft,
  searchQuery,
  technologyCount,
  technologyFilters,
}: TechnologySearchPanelProps) {
  return (
    <Panel
      actions={
        <Badge tone={hasNextPage ? 'amber' : 'slate'}>
          {hasNextPage ? `${formatCount(TECHNOLOGY_PAGE_SIZE)} shown` : `${formatCount(technologyCount)} shown`}
        </Badge>
      }
      description="Search technologies by name, category, description, linked company, or country."
      title="Search Technologies"
    >
      <SearchBar
        disabled={isLoading}
        label="Search technologies"
        onClear={onClearSearch}
        onDebouncedChange={onSearchCommit}
        onSearch={onSearchCommit}
        onValueChange={onSearchChange}
        placeholder="Search technology, category, company, or country"
        value={searchDraft}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {technologyFilters.category ? (
          <Badge tone="sky">Category: {technologyFilters.category}</Badge>
        ) : null}
        {searchQuery ? <Badge tone="slate">Search: {searchQuery}</Badge> : null}
        {!technologyFilters.category && !searchQuery ? (
          <span className="text-sm text-muted">No active filters.</span>
        ) : null}
      </div>
    </Panel>
  );
}
