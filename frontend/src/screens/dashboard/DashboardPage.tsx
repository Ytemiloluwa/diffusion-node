'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CalendarDays,
  Cpu,
  Database,
  ExternalLink,
  Globe2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge, Button, CountryFlag, Panel, Spinner, type BadgeProps } from '@/components/atoms';
import { PolicyCard } from '@/components/molecules';
import { DataTable, TimelineFeed, type DataTableColumn, type TimelineFeedItem } from '@/components/organisms';
import { DashboardShell } from '@/components/templates';
import {
  listCompanies,
  listCountries,
  listPolicies,
  listTechnologies,
  listTimeline,
  type Company,
  type Country,
  type CountryWithRestrictionSummary,
  type Policy,
  type PolicyStatus,
  type Technology,
  type TimelineEventWithPolicy,
} from '@/lib/api';
import { useAuthStore } from '@/store';

const DASHBOARD_PAGE_LIMIT = 100;
const TIMELINE_LIMIT = 6;
const RECENT_POLICY_LIMIT = 3;

type DashboardData = {
  companies: Company[];
  countries: CountryWithRestrictionSummary[];
  hasMoreCompanies: boolean;
  hasMoreCountries: boolean;
  hasMorePolicies: boolean;
  hasMoreTechnologies: boolean;
  policies: Policy[];
  technologies: Technology[];
  timeline: TimelineEventWithPolicy[];
};

type MetricTone = 'amber' | 'emerald' | 'sky' | 'slate';

type Metric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

const emptyDashboardData: DashboardData = {
  companies: [],
  countries: [],
  hasMoreCompanies: false,
  hasMoreCountries: false,
  hasMorePolicies: false,
  hasMoreTechnologies: false,
  policies: [],
  technologies: [],
  timeline: [],
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

const metricToneClasses: Record<MetricTone, string> = {
  amber: 'bg-warning-soft text-warning ring-warning-line',
  emerald: 'bg-success-soft text-success ring-success-line',
  sky: 'bg-info-soft text-info ring-info-line',
  slate: 'bg-surface-muted text-ink-soft ring-line',
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

const getPolicySourceName = (policy: Policy): string =>
  policy.sources[0]?.sourceName ?? policy.documents[0]?.documentType ?? 'Source pending';

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

const getRestrictionCount = (country: CountryWithRestrictionSummary): number =>
  Object.values(country.restrictionSummary).reduce((total, count) => total + count, 0);

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Dashboard data could not be loaded.';
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

const policyColumns: DataTableColumn<Policy>[] = [
  {
    cell: (policy) => (
      <div>
        <p className="font-semibold text-ink">{policy.title}</p>
        <p className="mt-1 text-xs text-muted">{getPolicySourceName(policy)}</p>
      </div>
    ),
    header: 'Policy',
    id: 'policy',
    isRowHeader: true,
    sortValue: (policy) => policy.title,
    width: '32%',
  },
  {
    cell: (policy) => {
      const technologies = getPolicyTechnologyNames(policy);
      return technologies.length ? technologies.slice(0, 3).join(', ') : 'No linked technologies';
    },
    header: 'Technologies',
    id: 'technologies',
    sortValue: (policy) => getPolicyTechnologyNames(policy).join(', '),
    width: '24%',
  },
  {
    align: 'right',
    cell: (policy) => formatCount(policy.companies.length),
    header: 'Companies',
    id: 'companies',
    sortValue: (policy) => policy.companies.length,
    width: '11%',
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
    width: '15%',
  },
  {
    cell: (policy) => <Badge tone={statusTones[policy.status]}>{statusLabels[policy.status]}</Badge>,
    header: 'Status',
    id: 'status',
    sortValue: (policy) => statusLabels[policy.status],
    width: '9%',
  },
  {
    cell: (policy) => formatDate(policy.effectiveDate),
    header: 'Effective',
    id: 'effectiveDate',
    sortValue: (policy) => policy.effectiveDate,
    width: '9%',
  },
];

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

export function DashboardPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const user = useAuthStore((state) => state.user);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
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

      const [policiesPage, timelinePage, companiesPage, countriesPage, technologiesPage] =
        await Promise.all([
          listPolicies({ limit: DASHBOARD_PAGE_LIMIT }),
          listTimeline({ limit: TIMELINE_LIMIT }),
          listCompanies({ limit: DASHBOARD_PAGE_LIMIT }),
          listCountries({ limit: DASHBOARD_PAGE_LIMIT }),
          listTechnologies({ limit: DASHBOARD_PAGE_LIMIT }),
        ]);

      setData({
        companies: companiesPage.data,
        countries: countriesPage.data,
        hasMoreCompanies: companiesPage.pageInfo.hasNextPage,
        hasMoreCountries: countriesPage.pageInfo.hasNextPage,
        hasMorePolicies: policiesPage.pageInfo.hasNextPage,
        hasMoreTechnologies: technologiesPage.pageInfo.hasNextPage,
        policies: policiesPage.data,
        technologies: technologiesPage.data,
        timeline: timelinePage.data,
      });
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile, router]);

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
      return;
    }

    if (!accessToken) {
      router.replace('/auth');
      return;
    }

    const loadTimer = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, loadDashboardData, router]);

  const statusCounts = useMemo(
    () =>
      data.policies.reduce<Record<PolicyStatus, number>>(
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
    [data.policies],
  );

  const metrics = useMemo<Metric[]>(() => {
    const linkedTechnologyCount = new Set(
      data.policies.flatMap((policy) => policy.technologies.map(({ technologyId }) => technologyId)),
    ).size;
    const linkedCompanyCount = new Set(
      data.policies.flatMap((policy) => policy.companies.map(({ companyId }) => companyId)),
    ).size;
    const restrictedCountryCount = data.countries.filter((country) => getRestrictionCount(country) > 0)
      .length;

    return [
      {
        detail: data.hasMorePolicies ? 'Showing the first 100 records' : 'Loaded from policy records',
        icon: Database,
        label: 'Policies loaded',
        tone: 'slate',
        value: formatCount(data.policies.length),
      },
      {
        detail: `${formatCount(data.technologies.length)} technology records in scope`,
        icon: Cpu,
        label: 'Linked technologies',
        tone: 'sky',
        value: formatCount(linkedTechnologyCount),
      },
      {
        detail: `${formatCount(data.companies.length)} company records in scope`,
        icon: Building2,
        label: 'Linked companies',
        tone: 'emerald',
        value: formatCount(linkedCompanyCount),
      },
      {
        detail: data.hasMoreCountries ? 'Showing the first 100 countries' : 'Countries with policy links',
        icon: Globe2,
        label: 'Restricted countries',
        tone: 'amber',
        value: formatCount(restrictedCountryCount),
      },
    ];
  }, [data]);

  const recentPolicies = useMemo(
    () =>
      [...data.policies]
        .sort((left, right) => {
          const leftDate = new Date(left.effectiveDate ?? left.updatedAt).getTime();
          const rightDate = new Date(right.effectiveDate ?? right.updatedAt).getTime();

          return rightDate - leftDate;
        })
        .slice(0, RECENT_POLICY_LIMIT),
    [data.policies],
  );

  const timelineFeedItems = useMemo<TimelineFeedItem[]>(
    () =>
      data.timeline.map((event) => ({
        body: event.description ?? event.eventType,
        footer: event.sourceUrl ? (
          <a
            className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand-hover"
            href={event.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            {event.sourceName ?? 'Source'}
            <ExternalLink aria-hidden="true" size={12} strokeWidth={2} />
          </a>
        ) : event.sourceName ? (
          <span>{event.sourceName}</span>
        ) : null,
        id: event.id,
        marker: <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />,
        metadata: [
          {
            content: formatDate(event.eventDate),
            id: 'date',
          },
        ],
        title: event.policy?.title ?? event.eventType,
      })),
    [data.timeline],
  );

  const topCountries = useMemo(
    () =>
      [...data.countries]
        .map((country) => ({ country, restrictionCount: getRestrictionCount(country) }))
        .filter(({ restrictionCount }) => restrictionCount > 0)
        .sort((left, right) => right.restrictionCount - left.restrictionCount)
        .slice(0, 5),
    [data.countries],
  );

  return (
    <DashboardShell
      actions={
        <Button
          isLoading={isLoading}
          leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={() => void loadDashboardData()}
          variant="secondary"
        >
          Refresh data
        </Button>
      }
      activeItem="dashboard"
      description="Track semiconductor and AI export-control policy changes, affected technologies, companies, and jurisdictions from one analyst workspace."
      eyebrow="Policy intelligence"
      title="Dashboard"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Dashboard data unavailable">
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

      <DataTable
        actions={
          <Badge tone={data.hasMorePolicies ? 'amber' : 'slate'}>
            {data.hasMorePolicies
              ? `First ${DASHBOARD_PAGE_LIMIT} records`
              : `${formatCount(data.policies.length)} records`}
          </Badge>
        }
        className="mt-5"
        columns={policyColumns}
        description="Curated policy records with linked companies, technologies, and jurisdictions."
        emptyState="No policy records found."
        isLoading={isLoading}
        rowKey={(policy) => policy.id}
        rows={data.policies.slice(0, 8)}
        title="Policy Records"
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(24rem,0.9fr)]">
        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">Recent Policy Movement</h2>
              <p className="mt-1 text-sm text-muted">
                Policies sorted by latest effective or updated date.
              </p>
            </div>
            <Badge tone="slate">{formatCount(recentPolicies.length)} shown</Badge>
          </div>

          {isLoading ? (
            <Panel>
              <div className="flex items-center gap-3 text-sm text-muted">
                <Spinner label="Loading recent policies" />
                <span>Loading recent policies</span>
              </div>
            </Panel>
          ) : recentPolicies.length ? (
            recentPolicies.map((policy) => (
              <PolicyCard
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
            <Panel>No recent policy records found.</Panel>
          )}
        </section>

        <aside className="space-y-5">
          <Panel
            actions={<Badge tone="emerald">Live data</Badge>}
            description="Most recent timeline events in the curated dataset."
            title="Regulatory Timeline"
          >
            <TimelineFeed
              emptyDescription={null}
              emptyTitle="No timeline events found."
              isLoading={isLoading}
              items={timelineFeedItems}
              loadingLabel="Loading timeline"
              variant="compact"
            />
          </Panel>

          <Panel
            actions={<Badge tone="slate">{formatCount(topCountries.length)} shown</Badge>}
            description="Countries ranked by linked restriction records."
            title="Country Exposure"
          >
            {isLoading ? (
              <div className="flex items-center gap-3 text-sm text-muted">
                <Spinner label="Loading countries" />
                <span>Loading countries</span>
              </div>
            ) : topCountries.length ? (
              <div className="space-y-3">
                {topCountries.map(({ country, restrictionCount }) => (
                  <div className="flex items-center justify-between gap-3" key={country.id}>
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                        <CountryFlag countryCode={country.isoCode} countryName={country.name} />
                        <span>{country.name}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {country.tierClassification ?? country.isoCode}
                      </p>
                    </div>
                    <Badge tone="amber">{formatCount(restrictionCount)} links</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No linked country restrictions returned.</p>
            )}
          </Panel>

          <Panel description="Current status distribution from loaded policy records." title="Policy Status">
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
        </aside>
      </div>
    </DashboardShell>
  );
}
