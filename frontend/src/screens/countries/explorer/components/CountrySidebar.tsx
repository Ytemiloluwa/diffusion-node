import Link from 'next/link';
import { Badge, Button, CountryFlag, Panel } from '@/components/atoms';
import { formatCount } from '@/screens/shared';
import {
  getTierTone,
} from '../countryModel';
import type {
  CountryExposure,
  CountryFilterState,
  CountryTierDistribution,
} from '../types';
import { CountryFiltersPanel } from './CountryFiltersPanel';
import { CountrySnapshot } from './CountrySnapshot';

type FilterOption = {
  label: string;
  value: string;
};

type CountrySidebarProps = {
  activeFilterCount: number;
  draftFilters: CountryFilterState;
  isLoading: boolean;
  onApplyFilters: () => void;
  onChangeDraftFilter: (key: keyof CountryFilterState, value: string) => void;
  onResetFilters: () => void;
  onSelectCountry: (countryId: string) => void;
  onViewCompanies: (country: CountryExposure) => void;
  onViewPolicies: (country: CountryExposure) => void;
  restrictionOptions: FilterOption[];
  searchQuery: string;
  selectedCountry: CountryExposure | null;
  tierDistribution: CountryTierDistribution[];
  tierOptions: FilterOption[];
  topCountries: CountryExposure[];
};

export function CountrySidebar({
  activeFilterCount,
  draftFilters,
  isLoading,
  onApplyFilters,
  onChangeDraftFilter,
  onResetFilters,
  onSelectCountry,
  onViewCompanies,
  onViewPolicies,
  restrictionOptions,
  searchQuery,
  selectedCountry,
  tierDistribution,
  tierOptions,
  topCountries,
}: CountrySidebarProps) {
  return (
    <aside className="space-y-5">
      <CountryFiltersPanel
        activeFilterCount={activeFilterCount}
        draftFilters={draftFilters}
        isLoading={isLoading}
        onApplyFilters={onApplyFilters}
        onChangeDraftFilter={onChangeDraftFilter}
        onResetFilters={onResetFilters}
        restrictionOptions={restrictionOptions}
        searchQuery={searchQuery}
        tierOptions={tierOptions}
      />

      {selectedCountry ? (
        <CountrySnapshot
          country={selectedCountry}
          onViewCompanies={onViewCompanies}
          onViewPolicies={onViewPolicies}
        />
      ) : null}

      <Panel description="Countries with the highest current exposure in this view." title="Exposure Ranking">
        {topCountries.length ? (
          <div className="space-y-3">
            {topCountries.map((country) => (
              <button
                className="flex w-full items-center justify-between gap-3 rounded-control px-2 py-1.5 text-left transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                key={country.id}
                onClick={() => onSelectCountry(country.id)}
                type="button"
              >
                <span className="inline-flex min-w-0 items-center gap-2 text-sm text-muted">
                  <CountryFlag countryCode={country.isoCode} countryName={country.name} />
                  <span className="truncate">{country.name}</span>
                </span>
                <Badge tone={country.activePolicyCount > 0 ? 'amber' : 'slate'}>
                  {formatCount(country.activePolicyCount)}
                </Badge>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No countries to rank.</p>
        )}
      </Panel>

      <Panel description="Export-control tier mix for the current country view." title="Tier Distribution">
        {tierDistribution.length ? (
          <div className="space-y-3">
            {tierDistribution.map(({ count, tier }) => (
              <div className="flex items-center justify-between gap-3" key={tier ?? 'Unclassified'}>
                <Badge tone={getTierTone(tier)}>{tier ?? 'Unclassified'}</Badge>
                <span className="text-sm font-semibold text-ink">{formatCount(count)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No tier data returned.</p>
        )}
      </Panel>

      <Panel description="Open the linked policy or company workspace filtered to this country." title="Drilldowns">
        <div className="grid gap-2">
          {selectedCountry ? (
            <>
              <Button onClick={() => onViewPolicies(selectedCountry)} variant="secondary">
                View policy records
              </Button>
              <Button onClick={() => onViewCompanies(selectedCountry)} variant="ghost">
                View company records
              </Button>
            </>
          ) : (
            <Link
              className="inline-flex h-10 items-center justify-center rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              href="/policies"
            >
              Open policy explorer
            </Link>
          )}
        </div>
      </Panel>
    </aside>
  );
}
