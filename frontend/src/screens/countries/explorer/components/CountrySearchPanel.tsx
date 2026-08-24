import { Badge, Panel } from '@/components/atoms';
import { SearchBar } from '@/components/molecules';
import { formatCount } from '@/screens/shared';
import { COUNTRY_PAGE_SIZE } from '../constants';
import type { CountryExposure, CountryFilterState } from '../types';

type CountrySearchPanelProps = {
  countryCount: number;
  filters: CountryFilterState;
  hasNextPage: boolean;
  isLoading: boolean;
  onClearSearch: () => void;
  onSearchChange: (value: string) => void;
  onSearchCommit: (value: string) => void;
  searchDraft: string;
  searchQuery: string;
  selectedCountry: CountryExposure | null;
};

export function CountrySearchPanel({
  countryCount,
  filters,
  hasNextPage,
  isLoading,
  onClearSearch,
  onSearchChange,
  onSearchCommit,
  searchDraft,
  searchQuery,
  selectedCountry,
}: CountrySearchPanelProps) {
  return (
    <Panel
      actions={
        <Badge tone={hasNextPage ? 'amber' : 'slate'}>
          {hasNextPage ? `${formatCount(COUNTRY_PAGE_SIZE)} shown` : `${formatCount(countryCount)} shown`}
        </Badge>
      }
      description="Search by country, ISO code, tier, restriction, linked company, or affected technology."
      title="Search Countries"
    >
      <SearchBar
        disabled={isLoading}
        label="Search countries"
        onClear={onClearSearch}
        onDebouncedChange={onSearchCommit}
        onSearch={onSearchCommit}
        onValueChange={onSearchChange}
        placeholder="Search country, tier, restriction, company, or technology"
        value={searchDraft}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {filters.tier ? <Badge tone="sky">Tier: {filters.tier}</Badge> : null}
        {filters.restriction ? <Badge tone="amber">Restriction: {filters.restriction}</Badge> : null}
        {selectedCountry ? <Badge tone="emerald">Selected: {selectedCountry.name}</Badge> : null}
        {searchQuery ? <Badge tone="slate">Search: {searchQuery}</Badge> : null}
        {!filters.tier && !filters.restriction && !selectedCountry && !searchQuery ? (
          <span className="text-sm text-muted">No active filters.</span>
        ) : null}
      </div>
    </Panel>
  );
}
