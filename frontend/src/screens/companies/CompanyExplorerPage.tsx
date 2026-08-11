'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Cpu,
  FileSearch,
  Filter,
  Globe2,
  Landmark,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge, Button, CountryFlag, Panel, Spinner, type BadgeProps } from '@/components/atoms';
import { PaginationControls, SearchBar } from '@/components/molecules';
import { DataTable, type DataTableColumn } from '@/components/organisms';
import { DashboardShell } from '@/components/templates';
import {
  listCompanies,
  listCountries,
  listPolicies,
  type CompaniesQuery,
  type Company,
  type CountryWithRestrictionSummary,
  type CursorPage,
  type PageInfo,
  type Policy,
} from '@/lib/api';
import { useAuthStore, useUiStore, type CompanyFilters } from '@/store';

const COMPANY_PAGE_SIZE = 20;
const OPTION_LIMIT = 100;
const POLICY_CONTEXT_PAGE_LIMIT = 100;
const POLICY_CONTEXT_PAGE_CAP = 5;

type CompanyStats = {
  countries: Map<string, string>;
  latestPolicyDate: string | null;
  policyCount: number;
  technologies: Set<string>;
};

type MetricTone = 'amber' | 'emerald' | 'sky' | 'slate';

type Metric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

type CompanyOptionState = {
  companies: Company[];
  countries: CountryWithRestrictionSummary[];
};

const emptyPageInfo: PageInfo = {
  hasNextPage: false,
  limit: COMPANY_PAGE_SIZE,
  nextCursor: null,
};

const emptyOptions: CompanyOptionState = {
  companies: [],
  countries: [],
};

const metricToneClasses: Record<MetricTone, string> = {
  amber: 'bg-warning-soft text-warning ring-warning-line',
  emerald: 'bg-success-soft text-success ring-success-line',
  sky: 'bg-info-soft text-info ring-info-line',
  slate: 'bg-surface-muted text-ink-soft ring-line',
};

const formatCount = (value: number): string => value.toLocaleString('en-US');

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

  return 'Company records could not be loaded.';
};

const toFilterOptions = (values: string[]): Array<{ label: string; value: string }> =>
  [...new Set(values.filter(Boolean))]
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({ label: value, value }));

const emptyCompanyStats = (): CompanyStats => ({
  countries: new Map<string, string>(),
  latestPolicyDate: null,
  policyCount: 0,
  technologies: new Set<string>(),
});

const getPolicyDate = (policy: Policy): string | null => policy.effectiveDate ?? policy.updatedAt ?? null;

const buildCompanyStats = (policies: Policy[]): Map<string, CompanyStats> => {
  const statsByCompanyId = new Map<string, CompanyStats>();

  policies.forEach((policy) => {
    policy.companies.forEach(({ companyId }) => {
      const stats = statsByCompanyId.get(companyId) ?? emptyCompanyStats();
      const policyDate = getPolicyDate(policy);

      stats.policyCount += 1;

      policy.technologies.forEach(({ technology }) => {
        stats.technologies.add(technology.name);
      });
      policy.jurisdictions.forEach(({ country }) => {
        stats.countries.set(country.isoCode, country.name);
      });

      if (
        policyDate &&
        (!stats.latestPolicyDate ||
          new Date(policyDate).getTime() > new Date(stats.latestPolicyDate).getTime())
      ) {
        stats.latestPolicyDate = policyDate;
      }

      statsByCompanyId.set(companyId, stats);
    });
  });

  return statsByCompanyId;
};

const matchesCompanySearch = (company: Company, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    company.name,
    company.entityListStatus,
    company.hqCountry.name,
    company.hqCountry.isoCode,
    ...company.aliases,
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedQuery));
};

const getEntityStatusTone = (status?: string | null): BadgeProps['tone'] => {
  if (!status) {
    return 'slate';
  }

  return status.toLowerCase().includes('entity') ? 'red' : 'amber';
};

const getActiveFilterCount = (filters: CompanyFilters): number =>
  Object.values(filters).filter((value) => value !== undefined && value !== '').length;

const getTopCountries = (
  companies: Company[],
): Array<{ count: number; isoCode: string; name: string }> => {
  const countryCounts = companies.reduce<Record<string, { count: number; isoCode: string; name: string }>>(
    (counts, company) => {
      const existingCountry = counts[company.hqCountryId];
      counts[company.hqCountryId] = {
        count: (existingCountry?.count ?? 0) + 1,
        isoCode: company.hqCountry.isoCode,
        name: company.hqCountry.name,
      };
      return counts;
    },
    {},
  );

  return Object.values(countryCounts)
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 5);
};

function CountryLabel({ country }: { country: Company['hqCountry'] }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CountryFlag countryCode={country.isoCode} countryName={country.name} />
      <span>{country.name}</span>
    </span>
  );
}

function CountrySummaryLabel({ isoCode, name }: { isoCode: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <CountryFlag countryCode={isoCode} countryName={name} />
      <span>{name}</span>
    </span>
  );
}

function CountryPill({ isoCode, name }: { isoCode: string; name: string }) {
  return (
    <span className="inline-flex min-h-6 items-center gap-1.5 rounded-control bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-soft ring-1 ring-inset ring-line">
      <CountryFlag className="h-3.5 w-5" countryCode={isoCode} countryName={name} />
      <span>{name}</span>
    </span>
  );
}

const getStatusDistribution = (companies: Company[]): Array<{ count: number; status: string }> => {
  const statusCounts = companies.reduce<Record<string, number>>((counts, company) => {
    const status = company.entityListStatus ?? 'Not listed';
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});

  return Object.entries(statusCounts)
    .map(([status, count]) => ({ count, status }))
    .sort((left, right) => right.count - left.count || left.status.localeCompare(right.status));
};

const loadPolicyContext = async (): Promise<{
  isPartial: boolean;
  policies: Policy[];
}> => {
  const policies: Policy[] = [];
  let cursor: string | undefined;
  let isPartial = false;

  for (let pageIndex = 0; pageIndex < POLICY_CONTEXT_PAGE_CAP; pageIndex += 1) {
    const page: CursorPage<Policy> = await listPolicies({
      cursor,
      limit: POLICY_CONTEXT_PAGE_LIMIT,
    });

    policies.push(...page.data);

    if (!page.pageInfo.hasNextPage || !page.pageInfo.nextCursor) {
      return { isPartial: false, policies };
    }

    cursor = page.pageInfo.nextCursor;
    isPartial = true;
  }

  return { isPartial, policies };
};

function MetricCard({ detail, icon: Icon, label, tone, value }: Metric) {
  return (
    <section className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-ink">{value}</p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-control ring-1 ring-inset ${metricToneClasses[tone]}`}
        >
          <Icon aria-hidden="true" size={19} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </section>
  );
}

type CompanyCardProps = {
  company: Company;
  onViewPolicies: (company: Company) => void;
  stats?: CompanyStats;
};

function CompanyCard({ company, onViewPolicies, stats }: CompanyCardProps) {
  const technologies = stats ? [...stats.technologies].slice(0, 4) : [];
  const countries = stats ? [...stats.countries.entries()].slice(0, 4) : [];

  return (
    <article className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{company.name}</h2>
          <p className="mt-1 text-sm text-muted">
            <CountryLabel country={company.hqCountry} />
          </p>
        </div>
        <Badge tone={getEntityStatusTone(company.entityListStatus)}>
          {company.entityListStatus ?? 'Not listed'}
        </Badge>
      </div>

      {company.aliases.length ? (
        <p className="mt-3 text-sm leading-6 text-muted">{company.aliases.join(', ')}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Policies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(stats?.policyCount ?? 0)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Technologies</p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {formatCount(stats?.technologies.size ?? 0)}
          </p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Latest policy</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatDate(stats?.latestPolicyDate)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {technologies.map((technology) => (
          <Badge key={technology} tone="slate">
            {technology}
          </Badge>
        ))}
        {countries.map(([isoCode, name]) => (
          <CountryPill isoCode={isoCode} key={isoCode} name={name} />
        ))}
      </div>

      <div className="mt-4">
        <Link
          className="inline-flex h-8 items-center justify-center rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href="/policies"
          onClick={() => onViewPolicies(company)}
        >
          View policies
        </Link>
      </div>
    </article>
  );
}

export function CompanyExplorerPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const user = useAuthStore((state) => state.user);
  const companyFilters = useUiStore((state) => state.companyFilters);
  const resetCompanyFilters = useUiStore((state) => state.resetCompanyFilters);
  const resetPolicyFilters = useUiStore((state) => state.resetPolicyFilters);
  const setCompanyFilters = useUiStore((state) => state.setCompanyFilters);
  const setPolicyFilter = useUiStore((state) => state.setPolicyFilter);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<CompanyFilters>(() => useUiStore.getState().companyFilters);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolicyContextPartial, setIsPolicyContextPartial] = useState(false);
  const [options, setOptions] = useState<CompanyOptionState>(emptyOptions);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyPageInfo);
  const [policyStats, setPolicyStats] = useState<Map<string, CompanyStats>>(new Map());
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const resetPagination = useCallback(() => {
    setCursor(undefined);
    setCursorStack([]);
  }, []);

  const countryOptions = useMemo(
    () => toFilterOptions(options.countries.map((country) => country.name)),
    [options.countries],
  );

  const statusOptions = useMemo(
    () => toFilterOptions(options.companies.map((company) => company.entityListStatus ?? '')),
    [options.companies],
  );

  const filteredCompanies = useMemo(
    () => companies.filter((company) => matchesCompanySearch(company, searchQuery)),
    [companies, searchQuery],
  );

  const policyLinkedCompanyCount = useMemo(
    () => companies.filter((company) => (policyStats.get(company.id)?.policyCount ?? 0) > 0).length,
    [companies, policyStats],
  );

  const entityListedCompanyCount = useMemo(
    () => companies.filter((company) => company.entityListStatus?.toLowerCase().includes('entity')).length,
    [companies],
  );

  const restrictedCountryCount = useMemo(
    () =>
      new Set(
        companies
          .filter((company) => company.entityListStatus)
          .map((company) => company.hqCountryId),
      ).size,
    [companies],
  );

  const topCountries = useMemo(() => getTopCountries(filteredCompanies), [filteredCompanies]);
  const statusDistribution = useMemo(
    () => getStatusDistribution(filteredCompanies),
    [filteredCompanies],
  );

  const metrics = useMemo<Metric[]>(
    () => [
      {
        detail: pageInfo.hasNextPage ? 'Showing current result page' : 'Loaded from company records',
        icon: Building2,
        label: 'Companies loaded',
        tone: 'slate',
        value: formatCount(companies.length),
      },
      {
        detail: isPolicyContextPartial ? 'From the loaded policy context window' : 'Matched through policy joins',
        icon: FileSearch,
        label: 'Policy-linked companies',
        tone: 'sky',
        value: formatCount(policyLinkedCompanyCount),
      },
      {
        detail: 'Companies marked by list status',
        icon: ShieldAlert,
        label: 'Entity-list records',
        tone: 'amber',
        value: formatCount(entityListedCompanyCount),
      },
      {
        detail: 'Headquarters countries with listed companies',
        icon: Globe2,
        label: 'Restricted HQ countries',
        tone: 'emerald',
        value: formatCount(restrictedCountryCount),
      },
    ],
    [
      companies.length,
      entityListedCompanyCount,
      isPolicyContextPartial,
      pageInfo.hasNextPage,
      policyLinkedCompanyCount,
      restrictedCountryCount,
    ],
  );

  const viewCompanyPolicies = useCallback(
    (company: Company) => {
      resetPolicyFilters();
      setPolicyFilter('company', company.name);
    },
    [resetPolicyFilters, setPolicyFilter],
  );

  const companyColumns = useMemo<DataTableColumn<Company>[]>(
    () => [
      {
        cell: (company) => (
          <div>
            <p className="font-semibold text-ink">{company.name}</p>
            {company.aliases.length ? (
              <p className="mt-1 text-xs text-muted">{company.aliases.slice(0, 2).join(', ')}</p>
            ) : (
              <p className="mt-1 text-xs text-muted">No aliases listed</p>
            )}
          </div>
        ),
        header: 'Company',
        id: 'company',
        isRowHeader: true,
        width: '28%',
      },
      {
        cell: (company) => <CountryLabel country={company.hqCountry} />,
        header: 'HQ Country',
        id: 'country',
        width: '16%',
      },
      {
        cell: (company) => (
          <Badge tone={getEntityStatusTone(company.entityListStatus)}>
            {company.entityListStatus ?? 'Not listed'}
          </Badge>
        ),
        header: 'List Status',
        id: 'status',
        width: '16%',
      },
      {
        align: 'right',
        cell: (company) => formatCount(policyStats.get(company.id)?.policyCount ?? 0),
        header: 'Policies',
        id: 'policies',
        width: '10%',
      },
      {
        align: 'right',
        cell: (company) => formatCount(policyStats.get(company.id)?.technologies.size ?? 0),
        header: 'Technologies',
        id: 'technologies',
        width: '12%',
      },
      {
        cell: (company) => formatDate(policyStats.get(company.id)?.latestPolicyDate),
        header: 'Latest Policy',
        id: 'latestPolicy',
        width: '14%',
      },
      {
        cell: (company) => (
          <Link
            className="font-medium text-brand hover:text-brand-hover"
            href="/policies"
            onClick={() => viewCompanyPolicies(company)}
          >
            Policies
          </Link>
        ),
        header: 'Link',
        id: 'link',
        width: '4%',
      },
    ],
    [policyStats, viewCompanyPolicies],
  );

  const loadCompanyData = useCallback(async () => {
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

      const companyQuery: CompaniesQuery = {
        ...companyFilters,
        cursor,
        limit: COMPANY_PAGE_SIZE,
      };

      const [companyPage, optionCompanyPage, countryPage, policyContext] = await Promise.all([
        listCompanies(companyQuery),
        listCompanies({ limit: OPTION_LIMIT }),
        listCountries({ limit: OPTION_LIMIT }),
        loadPolicyContext(),
      ]);

      setCompanies(companyPage.data);
      setOptions({
        companies: optionCompanyPage.data,
        countries: countryPage.data,
      });
      setPageInfo(companyPage.pageInfo);
      setPolicyStats(buildCompanyStats(policyContext.policies));
      setIsPolicyContextPartial(policyContext.isPartial);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [companyFilters, cursor, loadProfile, router]);

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
      void loadCompanyData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, loadCompanyData, router]);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setDraftFilters(companyFilters);
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [companyFilters]);

  const applyFilters = useCallback(() => {
    resetPagination();
    setCompanyFilters(draftFilters);
  }, [draftFilters, resetPagination, setCompanyFilters]);

  const resetFilters = useCallback(() => {
    setDraftFilters({});
    setSearchDraft('');
    setSearchQuery('');
    resetPagination();
    resetCompanyFilters();
  }, [resetCompanyFilters, resetPagination]);

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

  const updateDraftFilter = useCallback(
    (key: keyof CompanyFilters, value: string) => {
      setDraftFilters((filters) => ({
        ...filters,
        [key]: value || undefined,
      }));
    },
    [],
  );

  return (
    <DashboardShell
      actions={
        <Button
          isLoading={isLoading}
          leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={() => void loadCompanyData()}
          variant="secondary"
        >
          Refresh
        </Button>
      }
      activeItem="companies"
      description="Review companies linked to export-control records, headquarters exposure, list status, and related policy coverage."
      eyebrow="Company explorer"
      title="Companies"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Company records unavailable">
          <div className="flex gap-3 text-sm text-danger">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <section
                aria-hidden="true"
                className="rounded-panel border border-line bg-surface p-4 shadow-panel"
                key={index}
              >
                <div className="h-4 w-28 rounded-control bg-line" />
                <div className="mt-4 h-8 w-16 rounded-control bg-line" />
                <div className="mt-4 h-4 w-40 rounded-control bg-line" />
              </section>
            ))
          : metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <Panel
            actions={
              <Badge tone={pageInfo.hasNextPage ? 'amber' : 'slate'}>
                {pageInfo.hasNextPage
                  ? `${formatCount(COMPANY_PAGE_SIZE)} shown`
                  : `${formatCount(filteredCompanies.length)} shown`}
              </Badge>
            }
            description="Search the loaded company records by name, aliases, headquarters country, or list status."
            title="Search Companies"
          >
            <SearchBar
              disabled={isLoading}
              label="Search companies"
              onClear={() => {
                setSearchDraft('');
                setSearchQuery('');
              }}
              onDebouncedChange={setSearchQuery}
              onSearch={setSearchQuery}
              onValueChange={setSearchDraft}
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
            columns={companyColumns}
            description="Curated company records with headquarters and policy exposure."
            emptyState="No companies match the current search and filters."
            isLoading={isLoading}
            rowKey={(company) => company.id}
            rows={filteredCompanies}
            title="Company Results"
          />

          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Company Cards</h2>
                <p className="mt-1 text-sm text-muted">
                  Compact company exposure summaries from the current result page.
                </p>
              </div>
              <Badge tone="slate">{formatCount(filteredCompanies.slice(0, 3).length)} shown</Badge>
            </div>

            {isLoading ? (
              <Panel>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Spinner label="Loading companies" />
                  <span>Loading companies</span>
                </div>
              </Panel>
            ) : filteredCompanies.length ? (
              filteredCompanies.slice(0, 3).map((company) => (
                <CompanyCard
                  company={company}
                  key={company.id}
                  onViewPolicies={viewCompanyPolicies}
                  stats={policyStats.get(company.id)}
                />
              ))
            ) : (
              <Panel>No company cards to show.</Panel>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <Panel
            actions={
              <Button
                disabled={isLoading || (getActiveFilterCount(companyFilters) === 0 && !searchQuery)}
                leadingIcon={<RotateCcw aria-hidden="true" size={16} strokeWidth={2} />}
                onClick={resetFilters}
                size="sm"
                variant="ghost"
              >
                Reset
              </Button>
            }
            description="Refine company records by headquarters country and list status."
            title="Filters"
          >
            <div className="grid min-w-0 gap-4">
              <label className="grid min-w-0 gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Country</span>
                <select
                  className="h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
                  disabled={isLoading}
                  onChange={(event) => updateDraftFilter('country', event.target.value)}
                  value={draftFilters.country ?? ''}
                >
                  <option value="">All</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid min-w-0 gap-1.5">
                <span className="text-sm font-medium text-ink-soft">List status</span>
                <select
                  className="h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
                  disabled={isLoading}
                  onChange={(event) => updateDraftFilter('entityListStatus', event.target.value)}
                  value={draftFilters.entityListStatus ?? ''}
                >
                  <option value="">All</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex justify-end">
                <Button disabled={isLoading} onClick={applyFilters} size="sm">
                  Apply filters
                </Button>
              </div>
            </div>
          </Panel>

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
                <span className="text-sm font-semibold text-ink">{formatCount(filteredCompanies.length)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Filter aria-hidden="true" size={16} strokeWidth={2} />
                  Active filters
                </span>
                <span className="text-sm font-semibold text-ink">
                  {formatCount(getActiveFilterCount(companyFilters) + (searchQuery ? 1 : 0))}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Landmark aria-hidden="true" size={16} strokeWidth={2} />
                  HQ countries
                </span>
                <span className="text-sm font-semibold text-ink">
                  {formatCount(new Set(filteredCompanies.map((company) => company.hqCountryId)).size)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Cpu aria-hidden="true" size={16} strokeWidth={2} />
                  Technologies
                </span>
                <span className="text-sm font-semibold text-ink">
                  {formatCount(
                    new Set(
                      filteredCompanies.flatMap((company) => [...(policyStats.get(company.id)?.technologies ?? [])]),
                    ).size,
                  )}
                </span>
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
      </div>
    </DashboardShell>
  );
}
