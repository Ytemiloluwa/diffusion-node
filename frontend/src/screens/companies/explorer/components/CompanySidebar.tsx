import { Building2, Cpu, Filter, Landmark } from 'lucide-react';
import { Badge, Panel } from '@/components/atoms';
import type { Company } from '@/lib/api';
import { formatCount } from '@/screens/shared';
import type { CompanyFilters } from '@/store';
import { getEntityStatusTone } from '../companyModel';
import type { CompanyCountryCount, CompanyStats, CompanyStatusCount } from '../types';
import { CountrySummaryLabel } from './CompanyCountryLabels';
import { CompanyFiltersPanel } from './CompanyFiltersPanel';

type FilterOption = {
  label: string;
  value: string;
};

type CompanySidebarProps = {
  activeFilterCount: number;
  companies: Company[];
  countryOptions: FilterOption[];
  draftFilters: CompanyFilters;
  isLoading: boolean;
  onApplyFilters: () => void;
  onChangeDraftFilter: (key: keyof CompanyFilters, value: string) => void;
  onResetFilters: () => void;
  policyStats: Map<string, CompanyStats>;
  searchQuery: string;
  statusDistribution: CompanyStatusCount[];
  statusOptions: FilterOption[];
  topCountries: CompanyCountryCount[];
};

export function CompanySidebar({
  activeFilterCount,
  companies,
  countryOptions,
  draftFilters,
  isLoading,
  onApplyFilters,
  onChangeDraftFilter,
  onResetFilters,
  policyStats,
  searchQuery,
  statusDistribution,
  statusOptions,
  topCountries,
}: CompanySidebarProps) {
  const hqCountryCount = new Set(companies.map((company) => company.hqCountryId)).size;
  const technologyCount = new Set(
    companies.flatMap((company) => [...(policyStats.get(company.id)?.technologies ?? [])]),
  ).size;

  return (
    <aside className="space-y-5">
      <CompanyFiltersPanel
        activeFilterCount={activeFilterCount}
        countryOptions={countryOptions}
        draftFilters={draftFilters}
        isLoading={isLoading}
        onApplyFilters={onApplyFilters}
        onChangeDraftFilter={onChangeDraftFilter}
        onResetFilters={onResetFilters}
        searchQuery={searchQuery}
        statusOptions={statusOptions}
      />

      <Panel
        actions={<Badge tone="emerald">Live data</Badge>}
        description="Counts from the current company result page and loaded policy context."
        title="Company Summary"
      >
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Building2 aria-hidden="true" size={16} strokeWidth={2} />
              Companies
            </span>
            <span className="text-sm font-semibold text-ink">{formatCount(companies.length)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Filter aria-hidden="true" size={16} strokeWidth={2} />
              Active filters
            </span>
            <span className="text-sm font-semibold text-ink">
              {formatCount(activeFilterCount + (searchQuery ? 1 : 0))}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Landmark aria-hidden="true" size={16} strokeWidth={2} />
              HQ countries
            </span>
            <span className="text-sm font-semibold text-ink">{formatCount(hqCountryCount)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Cpu aria-hidden="true" size={16} strokeWidth={2} />
              Technologies
            </span>
            <span className="text-sm font-semibold text-ink">{formatCount(technologyCount)}</span>
          </div>
        </div>
      </Panel>

      <Panel description="Headquarters countries represented in the current result set." title="HQ Countries">
        {topCountries.length ? (
          <div className="space-y-3">
            {topCountries.map((country) => (
              <div className="flex items-center justify-between gap-3" key={country.isoCode}>
                <CountrySummaryLabel isoCode={country.isoCode} name={country.name} />
                <Badge tone="slate">{formatCount(country.count)}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No headquarters countries returned.</p>
        )}
      </Panel>

      <Panel description="Entity-list status distribution in the current result set." title="List Status">
        {statusDistribution.length ? (
          <div className="space-y-3">
            {statusDistribution.map(({ count, status }) => (
              <div className="flex items-center justify-between gap-3" key={status}>
                <Badge tone={getEntityStatusTone(status)}>{status}</Badge>
                <span className="text-sm font-semibold text-ink">{formatCount(count)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No list statuses returned.</p>
        )}
      </Panel>
    </aside>
  );
}
