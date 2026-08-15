'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ExternalLink,
  FileSearch,
  Filter,
  Globe2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { Badge, Button, CountryFlag, Panel, Spinner, type BadgeProps } from '@/components/atoms';
import {
  FilterPanel,
  PaginationControls,
  PolicyCard,
  SearchBar,
  type FilterOption,
  type PolicyFilters as FilterPanelPolicyFilters,
} from '@/components/molecules';
import { DataTable, type DataTableColumn } from '@/components/organisms';
import { DashboardShell } from '@/components/templates';
import {
  listCompanies,
  listCountries,
  listPolicies,
  listRestrictions,
  listSources,
  listTechnologies,
  type Company,
  type Country,
  type CountryWithRestrictionSummary,
  type PageInfo,
  type Policy,
  type PolicyStatus,
  type RestrictionType,
  type SourceSummary,
  type Technology,
} from '@/lib/api';
import { useAuthStore, useUiStore, type PolicyFilters as StorePolicyFilters } from '@/store';

const PAGE_SIZE = 20;
const OPTION_LIMIT = 100;

const policyFilterFields: Array<keyof FilterPanelPolicyFilters> = [
  'technology',
  'company',
  'country',
  'source',
  'restriction',
  'year',
];

const emptyPageInfo: PageInfo = {
  hasNextPage: false,
  limit: PAGE_SIZE,
  nextCursor: null,
};

const statusLabels: Record<PolicyStatus, string> = {
  ACTIVE: 'Active',
  CONTESTED: 'Contested',
  DRAFT: 'Draft',
  RESCINDED: 'Rescinded',
  SUPERSEDED: 'Superseded',
};

const statusTones: Record<PolicyStatus, BadgeProps['tone']> = {
  ACTIVE: 'emerald',
  CONTESTED: 'amber',
  DRAFT: 'slate',
  RESCINDED: 'red',
  SUPERSEDED: 'sky',
};

const activeFilterLabels = {
  company: 'Company',
  country: 'Country',
  q: 'Search',
  restriction: 'Restriction',
  source: 'Source',
  technology: 'Technology',
  title: 'Title',
  year: 'Year',
} satisfies Record<keyof StorePolicyFilters, string>;

type ExplorerOptions = {
  companies: Company[];
  countries: CountryWithRestrictionSummary[];
  restrictions: RestrictionType[];
  sources: SourceSummary[];
  technologies: Technology[];
  years: string[];
};

const emptyOptions: ExplorerOptions = {
  companies: [],
  countries: [],
  restrictions: [],
  sources: [],
  technologies: [],
  years: [],
};

export type PolicyExplorerPageProps = {
  initialSearch?: string;
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatCount = (value: number): string => value.toLocaleString('en-US');

const toFilterOptions = (values: string[]): FilterOption[] =>
  [...new Set(values.filter(Boolean))]
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({ label: value, value }));

const getPolicySource = (policy: Policy) =>
  policy.sources.find((source) => source.sourceUrl) ?? policy.sources[0];

const getPolicySourceName = (policy: Policy): string =>
  getPolicySource(policy)?.sourceName ?? policy.documents[0]?.documentType ?? 'Source pending';

const getPolicyTechnologyNames = (policy: Policy): string[] =>
  policy.technologies.map(({ technology }) => technology.name);

const getPolicyCompanyNames = (policy: Policy): string[] =>
  policy.companies.map(({ company }) => company.name);

const getPolicyCountryNames = (policy: Policy): string[] => [
  ...new Set(policy.jurisdictions.map(({ country }) => country.name)),
];

const getPolicyCountries = (policy: Policy): Country[] => [
  ...new Map(policy.jurisdictions.map(({ country }) => [country.id, country])).values(),
];

const getDisplayName = (email?: string): string => {
  if (!email) {
    return 'Analyst';
  }

  const localPart = email.split('@')[0] ?? email;
  const words = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.length ? words.join(' ') : email;
};

const getInitials = (email?: string): string => {
  if (!email) {
    return 'DN';
  }

  const words = email.split('@')[0]?.split(/[._-]+/).filter(Boolean) ?? [];
  const initials = words.map((word) => word.charAt(0).toUpperCase()).join('');

  return (initials || email.slice(0, 2).toUpperCase()).slice(0, 2);
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Policy records could not be loaded.';
};

const toPanelFilters = (filters: StorePolicyFilters): FilterPanelPolicyFilters => ({
  company: filters.company,
  country: filters.country,
  restriction: filters.restriction,
  source: filters.source,
  technology: filters.technology,
  year: filters.year ? String(filters.year) : undefined,
});

const toSearchFilters = (filters: FilterPanelPolicyFilters): Partial<StorePolicyFilters> => {
  const year = filters.year ? Number(filters.year) : undefined;

  return {
    company: filters.company,
    country: filters.country,
    restriction: filters.restriction,
    source: filters.source,
    technology: filters.technology,
    year: year && Number.isFinite(year) ? year : undefined,
  };
};

const getActiveFilterEntries = (filters: StorePolicyFilters) =>
  (Object.entries(filters) as Array<[keyof StorePolicyFilters, StorePolicyFilters[keyof StorePolicyFilters]]>)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => ({
      key,
      label: activeFilterLabels[key],
      value: String(value),
    }));

const policyColumns: DataTableColumn<Policy>[] = [
  {
    cell: (policy) => (
      <div>
        <Link
          className="font-semibold text-ink hover:text-brand"
          href={`/policies/${policy.id}`}
        >
          {policy.title}
        </Link>
        <p className="mt-1 text-xs text-muted">{getPolicySourceName(policy)}</p>
      </div>
    ),
    header: 'Policy',
    id: 'policy',
    isRowHeader: true,
    sortValue: (policy) => policy.title,
    width: '30%',
  },
  {
    cell: (policy) => {
      const technologies = getPolicyTechnologyNames(policy);
      return technologies.length ? technologies.slice(0, 3).join(', ') : 'No technology links';
    },
    header: 'Technologies',
    id: 'technologies',
    sortValue: (policy) => getPolicyTechnologyNames(policy).join(', '),
    width: '22%',
  },
  {
    align: 'right',
    cell: (policy) => formatCount(policy.companies.length),
    header: 'Companies',
    id: 'companies',
    sortValue: (policy) => policy.companies.length,
    width: '10%',
  },
  {
    cell: (policy) => {
      const countries = getPolicyCountries(policy);

      return countries.length ? (
        <div className="flex flex-wrap gap-1.5">
          {countries.slice(0, 2).map((country) => (
            <span className="inline-flex items-center gap-1.5" key={country.id}>
              <CountryFlag
                className="h-3.5 w-5"
                countryCode={country.isoCode}
                countryName={country.name}
              />
              <span>{country.name}</span>
            </span>
          ))}
          {countries.length > 2 ? <Badge tone="slate">+{formatCount(countries.length - 2)}</Badge> : null}
        </div>
      ) : (
        'No country links'
      );
    },
    header: 'Countries',
    id: 'countries',
    sortValue: (policy) => getPolicyCountries(policy).length,
    width: '14%',
  },
  {
    cell: (policy) => <Badge tone={statusTones[policy.status]}>{statusLabels[policy.status]}</Badge>,
    header: 'Status',
    id: 'status',
    sortValue: (policy) => statusLabels[policy.status],
    width: '10%',
  },
  {
    cell: (policy) => formatDate(policy.effectiveDate),
    header: 'Effective',
    id: 'effectiveDate',
    sortValue: (policy) => policy.effectiveDate,
    width: '10%',
  },
  {
    cell: (policy) => {
      const source = getPolicySource(policy);

      return source?.sourceUrl ? (
        <a
          className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand-hover"
          href={source.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          Source
          <ExternalLink aria-hidden="true" size={13} strokeWidth={2} />
        </a>
      ) : (
        <span className="text-subtle">None</span>
      );
    },
    header: 'Link',
    id: 'link',
    width: '4%',
  },
];

export function PolicyExplorerPage({ initialSearch }: PolicyExplorerPageProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const user = useAuthStore((state) => state.user);
  const policyFilters = useUiStore((state) => state.policyFilters);
  const resetPolicyFilters = useUiStore((state) => state.resetPolicyFilters);
  const setPolicyFilter = useUiStore((state) => state.setPolicyFilter);
  const setPolicyFilters = useUiStore((state) => state.setPolicyFilters);
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<FilterPanelPolicyFilters>(() =>
    toPanelFilters(useUiStore.getState().policyFilters),
  );
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<ExplorerOptions>(emptyOptions);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyPageInfo);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchValue, setSearchValue] = useState(
    () => initialSearch?.trim() || useUiStore.getState().policyFilters.q || '',
  );

  const resetPagination = useCallback(() => {
    setCursor(undefined);
    setCursorStack([]);
  }, []);

  const filterOptions = useMemo(
    () => ({
      company: toFilterOptions(options.companies.map((company) => company.name)),
      country: toFilterOptions(options.countries.map((country) => country.name)),
      restriction: toFilterOptions(options.restrictions.map((restriction) => restriction.name)),
      source: toFilterOptions(options.sources.map((source) => source.sourceName)),
      technology: toFilterOptions(options.technologies.map((technology) => technology.name)),
      year: options.years.map((year) => ({ label: year, value: year })),
    }),
    [options],
  );

  const loadExplorerData = useCallback(async () => {
    if (!useAuthStore.getState().accessToken) {
      router.replace('/auth');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const profile = await loadProfile();

      if (!profile) {
        router.replace('/auth');
        return;
      }

      const [policyPage, companiesPage, countriesPage, technologiesPage, restrictions, sources] =
        await Promise.all([
          listPolicies({
            ...policyFilters,
            cursor,
            limit: PAGE_SIZE,
          }),
          listCompanies({ limit: OPTION_LIMIT }),
          listCountries({ limit: OPTION_LIMIT }),
          listTechnologies({ limit: OPTION_LIMIT }),
          listRestrictions(),
          listSources(),
        ]);

      const years = [
        ...new Set(
          policyPage.data
            .map((policy) => (policy.effectiveDate ? String(new Date(policy.effectiveDate).getUTCFullYear()) : null))
            .filter((year): year is string => Boolean(year)),
        ),
      ].sort((left, right) => Number(right) - Number(left));

      setOptions({
        companies: companiesPage.data,
        countries: countriesPage.data,
        restrictions,
        sources,
        technologies: technologiesPage.data,
        years,
      });
      setPageInfo(policyPage.pageInfo);
      setPolicies(policyPage.data);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [cursor, loadProfile, policyFilters, router]);

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    const hydrationTimer = window.setTimeout(() => {
      setHasHydrated(persistApi.hasHydrated());
    }, 0);
    const unsubscribe = persistApi.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return () => {
      window.clearTimeout(hydrationTimer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return undefined;
    }

    if (!accessToken) {
      router.replace('/auth');
      return undefined;
    }

    const loadTimer = window.setTimeout(() => {
      void loadExplorerData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, loadExplorerData, router]);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setDraftFilters(toPanelFilters(policyFilters));
      setSearchValue(policyFilters.q ?? '');
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [policyFilters]);

  useEffect(() => {
    const query = initialSearch?.trim();

    if (!query || query === useUiStore.getState().policyFilters.q) {
      return undefined;
    }

    const searchTimer = window.setTimeout(() => {
      resetPagination();
      setSearchValue(query);
      setPolicyFilter('q', query);
    }, 0);

    return () => window.clearTimeout(searchTimer);
  }, [initialSearch, resetPagination, setPolicyFilter]);

  const activeFilters = useMemo(() => getActiveFilterEntries(policyFilters), [policyFilters]);

  const statusCounts = useMemo(
    () =>
      policies.reduce<Record<PolicyStatus, number>>(
        (counts, policy) => ({
          ...counts,
          [policy.status]: counts[policy.status] + 1,
        }),
        {
          ACTIVE: 0,
          CONTESTED: 0,
          DRAFT: 0,
          RESCINDED: 0,
          SUPERSEDED: 0,
        },
      ),
    [policies],
  );

  const linkedEntityCounts = useMemo(
    () => ({
      companies: new Set(policies.flatMap((policy) => policy.companies.map(({ companyId }) => companyId)))
        .size,
      countries: new Set(policies.flatMap((policy) => policy.jurisdictions.map(({ countryId }) => countryId)))
        .size,
      technologies: new Set(
        policies.flatMap((policy) => policy.technologies.map(({ technologyId }) => technologyId)),
      ).size,
    }),
    [policies],
  );

  const applySearch = useCallback(
    (value: string) => {
      resetPagination();
      setPolicyFilter('q', value.trim() || undefined);
    },
    [resetPagination, setPolicyFilter],
  );

  const applyFilters = useCallback(
    (filters: FilterPanelPolicyFilters) => {
      resetPagination();
      setPolicyFilters(toSearchFilters(filters));
    },
    [resetPagination, setPolicyFilters],
  );

  const resetFilters = useCallback(() => {
    setDraftFilters({});
    setSearchValue('');
    resetPagination();
    resetPolicyFilters();
  }, [resetPagination, resetPolicyFilters]);

  const goToNextPage = useCallback(() => {
    if (!pageInfo.nextCursor) {
      return;
    }

    setCursorStack((stack) => [...stack, cursor ?? '']);
    setCursor(pageInfo.nextCursor);
  }, [cursor, pageInfo.nextCursor]);

  const goToPreviousPage = useCallback(() => {
    setCursorStack((stack) => {
      const nextStack = [...stack];
      const previousCursor = nextStack.pop();
      setCursor(previousCursor || undefined);
      return nextStack;
    });
  }, []);

  return (
    <DashboardShell
      actions={
        <Button
          isLoading={isLoading}
          leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={() => void loadExplorerData()}
          variant="secondary"
        >
          Refresh
        </Button>
      }
      activeItem="policy-explorer"
      description="Search policy records by source metadata, affected technologies, companies, jurisdictions, and effective year."
      eyebrow="Policy explorer"
      title="Policy Explorer"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Policy records unavailable">
          <div className="flex gap-3 text-sm text-danger">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <Panel
            actions={
              <Badge tone={pageInfo.hasNextPage ? 'amber' : 'slate'}>
                {pageInfo.hasNextPage ? `${formatCount(PAGE_SIZE)} shown` : `${formatCount(policies.length)} shown`}
              </Badge>
            }
            description="Cross-reference controls, sources, companies, technologies, and jurisdictions."
            title="Search Policies"
          >
            <SearchBar
              disabled={isLoading}
              label="Search policies"
              onClear={() => applySearch('')}
              onDebouncedChange={applySearch}
              onSearch={applySearch}
              onValueChange={setSearchValue}
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

          <DataTable
            actions={
              <PaginationControls
                hasNextPage={pageInfo.hasNextPage}
                hasPreviousPage={cursorStack.length > 0}
                isLoading={isLoading}
                onNext={goToNextPage}
                onPrevious={goToPreviousPage}
                pageLabel={`Page ${cursorStack.length + 1}`}
              />
            }
            columns={policyColumns}
            description="Current policy matches from the curated export-control dataset."
            emptyState="No policies match the current search and filters."
            isLoading={isLoading}
            rowKey={(policy) => policy.id}
            rows={policies}
            title="Policy Results"
          />

          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Policy Cards</h2>
                <p className="mt-1 text-sm text-muted">
                  Compact policy summaries from the current result page.
                </p>
              </div>
              <Badge tone="slate">{formatCount(policies.slice(0, 3).length)} shown</Badge>
            </div>

            {isLoading ? (
              <Panel>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Spinner label="Loading policies" />
                  <span>Loading policies</span>
                </div>
              </Panel>
            ) : policies.length ? (
              policies.slice(0, 3).map((policy) => (
                <PolicyCard
                  actions={
                    <Link
                      className="inline-flex h-8 items-center justify-center rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                      href={`/policies/${policy.id}`}
                    >
                      Details
                    </Link>
                  }
                  companies={getPolicyCompanyNames(policy).slice(0, 4)}
                  controlNumber={policy.controlNumber ?? undefined}
                  countries={getPolicyCountryNames(policy).slice(0, 4)}
                  effectiveDate={formatDate(policy.effectiveDate)}
                  key={policy.id}
                  sourceName={getPolicySourceName(policy)}
                  status={policy.status}
                  summary={policy.summary ?? undefined}
                  technologies={getPolicyTechnologyNames(policy).slice(0, 4)}
                  title={policy.title}
                />
              ))
            ) : (
              <Panel>No policy cards to show.</Panel>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <FilterPanel
            fields={policyFilterFields}
            filters={draftFilters}
            isDisabled={isLoading}
            onApply={applyFilters}
            onChange={setDraftFilters}
            onReset={resetFilters}
            options={filterOptions}
          />

          <Panel
            actions={<Badge tone="emerald">Live data</Badge>}
            description="Counts from the currently loaded result page."
            title="Result Summary"
          >
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <FileSearch aria-hidden="true" size={16} strokeWidth={2} />
                  Policies
                </span>
                <span className="text-sm font-semibold text-ink">{formatCount(policies.length)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Filter aria-hidden="true" size={16} strokeWidth={2} />
                  Active filters
                </span>
                <span className="text-sm font-semibold text-ink">
                  {formatCount(activeFilters.length)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Building2 aria-hidden="true" size={16} strokeWidth={2} />
                  Linked companies
                </span>
                <span className="text-sm font-semibold text-ink">
                  {formatCount(linkedEntityCounts.companies)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Globe2 aria-hidden="true" size={16} strokeWidth={2} />
                  Linked countries
                </span>
                <span className="text-sm font-semibold text-ink">
                  {formatCount(linkedEntityCounts.countries)}
                </span>
              </div>
            </div>
          </Panel>

          <Panel description="Status distribution from the current result page." title="Status Breakdown">
            <div className="space-y-3">
              {(Object.keys(statusLabels) as PolicyStatus[]).map((status) => (
                <div className="flex items-center justify-between gap-3" key={status}>
                  <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>
                  <span className="text-sm font-semibold text-ink">
                    {formatCount(statusCounts[status])}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel description="Available filter dimensions from the curated dataset." title="Filter Sources">
            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-center justify-between gap-3">
                <span>Technologies</span>
                <Badge tone="slate">{formatCount(options.technologies.length)}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Companies</span>
                <Badge tone="slate">{formatCount(options.companies.length)}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Countries</span>
                <Badge tone="slate">{formatCount(options.countries.length)}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Sources</span>
                <Badge tone="slate">{formatCount(options.sources.length)}</Badge>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </DashboardShell>
  );
}
