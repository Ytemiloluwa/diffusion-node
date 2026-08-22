'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Cpu,
  FileSearch,
  Globe2,
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
  listCategories,
  listPolicies,
  listTechnologies,
  type CursorPage,
  type PageInfo,
  type Policy,
  type PolicyStatus,
  type TechnologiesQuery,
  type Technology,
  type TechnologyCategory,
} from '@/lib/api';
import {
  createPolicyStatusCounts,
  formatCount,
  formatDate,
  getDisplayName,
  getInitials,
  getPolicyDate,
  metricToneClasses,
  policyStatusLabels as statusLabels,
  policyStatusTones as statusTones,
  policyStatusValues,
  toErrorMessage,
  toFilterOptions,
  type MetricTone,
} from '@/screens/shared';
import { useAuthStore, useUiStore, type TechnologyFilters } from '@/store';

const TECHNOLOGY_PAGE_SIZE = 20;
const POLICY_CONTEXT_PAGE_LIMIT = 100;
const POLICY_CONTEXT_PAGE_CAP = 5;

type CountrySummary = {
  isoCode: string;
  name: string;
};

type TechnologyStats = {
  activePolicyCount: number;
  companies: Map<string, string>;
  countries: Map<string, CountrySummary>;
  latestPolicyDate: string | null;
  policyCount: number;
  statuses: Record<PolicyStatus, number>;
};

type Metric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

const emptyPageInfo: PageInfo = {
  hasNextPage: false,
  limit: TECHNOLOGY_PAGE_SIZE,
  nextCursor: null,
};

const emptyTechnologyStats = (): TechnologyStats => ({
  activePolicyCount: 0,
  companies: new Map<string, string>(),
  countries: new Map<string, CountrySummary>(),
  latestPolicyDate: null,
  policyCount: 0,
  statuses: createPolicyStatusCounts(),
});

const buildTechnologyStats = (policies: Policy[]): Map<string, TechnologyStats> => {
  const statsByTechnologyId = new Map<string, TechnologyStats>();

  policies.forEach((policy) => {
    policy.technologies.forEach(({ technologyId }) => {
      const stats = statsByTechnologyId.get(technologyId) ?? emptyTechnologyStats();
      const policyDate = getPolicyDate(policy);

      stats.policyCount += 1;
      stats.statuses[policy.status] += 1;

      if (policy.status === 'ACTIVE') {
        stats.activePolicyCount += 1;
      }

      policy.companies.forEach(({ company }) => {
        stats.companies.set(company.id, company.name);
      });
      policy.jurisdictions.forEach(({ country }) => {
        stats.countries.set(country.id, {
          isoCode: country.isoCode,
          name: country.name,
        });
      });

      if (
        policyDate &&
        (!stats.latestPolicyDate ||
          new Date(policyDate).getTime() > new Date(stats.latestPolicyDate).getTime())
      ) {
        stats.latestPolicyDate = policyDate;
      }

      statsByTechnologyId.set(technologyId, stats);
    });
  });

  return statsByTechnologyId;
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

const matchesTechnologySearch = (technology: Technology, stats: TechnologyStats | undefined, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    technology.name,
    technology.description,
    technology.category.name,
    ...(stats ? [...stats.companies.values()] : []),
    ...(stats ? [...stats.countries.values()].map((country) => country.name) : []),
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedQuery));
};

const getActiveFilterCount = (filters: TechnologyFilters): number =>
  Object.values(filters).filter((value) => value !== undefined && value !== '').length;

const getCategoryTone = (category: TechnologyCategory): BadgeProps['tone'] =>
  category.isActiveInV1 ? 'emerald' : 'slate';

const getTopTechnologies = (
  technologies: Technology[],
  statsByTechnologyId: Map<string, TechnologyStats>,
): Array<{ stats: TechnologyStats; technology: Technology }> =>
  technologies
    .map((technology) => ({
      stats: statsByTechnologyId.get(technology.id) ?? emptyTechnologyStats(),
      technology,
    }))
    .sort(
      (left, right) =>
        right.stats.activePolicyCount - left.stats.activePolicyCount ||
        right.stats.policyCount - left.stats.policyCount ||
        left.technology.name.localeCompare(right.technology.name),
    )
    .slice(0, 5);

const getCategoryDistribution = (
  technologies: Technology[],
): Array<{ category: TechnologyCategory; count: number }> => {
  const distribution = new Map<string, { category: TechnologyCategory; count: number }>();

  technologies.forEach((technology) => {
    const current = distribution.get(technology.categoryId);
    distribution.set(technology.categoryId, {
      category: technology.category,
      count: (current?.count ?? 0) + 1,
    });
  });

  return [...distribution.values()].sort(
    (left, right) => right.count - left.count || left.category.name.localeCompare(right.category.name),
  );
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

function CountryPill({ country }: { country: CountrySummary }) {
  return (
    <span className="inline-flex min-h-6 items-center gap-1.5 rounded-control bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-soft ring-1 ring-inset ring-line">
      <CountryFlag className="h-3.5 w-5" countryCode={country.isoCode} countryName={country.name} />
      <span>{country.name}</span>
    </span>
  );
}

function TechnologyCard({
  onViewPolicies,
  stats,
  technology,
}: {
  onViewPolicies: (technology: Technology) => void;
  stats?: TechnologyStats;
  technology: Technology;
}) {
  const companies = stats ? [...stats.companies.values()].slice(0, 3) : [];
  const countries = stats ? [...stats.countries.values()].slice(0, 4) : [];

  return (
    <article className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{technology.name}</h2>
          <p className="mt-1 text-sm text-muted">{technology.category.name}</p>
        </div>
        <Badge tone={getCategoryTone(technology.category)}>
          {technology.category.isActiveInV1 ? 'V1 scope' : 'Tracked'}
        </Badge>
      </div>

      {technology.description ? (
        <p className="mt-3 text-sm leading-6 text-muted">{technology.description}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Policies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(stats?.policyCount ?? 0)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Companies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(stats?.companies.size ?? 0)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Latest policy</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatDate(stats?.latestPolicyDate)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {countries.map((country) => (
          <CountryPill country={country} key={`${technology.id}-${country.isoCode}`} />
        ))}
        {companies.map((company) => (
          <Badge key={`${technology.id}-${company}`} tone="slate">
            {company}
          </Badge>
        ))}
      </div>

      <div className="mt-4">
        <Link
          className="inline-flex h-8 items-center justify-center rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href="/policies"
          onClick={() => onViewPolicies(technology)}
        >
          View policies
        </Link>
      </div>
    </article>
  );
}

export function TechnologyExplorerPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const user = useAuthStore((state) => state.user);
  const resetPolicyFilters = useUiStore((state) => state.resetPolicyFilters);
  const resetTechnologyFilters = useUiStore((state) => state.resetTechnologyFilters);
  const setPolicyFilter = useUiStore((state) => state.setPolicyFilter);
  const setTechnologyFilters = useUiStore((state) => state.setTechnologyFilters);
  const technologyFilters = useUiStore((state) => state.technologyFilters);
  const [categories, setCategories] = useState<TechnologyCategory[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<TechnologyFilters>(
    () => useUiStore.getState().technologyFilters,
  );
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolicyContextPartial, setIsPolicyContextPartial] = useState(false);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyPageInfo);
  const [policyStats, setPolicyStats] = useState<Map<string, TechnologyStats>>(new Map());
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [technologies, setTechnologies] = useState<Technology[]>([]);

  const resetPagination = useCallback(() => {
    setCursor(undefined);
    setCursorStack([]);
  }, []);

  const categoryOptions = useMemo(
    () => toFilterOptions(categories.map((category) => category.name)),
    [categories],
  );

  const filteredTechnologies = useMemo(
    () =>
      technologies.filter((technology) =>
        matchesTechnologySearch(technology, policyStats.get(technology.id), searchQuery),
      ),
    [policyStats, searchQuery, technologies],
  );

  const categoryDistribution = useMemo(
    () => getCategoryDistribution(filteredTechnologies),
    [filteredTechnologies],
  );

  const topTechnologies = useMemo(
    () => getTopTechnologies(filteredTechnologies, policyStats),
    [filteredTechnologies, policyStats],
  );

  const linkedTechnologyCount = useMemo(
    () => technologies.filter((technology) => (policyStats.get(technology.id)?.policyCount ?? 0) > 0).length,
    [policyStats, technologies],
  );

  const affectedCountryCount = useMemo(
    () =>
      new Set(
        technologies.flatMap((technology) => [...(policyStats.get(technology.id)?.countries.keys() ?? [])]),
      ).size,
    [policyStats, technologies],
  );

  const affectedCompanyCount = useMemo(
    () =>
      new Set(
        technologies.flatMap((technology) => [...(policyStats.get(technology.id)?.companies.keys() ?? [])]),
      ).size,
    [policyStats, technologies],
  );

  const statusCounts = useMemo(
    () =>
      filteredTechnologies.reduce<Record<PolicyStatus, number>>((counts, technology) => {
        const stats = policyStats.get(technology.id);

        if (!stats) {
          return counts;
        }

        policyStatusValues.forEach((status) => {
          counts[status] += stats.statuses[status];
        });

        return counts;
      }, createPolicyStatusCounts()),
    [filteredTechnologies, policyStats],
  );

  const metrics = useMemo<Metric[]>(
    () => [
      {
        detail: pageInfo.hasNextPage ? 'Showing current result page' : 'Loaded technology records',
        icon: Cpu,
        label: 'Technologies loaded',
        tone: 'slate',
        value: formatCount(technologies.length),
      },
      {
        detail: isPolicyContextPartial ? 'Matched from current policy coverage' : 'Matched through policy links',
        icon: FileSearch,
        label: 'Policy-linked technologies',
        tone: 'sky',
        value: formatCount(linkedTechnologyCount),
      },
      {
        detail: 'Companies connected through policy records',
        icon: Building2,
        label: 'Linked companies',
        tone: 'amber',
        value: formatCount(affectedCompanyCount),
      },
      {
        detail: 'Jurisdictions connected through policy records',
        icon: Globe2,
        label: 'Affected countries',
        tone: 'emerald',
        value: formatCount(affectedCountryCount),
      },
    ],
    [
      affectedCompanyCount,
      affectedCountryCount,
      isPolicyContextPartial,
      linkedTechnologyCount,
      pageInfo.hasNextPage,
      technologies.length,
    ],
  );

  const viewTechnologyPolicies = useCallback(
    (technology: Technology) => {
      resetPolicyFilters();
      setPolicyFilter('technology', technology.name);
    },
    [resetPolicyFilters, setPolicyFilter],
  );

  const technologyColumns = useMemo<DataTableColumn<Technology>[]>(
    () => [
      {
        cell: (technology) => (
          <div>
            <p className="font-semibold text-ink">{technology.name}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
              {technology.description ?? 'No description provided'}
            </p>
          </div>
        ),
        header: 'Technology',
        id: 'technology',
        isRowHeader: true,
        sortValue: (technology) => technology.name,
        width: '30%',
      },
      {
        cell: (technology) => (
          <Badge tone={getCategoryTone(technology.category)}>{technology.category.name}</Badge>
        ),
        header: 'Category',
        id: 'category',
        sortValue: (technology) => technology.category.name,
        width: '16%',
      },
      {
        align: 'right',
        cell: (technology) => formatCount(policyStats.get(technology.id)?.policyCount ?? 0),
        header: 'Policies',
        id: 'policies',
        sortValue: (technology) => policyStats.get(technology.id)?.policyCount ?? 0,
        width: '10%',
      },
      {
        align: 'right',
        cell: (technology) => formatCount(policyStats.get(technology.id)?.activePolicyCount ?? 0),
        header: 'Active',
        id: 'activePolicies',
        sortValue: (technology) => policyStats.get(technology.id)?.activePolicyCount ?? 0,
        width: '10%',
      },
      {
        align: 'right',
        cell: (technology) => formatCount(policyStats.get(technology.id)?.companies.size ?? 0),
        header: 'Companies',
        id: 'companies',
        sortValue: (technology) => policyStats.get(technology.id)?.companies.size ?? 0,
        width: '10%',
      },
      {
        cell: (technology) => {
          const countries = [...(policyStats.get(technology.id)?.countries.values() ?? [])].slice(0, 2);
          const hiddenCount = (policyStats.get(technology.id)?.countries.size ?? 0) - countries.length;

          return countries.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {countries.map((country) => (
                <CountryPill country={country} key={`${technology.id}-${country.isoCode}`} />
              ))}
              {hiddenCount > 0 ? <Badge tone="slate">+{formatCount(hiddenCount)}</Badge> : null}
            </div>
          ) : (
            <span className="text-muted">None</span>
          );
        },
        header: 'Countries',
        id: 'countries',
        sortValue: (technology) => policyStats.get(technology.id)?.countries.size ?? 0,
        width: '16%',
      },
      {
        cell: (technology) => formatDate(policyStats.get(technology.id)?.latestPolicyDate),
        header: 'Latest Policy',
        id: 'latestPolicy',
        sortValue: (technology) => policyStats.get(technology.id)?.latestPolicyDate,
        width: '12%',
      },
      {
        cell: (technology) => (
          <Link
            className="font-medium text-brand hover:text-brand-hover"
            href="/policies"
            onClick={() => viewTechnologyPolicies(technology)}
          >
            Policies
          </Link>
        ),
        header: 'Link',
        id: 'link',
        width: '6%',
      },
    ],
    [policyStats, viewTechnologyPolicies],
  );

  const loadTechnologyData = useCallback(async () => {
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

      const technologyQuery: TechnologiesQuery = {
        ...technologyFilters,
        cursor,
        limit: TECHNOLOGY_PAGE_SIZE,
      };

      const [technologyPage, categoryList, policyContext] = await Promise.all([
        listTechnologies(technologyQuery),
        listCategories(),
        loadPolicyContext(),
      ]);

      setCategories(categoryList);
      setTechnologies(technologyPage.data);
      setPageInfo(technologyPage.pageInfo);
      setPolicyStats(buildTechnologyStats(policyContext.policies));
      setIsPolicyContextPartial(policyContext.isPartial);
    } catch (loadError) {
      setError(toErrorMessage(loadError, 'Technology records could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  }, [cursor, loadProfile, router, technologyFilters]);

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
      void loadTechnologyData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, loadTechnologyData, router]);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setDraftFilters(technologyFilters);
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [technologyFilters]);

  const applyFilters = useCallback(() => {
    resetPagination();
    setTechnologyFilters(draftFilters);
  }, [draftFilters, resetPagination, setTechnologyFilters]);

  const resetFilters = useCallback(() => {
    setDraftFilters({});
    setSearchDraft('');
    setSearchQuery('');
    resetPagination();
    resetTechnologyFilters();
  }, [resetPagination, resetTechnologyFilters]);

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
    (key: keyof TechnologyFilters, value: string) => {
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
          onClick={() => void loadTechnologyData()}
          variant="secondary"
        >
          Refresh
        </Button>
      }
      activeItem="technology-explorer"
      description="Analyze controlled semiconductor and AI technologies, their categories, policy coverage, companies, and exposed jurisdictions."
      eyebrow="Technology explorer"
      title="Technology Explorer"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Technology records unavailable">
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
                  ? `${formatCount(TECHNOLOGY_PAGE_SIZE)} shown`
                  : `${formatCount(filteredTechnologies.length)} shown`}
              </Badge>
            }
            description="Search technologies by name, category, description, linked company, or country."
            title="Search Technologies"
          >
            <SearchBar
              disabled={isLoading}
              label="Search technologies"
              onClear={() => {
                setSearchDraft('');
                setSearchQuery('');
              }}
              onDebouncedChange={setSearchQuery}
              onSearch={setSearchQuery}
              onValueChange={setSearchDraft}
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
            columns={technologyColumns}
            description="Technology records with category, policy, company, and country exposure."
            emptyState="No technologies match the current search and filters."
            isLoading={isLoading}
            rowKey={(technology) => technology.id}
            rows={filteredTechnologies}
            title="Technology Results"
          />

          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Technology Cards</h2>
                <p className="mt-1 text-sm text-muted">
                  Compact technology exposure summaries from the current result page.
                </p>
              </div>
              <Badge tone="slate">{formatCount(filteredTechnologies.slice(0, 3).length)} shown</Badge>
            </div>

            {isLoading ? (
              <Panel>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Spinner label="Loading technologies" />
                  <span>Loading technologies</span>
                </div>
              </Panel>
            ) : filteredTechnologies.length ? (
              filteredTechnologies.slice(0, 3).map((technology) => (
                <TechnologyCard
                  key={technology.id}
                  onViewPolicies={viewTechnologyPolicies}
                  stats={policyStats.get(technology.id)}
                  technology={technology}
                />
              ))
            ) : (
              <Panel>No technology cards to show.</Panel>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <Panel
            actions={
              <Button
                disabled={isLoading || (getActiveFilterCount(technologyFilters) === 0 && !searchQuery)}
                leadingIcon={<RotateCcw aria-hidden="true" size={16} strokeWidth={2} />}
                onClick={resetFilters}
                size="sm"
                variant="ghost"
              >
                Reset
              </Button>
            }
            description="Refine technology records by category."
            title="Filters"
          >
            <div className="grid min-w-0 gap-4">
              <label className="grid min-w-0 gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Category</span>
                <select
                  className="h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
                  disabled={isLoading}
                  onChange={(event) => updateDraftFilter('category', event.target.value)}
                  value={draftFilters.category ?? ''}
                >
                  <option value="">All</option>
                  {categoryOptions.map((option) => (
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
            actions={<Badge tone="emerald">{formatCount(categories.length)} categories</Badge>}
            description="Technology categories returned by the reference dataset."
            title="Category Summary"
          >
            {categories.length ? (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div className="flex items-center justify-between gap-3" key={category.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{category.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {category.isActiveInV1 ? 'Included in active scope' : 'Tracked category'}
                      </p>
                    </div>
                    <Badge tone={getCategoryTone(category)}>
                      {formatCount(category._count?.technologies ?? 0)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No categories returned.</p>
            )}
          </Panel>

          <Panel description="Technology categories represented in the current result set." title="Result Mix">
            {categoryDistribution.length ? (
              <div className="space-y-3">
                {categoryDistribution.map(({ category, count }) => (
                  <div className="flex items-center justify-between gap-3" key={category.id}>
                    <Badge tone={getCategoryTone(category)}>{category.name}</Badge>
                    <span className="text-sm font-semibold text-ink">{formatCount(count)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No category mix available.</p>
            )}
          </Panel>

          <Panel description="Technologies with the broadest active policy exposure." title="Exposure Ranking">
            {topTechnologies.length ? (
              <div className="space-y-3">
                {topTechnologies.map(({ stats, technology }) => (
                  <div className="flex items-center justify-between gap-3" key={technology.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{technology.name}</p>
                      <p className="mt-1 text-xs text-muted">{technology.category.name}</p>
                    </div>
                    <Badge tone={stats.activePolicyCount > 0 ? 'amber' : 'slate'}>
                      {formatCount(stats.activePolicyCount)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No technology exposure to rank.</p>
            )}
          </Panel>

          <Panel description="Policy status mix across the current technology view." title="Policy Status">
            <div className="space-y-3">
              {policyStatusValues.map((status) => (
                <div className="flex items-center justify-between gap-3" key={status}>
                  <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>
                  <span className="text-sm font-semibold text-ink">{formatCount(statusCounts[status])}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </DashboardShell>
  );
}
