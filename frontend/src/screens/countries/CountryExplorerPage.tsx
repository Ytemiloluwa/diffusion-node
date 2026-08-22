'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Globe2,
  Layers3,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge, Button, CountryFlag, Panel, Spinner, type BadgeProps } from '@/components/atoms';
import { PaginationControls, SearchBar } from '@/components/molecules';
import {
  DataTable,
  WorldExposureMap,
  type DataTableColumn,
  type MapExposureMode,
  type MapCountryDatum,
} from '@/components/organisms';
import { DashboardShell } from '@/components/templates';
import {
  listCompanies,
  listCountries,
  listPolicies,
  listRestrictions,
  type Company,
  type CountryWithRestrictionSummary,
  type CursorPage,
  type PageInfo,
  type Policy,
  type RestrictionType,
} from '@/lib/api';
import {
  formatCount,
  formatDate,
  getDisplayName,
  getInitials,
  getPolicyDate,
  getRestrictionCount,
  metricToneClasses,
  toErrorMessage,
  toFilterOptions,
  type MetricTone,
} from '@/screens/shared';
import { useAuthStore, useUiStore } from '@/store';

const COUNTRY_PAGE_SIZE = 20;
const OPTION_LIMIT = 100;
const POLICY_CONTEXT_PAGE_LIMIT = 100;
const POLICY_CONTEXT_PAGE_CAP = 5;

type CountryFilterState = {
  restriction?: string;
  tier?: string;
};

type CountryExposure = CountryWithRestrictionSummary & {
  activePolicyCount: number;
  companyCount: number;
  companyNames: string[];
  latestPolicyDate: string | null;
  policyCount: number;
  restrictionCount: number;
  restrictionTypes: string[];
  technologyCount: number;
  technologyNames: string[];
};

type Metric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

type CountryOptionState = {
  restrictions: RestrictionType[];
};

const emptyPageInfo: PageInfo = {
  hasNextPage: false,
  limit: COUNTRY_PAGE_SIZE,
  nextCursor: null,
};

const emptyOptions: CountryOptionState = {
  restrictions: [],
};

const mapModeOptions: Array<{ label: string; value: MapExposureMode }> = [
  { label: 'Active Policies', value: 'policies' },
  { label: 'Restrictions', value: 'restrictions' },
  { label: 'Tier', value: 'tier' },
];

const tierToneClasses: Record<string, BadgeProps['tone']> = {
  'Group A:5': 'sky',
  'Group A:6': 'amber',
  'Group D:5': 'red',
};

const createCountryExposure = (country: CountryWithRestrictionSummary): CountryExposure => ({
  ...country,
  activePolicyCount: 0,
  companyCount: 0,
  companyNames: [],
  latestPolicyDate: null,
  policyCount: 0,
  restrictionCount: getRestrictionCount(country),
  restrictionTypes: [],
  technologyCount: 0,
  technologyNames: [],
});

const buildCountryExposure = (
  countries: CountryWithRestrictionSummary[],
  policies: Policy[],
  companies: Company[],
): CountryExposure[] => {
  const exposureByCountryId = new Map<string, CountryExposure>();
  const policyIdsByCountryId = new Map<string, Set<string>>();
  const activePolicyIdsByCountryId = new Map<string, Set<string>>();
  const restrictionTypesByCountryId = new Map<string, Set<string>>();
  const technologiesByCountryId = new Map<string, Set<string>>();
  const companyNamesByCountryId = new Map<string, Set<string>>();

  countries.forEach((country) => {
    exposureByCountryId.set(country.id, createCountryExposure(country));
  });

  const ensureExposure = (country: CountryWithRestrictionSummary): CountryExposure => {
    const existingExposure = exposureByCountryId.get(country.id);

    if (existingExposure) {
      return existingExposure;
    }

    const exposure = createCountryExposure(country);
    exposureByCountryId.set(country.id, exposure);
    return exposure;
  };

  policies.forEach((policy) => {
    const policyDate = getPolicyDate(policy);

    policy.jurisdictions.forEach((jurisdiction) => {
      const exposure = ensureExposure({
        ...jurisdiction.country,
        jurisdictions: [],
        restrictionSummary: {},
      });
      const policyIds = policyIdsByCountryId.get(exposure.id) ?? new Set<string>();
      const activePolicyIds = activePolicyIdsByCountryId.get(exposure.id) ?? new Set<string>();
      const restrictionTypes = restrictionTypesByCountryId.get(exposure.id) ?? new Set<string>();
      const technologies = technologiesByCountryId.get(exposure.id) ?? new Set<string>();

      policyIds.add(policy.id);
      restrictionTypes.add(jurisdiction.restrictionType.name);

      if (policy.status === 'ACTIVE') {
        activePolicyIds.add(policy.id);
      }

      policy.technologies.forEach(({ technology }) => {
        technologies.add(technology.name);
      });

      if (
        policyDate &&
        (!exposure.latestPolicyDate ||
          new Date(policyDate).getTime() > new Date(exposure.latestPolicyDate).getTime())
      ) {
        exposure.latestPolicyDate = policyDate;
      }

      policyIdsByCountryId.set(exposure.id, policyIds);
      activePolicyIdsByCountryId.set(exposure.id, activePolicyIds);
      restrictionTypesByCountryId.set(exposure.id, restrictionTypes);
      technologiesByCountryId.set(exposure.id, technologies);
    });
  });

  companies.forEach((company) => {
    const companyNames = companyNamesByCountryId.get(company.hqCountryId) ?? new Set<string>();
    companyNames.add(company.name);
    companyNamesByCountryId.set(company.hqCountryId, companyNames);
  });

  return [...exposureByCountryId.values()]
    .map((country) => {
      const policyIds = policyIdsByCountryId.get(country.id) ?? new Set<string>();
      const activePolicyIds = activePolicyIdsByCountryId.get(country.id) ?? new Set<string>();
      const restrictionTypes = restrictionTypesByCountryId.get(country.id) ?? new Set<string>();
      const technologies = technologiesByCountryId.get(country.id) ?? new Set<string>();
      const companyNames = companyNamesByCountryId.get(country.id) ?? new Set<string>();

      return {
        ...country,
        activePolicyCount: activePolicyIds.size,
        companyCount: companyNames.size,
        companyNames: [...companyNames].sort((left, right) => left.localeCompare(right)),
        policyCount: policyIds.size,
        restrictionCount: Math.max(country.restrictionCount, restrictionTypes.size),
        restrictionTypes: [...restrictionTypes].sort((left, right) => left.localeCompare(right)),
        technologyCount: technologies.size,
        technologyNames: [...technologies].sort((left, right) => left.localeCompare(right)),
      };
    })
    .sort(
      (left, right) =>
        right.activePolicyCount - left.activePolicyCount ||
        right.restrictionCount - left.restrictionCount ||
        left.name.localeCompare(right.name),
    );
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

const matchesCountrySearch = (country: CountryExposure, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    country.name,
    country.isoCode,
    country.tierClassification,
    ...country.restrictionTypes,
    ...country.companyNames,
    ...country.technologyNames,
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedQuery));
};

const getActiveFilterCount = (filters: CountryFilterState, selectedCountryId?: string | null): number =>
  Object.values(filters).filter((value) => value !== undefined && value !== '').length +
  (selectedCountryId ? 1 : 0);

const getTierTone = (tierClassification?: string | null): BadgeProps['tone'] =>
  tierClassification ? (tierToneClasses[tierClassification] ?? 'slate') : 'slate';

const getTopCountries = (countries: CountryExposure[]): CountryExposure[] =>
  [...countries]
    .sort(
      (left, right) =>
        right.activePolicyCount - left.activePolicyCount ||
        right.restrictionCount - left.restrictionCount ||
        left.name.localeCompare(right.name),
    )
    .slice(0, 6);

const getTierDistribution = (
  countries: CountryExposure[],
): Array<{ count: number; tier: string | null }> => {
  const counts = countries.reduce<Record<string, { count: number; tier: string | null }>>((distribution, country) => {
    const key = country.tierClassification ?? 'Unclassified';
    distribution[key] = {
      count: (distribution[key]?.count ?? 0) + 1,
      tier: country.tierClassification,
    };
    return distribution;
  }, {});

  return Object.values(counts).sort(
    (left, right) => right.count - left.count || (left.tier ?? '').localeCompare(right.tier ?? ''),
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

function CountryLabel({ country }: { country: CountryExposure }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CountryFlag countryCode={country.isoCode} countryName={country.name} />
      <span>{country.name}</span>
    </span>
  );
}

function CountrySnapshot({
  country,
  onViewCompanies,
  onViewPolicies,
}: {
  country: CountryExposure;
  onViewCompanies: (country: CountryExposure) => void;
  onViewPolicies: (country: CountryExposure) => void;
}) {
  return (
    <Panel
      actions={<Badge tone={getTierTone(country.tierClassification)}>{country.tierClassification ?? 'No tier'}</Badge>}
      title={country.name}
    >
      <p className="mb-4 text-sm text-muted">
        <CountryLabel country={country} />
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Active policies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(country.activePolicyCount)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Restrictions</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(country.restrictionCount)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Companies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(country.companyCount)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Technologies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(country.technologyCount)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {country.restrictionTypes.slice(0, 4).map((restriction) => (
          <Badge key={restriction} tone="slate">
            {restriction}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => onViewPolicies(country)} size="sm" variant="secondary">
          View policies
        </Button>
        <Button onClick={() => onViewCompanies(country)} size="sm" variant="ghost">
          View companies
        </Button>
      </div>
    </Panel>
  );
}

export function CountryExplorerPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const user = useAuthStore((state) => state.user);
  const resetCompanyFilters = useUiStore((state) => state.resetCompanyFilters);
  const resetPolicyFilters = useUiStore((state) => state.resetPolicyFilters);
  const setCompanyFilter = useUiStore((state) => state.setCompanyFilter);
  const setPolicyFilter = useUiStore((state) => state.setPolicyFilter);
  const [countries, setCountries] = useState<CountryExposure[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<CountryFilterState>({});
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CountryFilterState>({});
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolicyContextPartial, setIsPolicyContextPartial] = useState(false);
  const [mapMode, setMapMode] = useState<MapExposureMode>('policies');
  const [options, setOptions] = useState<CountryOptionState>(emptyOptions);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyPageInfo);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);

  const resetPagination = useCallback(() => {
    setCursor(undefined);
    setCursorStack([]);
  }, []);

  const tierOptions = useMemo(
    () => toFilterOptions(countries.map((country) => country.tierClassification ?? '')),
    [countries],
  );

  const restrictionOptions = useMemo(
    () => toFilterOptions(options.restrictions.map((restriction) => restriction.name)),
    [options.restrictions],
  );

  const filteredCountries = useMemo(
    () =>
      countries.filter((country) => {
        if (selectedCountryId && country.id !== selectedCountryId) {
          return false;
        }

        if (filters.tier && country.tierClassification !== filters.tier) {
          return false;
        }

        if (filters.restriction && !country.restrictionTypes.includes(filters.restriction)) {
          return false;
        }

        return matchesCountrySearch(country, searchQuery);
      }),
    [countries, filters.restriction, filters.tier, searchQuery, selectedCountryId],
  );

  const selectedCountry = useMemo(
    () => countries.find((country) => country.id === selectedCountryId) ?? null,
    [countries, selectedCountryId],
  );

  const mapCountries = useMemo<MapCountryDatum[]>(
    () =>
      countries.map((country) => ({
        activePolicyCount: country.activePolicyCount,
        countryId: country.id,
        isoCode: country.isoCode,
        name: country.name,
        policyCount: country.policyCount,
        restrictionCount: country.restrictionCount,
        tierClassification: country.tierClassification,
      })),
    [countries],
  );

  const topCountries = useMemo(() => getTopCountries(filteredCountries), [filteredCountries]);
  const tierDistribution = useMemo(() => getTierDistribution(filteredCountries), [filteredCountries]);

  const metrics = useMemo<Metric[]>(
    () => [
      {
        detail: pageInfo.hasNextPage ? 'Showing current result page' : 'Loaded country records',
        icon: Globe2,
        label: 'Countries loaded',
        tone: 'slate',
        value: formatCount(countries.length),
      },
      {
        detail: isPolicyContextPartial ? 'From the loaded policy context window' : 'Countries in active records',
        icon: ShieldAlert,
        label: 'Active exposure',
        tone: 'amber',
        value: formatCount(countries.filter((country) => country.activePolicyCount > 0).length),
      },
      {
        detail: 'Companies headquartered in loaded countries',
        icon: Building2,
        label: 'Linked companies',
        tone: 'sky',
        value: formatCount(countries.reduce((total, country) => total + country.companyCount, 0)),
      },
      {
        detail: 'Unique technology links across exposed countries',
        icon: Layers3,
        label: 'Technology scope',
        tone: 'emerald',
        value: formatCount(
          new Set(countries.flatMap((country) => country.technologyNames)).size,
        ),
      },
    ],
    [countries, isPolicyContextPartial, pageInfo.hasNextPage],
  );

  const countryColumns = useMemo<DataTableColumn<CountryExposure>[]>(
    () => [
      {
        cell: (country) => (
          <div>
            <p className="font-semibold text-ink">
              <CountryLabel country={country} />
            </p>
            <p className="mt-1 text-xs text-muted">{country.isoCode}</p>
          </div>
        ),
        header: 'Country',
        id: 'country',
        isRowHeader: true,
        sortValue: (country) => country.name,
        width: '24%',
      },
      {
        cell: (country) => (
          <Badge tone={getTierTone(country.tierClassification)}>
            {country.tierClassification ?? 'Unclassified'}
          </Badge>
        ),
        header: 'Tier',
        id: 'tier',
        sortValue: (country) => country.tierClassification,
        width: '14%',
      },
      {
        align: 'right',
        cell: (country) => formatCount(country.restrictionCount),
        header: 'Restrictions',
        id: 'restrictions',
        sortValue: (country) => country.restrictionCount,
        width: '12%',
      },
      {
        align: 'right',
        cell: (country) => formatCount(country.activePolicyCount),
        header: 'Active Policies',
        id: 'activePolicies',
        sortValue: (country) => country.activePolicyCount,
        width: '14%',
      },
      {
        align: 'right',
        cell: (country) => formatCount(country.companyCount),
        header: 'Companies',
        id: 'companies',
        sortValue: (country) => country.companyCount,
        width: '12%',
      },
      {
        align: 'right',
        cell: (country) => formatCount(country.technologyCount),
        header: 'Technologies',
        id: 'technologies',
        sortValue: (country) => country.technologyCount,
        width: '12%',
      },
      {
        cell: (country) => formatDate(country.latestPolicyDate),
        header: 'Latest Policy',
        id: 'latestPolicy',
        sortValue: (country) => country.latestPolicyDate,
        width: '12%',
      },
    ],
    [],
  );

  const viewCountryPolicies = useCallback(
    (country: CountryExposure) => {
      resetPolicyFilters();
      setPolicyFilter('country', country.name);
      router.push('/policies');
    },
    [resetPolicyFilters, router, setPolicyFilter],
  );

  const viewCountryCompanies = useCallback(
    (country: CountryExposure) => {
      resetCompanyFilters();
      setCompanyFilter('country', country.name);
      router.push('/companies');
    },
    [resetCompanyFilters, router, setCompanyFilter],
  );

  const loadCountryData = useCallback(async () => {
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

      const [countryPage, companyPage, restrictions, policyContext] = await Promise.all([
        listCountries({ cursor, limit: COUNTRY_PAGE_SIZE }),
        listCompanies({ limit: OPTION_LIMIT }),
        listRestrictions(),
        loadPolicyContext(),
      ]);

      setCountries(buildCountryExposure(countryPage.data, policyContext.policies, companyPage.data));
      setOptions({ restrictions });
      setPageInfo(countryPage.pageInfo);
      setIsPolicyContextPartial(policyContext.isPartial);
    } catch (loadError) {
      setError(toErrorMessage(loadError, 'Country records could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  }, [cursor, loadProfile, router]);

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
      void loadCountryData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, loadCountryData, router]);

  const applyFilters = useCallback(() => {
    resetPagination();
    setFilters(draftFilters);
  }, [draftFilters, resetPagination]);

  const resetFilters = useCallback(() => {
    setDraftFilters({});
    setFilters({});
    setSearchDraft('');
    setSearchQuery('');
    setSelectedCountryId(null);
    resetPagination();
  }, [resetPagination]);

  const goToNextPage = useCallback(() => {
    if (!pageInfo.nextCursor) {
      return;
    }

    setCursorStack((stack) => [...stack, cursor ?? '']);
    setCursor(pageInfo.nextCursor);
    setSelectedCountryId(null);
  }, [cursor, pageInfo.nextCursor]);

  const goToPreviousPage = useCallback(() => {
    setCursorStack((stack) => {
      const nextStack = [...stack];
      const previousCursor = nextStack.pop();
      setCursor(previousCursor || undefined);
      setSelectedCountryId(null);
      return nextStack;
    });
  }, []);

  const updateDraftFilter = useCallback(
    (key: keyof CountryFilterState, value: string) => {
      setDraftFilters((currentFilters) => ({
        ...currentFilters,
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
          onClick={() => void loadCountryData()}
          variant="secondary"
        >
          Refresh
        </Button>
      }
      activeItem="countries"
      description="Review jurisdiction exposure, policy tiers, company headquarters, and affected technology scope by country."
      eyebrow="Country explorer"
      title="Countries"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Country records unavailable">
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
              <div className="inline-flex rounded-control border border-line-strong bg-surface p-0.5 shadow-control">
                {mapModeOptions.map((option) => {
                  const isActive = option.value === mapMode;

                  return (
                    <button
                      aria-pressed={isActive}
                      className={`h-8 rounded-control px-3 text-xs font-semibold transition-colors ${
                        isActive ? 'bg-brand text-brand-contrast shadow-control' : 'text-muted hover:text-ink'
                      }`}
                      key={option.value}
                      onClick={() => setMapMode(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            }
            description="Countries are shaded by the selected exposure metric."
            title="World Exposure Map"
          >
            {isLoading ? (
              <div className="flex min-h-[22rem] items-center justify-center gap-3 text-sm text-muted">
                <Spinner label="Loading country map" />
                <span>Loading country map</span>
              </div>
            ) : (
              <WorldExposureMap
                countries={mapCountries}
                mode={mapMode}
                onSelectCountry={(countryId) => setSelectedCountryId(countryId)}
                selectedCountryId={selectedCountryId}
              />
            )}
          </Panel>

          <Panel
            actions={
              <Badge tone={pageInfo.hasNextPage ? 'amber' : 'slate'}>
                {pageInfo.hasNextPage
                  ? `${formatCount(COUNTRY_PAGE_SIZE)} shown`
                  : `${formatCount(filteredCountries.length)} shown`}
              </Badge>
            }
            description="Search by country, ISO code, tier, restriction, linked company, or affected technology."
            title="Search Countries"
          >
            <SearchBar
              disabled={isLoading}
              label="Search countries"
              onClear={() => {
                setSearchDraft('');
                setSearchQuery('');
              }}
              onDebouncedChange={setSearchQuery}
              onSearch={setSearchQuery}
              onValueChange={setSearchDraft}
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
            columns={countryColumns}
            description="Curated country records with jurisdiction, company, and technology exposure."
            emptyState="No countries match the current search and filters."
            isLoading={isLoading}
            rowKey={(country) => country.id}
            rows={filteredCountries}
            title="Country Results"
          />
        </div>

        <aside className="space-y-5">
          <Panel
            actions={
              <Button
                disabled={isLoading || (getActiveFilterCount(filters, selectedCountryId) === 0 && !searchQuery)}
                leadingIcon={<RotateCcw aria-hidden="true" size={16} strokeWidth={2} />}
                onClick={resetFilters}
                size="sm"
                variant="ghost"
              >
                Reset
              </Button>
            }
            description="Refine countries by export-control tier and restriction type."
            title="Filters"
          >
            <div className="grid min-w-0 gap-4">
              <label className="grid min-w-0 gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Tier</span>
                <select
                  className="h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
                  disabled={isLoading}
                  onChange={(event) => updateDraftFilter('tier', event.target.value)}
                  value={draftFilters.tier ?? ''}
                >
                  <option value="">All</option>
                  {tierOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid min-w-0 gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Restriction</span>
                <select
                  className="h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
                  disabled={isLoading}
                  onChange={(event) => updateDraftFilter('restriction', event.target.value)}
                  value={draftFilters.restriction ?? ''}
                >
                  <option value="">All</option>
                  {restrictionOptions.map((option) => (
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

          {selectedCountry ? (
            <CountrySnapshot
              country={selectedCountry}
              onViewCompanies={viewCountryCompanies}
              onViewPolicies={viewCountryPolicies}
            />
          ) : null}

          <Panel description="Countries with the highest current exposure in this view." title="Exposure Ranking">
            {topCountries.length ? (
              <div className="space-y-3">
                {topCountries.map((country) => (
                  <button
                    className="flex w-full items-center justify-between gap-3 rounded-control px-2 py-1.5 text-left transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    key={country.id}
                    onClick={() => setSelectedCountryId(country.id)}
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
                  <Button onClick={() => viewCountryPolicies(selectedCountry)} variant="secondary">
                    View policy records
                  </Button>
                  <Button onClick={() => viewCountryCompanies(selectedCountry)} variant="ghost">
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
      </div>
    </DashboardShell>
  );
}
