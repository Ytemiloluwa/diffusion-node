'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  FileSearch,
  FileText,
  Filter,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import { Badge, Button, Panel, Spinner, type BadgeProps } from '@/components/atoms';
import { PaginationControls, SearchBar } from '@/components/molecules';
import { TimelineFeed, type TimelineFeedItem } from '@/components/organisms';
import { DashboardShell } from '@/components/templates';
import { listTimeline } from '@/lib/api';
import type { PageInfo, PolicyStatus, TimelineEventWithPolicy } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  formatCount,
  formatUtcDate as formatDate,
  formatYear,
  getDisplayName,
  getInitials,
  metricToneClasses,
  policyStatusLabels as statusLabels,
  policyStatusTones as statusTones,
  toErrorMessage,
  toFilterOptions,
  type MetricTone,
} from '@/screens/shared';
import { useAuthStore } from '@/store';

const TIMELINE_PAGE_SIZE = 20;

const emptyPageInfo: PageInfo = {
  hasNextPage: false,
  limit: TIMELINE_PAGE_SIZE,
  nextCursor: null,
};

const eventTypeTones: Record<string, BadgeProps['tone']> = {
  announcement: 'sky',
  clarification: 'slate',
  effective: 'emerald',
  enforcement: 'red',
  extension: 'amber',
  final_rule: 'emerald',
  interim_final_rule: 'amber',
  policy_update: 'sky',
  proposed_rule: 'amber',
  rescission: 'red',
};

type Metric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

type TimelineFilters = {
  eventType: string;
  sourceName: string;
  status: string;
};

const initialFilters: TimelineFilters = {
  eventType: '',
  sourceName: '',
  status: '',
};

const formatEventType = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const getEventTone = (eventType: string): BadgeProps['tone'] =>
  eventTypeTones[eventType.toLowerCase()] ?? 'slate';

const getSourceLabel = (event: TimelineEventWithPolicy) =>
  event.sourceName?.trim() || event.sourceUrl?.replace(/^https?:\/\//, '') || 'Unattributed';

const getSourceHost = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value.replace(/^https?:\/\//, '');
  }
};

const getActiveFilterCount = (filters: TimelineFilters, searchQuery: string) =>
  [filters.eventType, filters.sourceName, filters.status, searchQuery.trim()].filter(Boolean).length;

const timelineSearchFields = (event: TimelineEventWithPolicy) => [
  event.description,
  event.eventType,
  event.policy?.controlNumber,
  event.policy?.status,
  event.policy?.title,
  event.sourceName,
  event.sourceUrl,
];

const matchesSearch = (event: TimelineEventWithPolicy, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return timelineSearchFields(event).some((value) => value?.toLowerCase().includes(normalizedQuery));
};

const matchesFilters = (event: TimelineEventWithPolicy, filters: TimelineFilters) => {
  if (filters.eventType && event.eventType !== filters.eventType) {
    return false;
  }

  if (filters.sourceName && getSourceLabel(event) !== filters.sourceName) {
    return false;
  }

  if (filters.status && event.policy?.status !== filters.status) {
    return false;
  }

  return true;
};

const getPolicyKey = (event: TimelineEventWithPolicy) => event.policy?.id ?? event.policyId;

function MetricCard({ detail, icon: Icon, label, tone, value }: Metric) {
  return (
    <section className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold leading-none tracking-normal text-ink">{value}</p>
        </div>
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-control ring-1 ring-inset',
            metricToneClasses[tone],
          )}
        >
          <Icon aria-hidden="true" size={19} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </section>
  );
}

function EventSourceLink({ event }: { event: TimelineEventWithPolicy }) {
  const label = getSourceLabel(event);

  if (!event.sourceUrl) {
    return <span className="text-sm text-muted">{label}</span>;
  }

  return (
    <a
      className="inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-brand hover:text-brand-hover"
      href={event.sourceUrl}
      rel="noreferrer"
      target="_blank"
    >
      <span className="truncate">{label}</span>
      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}

function PolicyStatusBadge({ status }: { status?: PolicyStatus }) {
  if (!status) {
    return <Badge tone="slate">No policy</Badge>;
  }

  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}

function TimelineEventRecord({ event }: { event: TimelineEventWithPolicy }) {
  return (
    <article className="rounded-panel border border-line bg-surface p-4 shadow-control">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getEventTone(event.eventType)}>{formatEventType(event.eventType)}</Badge>
            <PolicyStatusBadge status={event.policy?.status} />
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-ink">
            {event.description || event.policy?.title || formatEventType(event.eventType)}
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center gap-2 rounded-control bg-surface-muted px-3 py-2 text-sm font-medium text-muted ring-1 ring-inset ring-line">
          <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />
          <span>{formatDate(event.eventDate)}</span>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase text-subtle">Policy</dt>
          <dd className="mt-1 min-w-0 text-sm text-muted">
            {event.policy ? (
              <Link
                className="block break-words font-semibold leading-5 text-brand hover:text-brand-hover"
                href={`/policies/${event.policy.id}`}
              >
                {event.policy.title}
              </Link>
            ) : (
              'General event'
            )}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase text-subtle">Source</dt>
          <dd className="mt-1 min-w-0">
            <EventSourceLink event={event} />
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase text-subtle">Control Number</dt>
          <dd className="mt-1 text-sm font-medium text-muted">
            {event.policy?.controlNumber ?? 'Not assigned'}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase text-subtle">Event Date</dt>
          <dd className="mt-1 text-sm font-medium text-muted">{formatDate(event.eventDate)}</dd>
        </div>
      </dl>
    </article>
  );
}

function TimelineRecordList({
  events,
  isLoading,
}: {
  events: TimelineEventWithPolicy[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner label="Loading event records" />
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="rounded-panel border border-dashed border-line bg-surface-muted px-4 py-10 text-center">
        <p className="font-semibold text-ink">No event records found</p>
        <p className="mt-1 text-sm text-muted">Adjust the current-page filters or load another page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <TimelineEventRecord event={event} key={event.id} />
      ))}
    </div>
  );
}

export function TimelinePage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const loadProfile = useAuthStore((state) => state.loadProfile);

  const [timeline, setTimeline] = useState<TimelineEventWithPolicy[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyPageInfo);
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftFilters, setDraftFilters] = useState<TimelineFilters>(initialFilters);
  const [filters, setFilters] = useState<TimelineFilters>(initialFilters);

  const loadTimelineData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = await loadProfile();

      if (!profile) {
        router.replace('/auth');
        return;
      }

      const page = await listTimeline({ cursor, limit: TIMELINE_PAGE_SIZE });
      setTimeline(page.data);
      setPageInfo(page.pageInfo);
    } catch (requestError) {
      setError(toErrorMessage(requestError, 'An unexpected error occurred.'));
      setTimeline([]);
      setPageInfo(emptyPageInfo);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, cursor, loadProfile, router]);

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
      void loadTimelineData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, loadTimelineData, router]);

  const eventTypeOptions = useMemo(
    () => toFilterOptions(timeline.map((event) => event.eventType)),
    [timeline],
  );

  const sourceOptions = useMemo(
    () => toFilterOptions(timeline.map((event) => getSourceLabel(event))),
    [timeline],
  );

  const statusOptions = useMemo(
    () =>
      toFilterOptions(timeline.map((event) => event.policy?.status ?? '')).map((option) => ({
        ...option,
        label: statusLabels[option.value as PolicyStatus] ?? option.value,
      })),
    [timeline],
  );

  const filteredTimeline = useMemo(
    () => timeline.filter((event) => matchesFilters(event, filters) && matchesSearch(event, searchQuery)),
    [filters, searchQuery, timeline],
  );

  const linkedPolicyCount = useMemo(
    () => new Set(timeline.map(getPolicyKey).filter(Boolean)).size,
    [timeline],
  );

  const sourcedEventCount = useMemo(
    () => timeline.filter((event) => event.sourceName || event.sourceUrl).length,
    [timeline],
  );

  const latestEvent = timeline[0];
  const activeFilterCount = getActiveFilterCount(filters, searchQuery);

  const metrics: Metric[] = [
    {
      detail: `${formatCount(filteredTimeline.length)} visible on the current loaded page`,
      icon: CalendarDays,
      label: 'Timeline events',
      tone: 'emerald',
      value: formatCount(timeline.length),
    },
    {
      detail: 'Unique policies linked to loaded events',
      icon: FileText,
      label: 'Linked policies',
      tone: 'sky',
      value: formatCount(linkedPolicyCount),
    },
    {
      detail: 'Events with source metadata or citation links',
      icon: FileSearch,
      label: 'Sourced events',
      tone: 'amber',
      value: formatCount(sourcedEventCount),
    },
    {
      detail: latestEvent ? formatDate(latestEvent.eventDate) : 'No events loaded',
      icon: Clock3,
      label: 'Latest year',
      tone: 'slate',
      value: formatYear(latestEvent?.eventDate),
    },
  ];

  const linkedPolicies = useMemo(() => {
    const policies = new Map<string, NonNullable<TimelineEventWithPolicy['policy']>>();

    for (const event of filteredTimeline) {
      if (event.policy) {
        policies.set(event.policy.id, event.policy);
      }
    }

    return Array.from(policies.values()).slice(0, 6);
  }, [filteredTimeline]);

  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const event of filteredTimeline) {
      const label = getSourceLabel(event);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({ count, label }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 5);
  }, [filteredTimeline]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const event of filteredTimeline) {
      const label = event.policy?.status ? statusLabels[event.policy.status] : 'No policy';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({ count, label }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [filteredTimeline]);

  const timelineFeedItems = useMemo<TimelineFeedItem[]>(
    () =>
      filteredTimeline.map((event) => ({
        badges: (
          <>
            <Badge tone={getEventTone(event.eventType)}>{formatEventType(event.eventType)}</Badge>
            <PolicyStatusBadge status={event.policy?.status} />
          </>
        ),
        detailLink: event.policy
          ? {
              href: `/policies/${event.policy.id}`,
              label: event.policy.title,
            }
          : undefined,
        detailText: event.policy ? undefined : 'General timeline event',
        footer: (
          <>
            <EventSourceLink event={event} />
            {event.sourceUrl ? <span>{getSourceHost(event.sourceUrl)}</span> : null}
          </>
        ),
        id: event.id,
        marker: <CalendarDays aria-hidden="true" className="h-4 w-4" />,
        markerClassName: 'rounded-full',
        metadata: [
          {
            content: formatDate(event.eventDate),
            icon: <CalendarDays aria-hidden="true" size={14} strokeWidth={2} />,
            id: 'date',
          },
          ...(event.policy?.controlNumber
            ? [
                {
                  content: <span className="uppercase text-subtle">{event.policy.controlNumber}</span>,
                  id: 'controlNumber',
                },
              ]
            : []),
        ],
        title: event.description || event.policy?.title || formatEventType(event.eventType),
      })),
    [filteredTimeline],
  );

  const handleNextPage = () => {
    if (!pageInfo.hasNextPage || !pageInfo.nextCursor) {
      return;
    }

    setCursorStack((previousStack) => [...previousStack, cursor]);
    setCursor(pageInfo.nextCursor ?? undefined);
    setPageNumber((previousPage) => previousPage + 1);
  };

  const handlePreviousPage = () => {
    if (!cursorStack.length) {
      return;
    }

    const previousCursor = cursorStack[cursorStack.length - 1];
    setCursorStack((previousStack) => previousStack.slice(0, -1));
    setCursor(previousCursor);
    setPageNumber((previousPage) => Math.max(1, previousPage - 1));
  };

  const handleRefresh = () => {
    void loadTimelineData();
  };

  const handleResetFilters = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
    setSearchDraft('');
    setSearchQuery('');
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setSearchQuery(searchDraft.trim());
  };

  const shellUserName = getDisplayName(user?.email ?? null);
  const shellInitials = getInitials(user?.email ?? null);

  return (
    <DashboardShell
      actions={
        <Button
          isLoading={isLoading}
          leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={handleRefresh}
          variant="secondary"
        >
          Refresh
        </Button>
      }
      activeItem="timeline"
      description="Track export-control milestones, rule changes, source citations, and linked policy records in one chronological view."
      eyebrow="Policy timeline"
      title="Timeline"
      userInitials={shellInitials}
      userName={shellUserName}
    >
      {error ? (
        <Panel className="border-danger-line bg-danger-soft" title="Timeline data unavailable">
          <div className="flex items-start gap-3 text-sm text-danger">
            <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <Panel
            actions={<Badge tone="slate">{activeFilterCount} active</Badge>}
            description="Search policy events in the current timeline page."
            title="Search Timeline"
          >
            <SearchBar
              onClear={() => setSearchQuery('')}
              onDebouncedChange={(value) => setSearchQuery(value.trim())}
              onSearch={(value) => setSearchQuery(value.trim())}
              onValueChange={setSearchDraft}
              placeholder="Search event type, policy, control number, source, or status"
              value={searchDraft}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery ? <Badge tone="sky">Search: {searchQuery}</Badge> : null}
              {filters.eventType ? <Badge tone="amber">Event: {formatEventType(filters.eventType)}</Badge> : null}
              {filters.sourceName ? <Badge tone="slate">Source: {filters.sourceName}</Badge> : null}
              {filters.status ? (
                <Badge tone={statusTones[filters.status as PolicyStatus] ?? 'slate'}>
                  Status: {statusLabels[filters.status as PolicyStatus] ?? filters.status}
                </Badge>
              ) : null}
              {!activeFilterCount ? <span className="text-sm text-muted">No active filters</span> : null}
            </div>
          </Panel>

          <Panel
            actions={
              <PaginationControls
                hasNextPage={pageInfo.hasNextPage}
                hasPreviousPage={cursorStack.length > 0}
                isLoading={isLoading}
                onNext={handleNextPage}
                onPrevious={handlePreviousPage}
                pageLabel={`Page ${pageNumber}`}
              />
            }
            description="Events are ordered from newest to oldest."
            title="Timeline Feed"
          >
            <TimelineFeed
              emptyDescription="Adjust the current-page filters or load another page."
              emptyTitle="No timeline events found"
              isLoading={isLoading}
              items={timelineFeedItems}
              loadingLabel="Loading timeline"
            />
          </Panel>

          <Panel
            actions={<Badge tone="slate">{formatCount(filteredTimeline.length)} shown</Badge>}
            description="Readable event records for the current timeline page."
            title="Event Records"
          >
            <TimelineRecordList events={filteredTimeline} isLoading={isLoading} />
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel
            actions={
              <Button
                leadingIcon={<RotateCcw aria-hidden="true" size={16} strokeWidth={2} />}
                onClick={handleResetFilters}
                size="sm"
                variant="ghost"
              >
                Reset
              </Button>
            }
            description="Refine the currently loaded timeline page."
            title="Filters"
          >
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-muted">Event Type</span>
                <select
                  className="mt-2 block w-full min-w-0 rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-control outline-none transition focus:border-focus focus:ring-2 focus:ring-focus-soft"
                  onChange={(event) => setDraftFilters((current) => ({ ...current, eventType: event.target.value }))}
                  value={draftFilters.eventType}
                >
                  <option value="">All</option>
                  {eventTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {formatEventType(option.label)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-muted">Source</span>
                <select
                  className="mt-2 block w-full min-w-0 rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-control outline-none transition focus:border-focus focus:ring-2 focus:ring-focus-soft"
                  onChange={(event) => setDraftFilters((current) => ({ ...current, sourceName: event.target.value }))}
                  value={draftFilters.sourceName}
                >
                  <option value="">All</option>
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-muted">Policy Status</span>
                <select
                  className="mt-2 block w-full min-w-0 rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-control outline-none transition focus:border-focus focus:ring-2 focus:ring-focus-soft"
                  onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
                  value={draftFilters.status}
                >
                  <option value="">All</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                className="w-full"
                leadingIcon={<Filter aria-hidden="true" size={16} strokeWidth={2} />}
                onClick={handleApplyFilters}
              >
                Apply filters
              </Button>
            </div>
          </Panel>

          <Panel description="Policy records connected to the current timeline view." title="Policy Drilldowns">
            {linkedPolicies.length ? (
              <div className="space-y-3">
                {linkedPolicies.map((policy) => (
                  <Link
                    className="block rounded-panel border border-line bg-surface p-3 transition-colors hover:border-brand-line hover:bg-brand-soft"
                    href={`/policies/${policy.id}`}
                    key={policy.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-semibold leading-5 text-ink">{policy.title}</p>
                      <PolicyStatusBadge status={policy.status} />
                    </div>
                    {policy.controlNumber ? (
                      <p className="mt-2 text-xs font-semibold uppercase text-subtle">{policy.controlNumber}</p>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No linked policies in the current view.</p>
            )}
          </Panel>

          <Panel description="Source concentration for the current timeline view." title="Source Summary">
            {sourceCounts.length ? (
              <div className="space-y-3">
                {sourceCounts.map((source) => (
                  <div className="flex items-center justify-between gap-3" key={source.label}>
                    <span className="truncate text-sm font-semibold text-muted">{source.label}</span>
                    <Badge tone="amber">{formatCount(source.count)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No source summary available.</p>
            )}
          </Panel>

          <Panel description="Policy status mix across the current timeline view." title="Status Summary">
            {statusCounts.length ? (
              <div className="space-y-3">
                {statusCounts.map((status) => (
                  <div className="flex items-center justify-between gap-3" key={status.label}>
                    <span className="text-sm font-semibold text-muted">{status.label}</span>
                    <Badge tone="slate">{formatCount(status.count)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No status summary available.</p>
            )}
          </Panel>
        </aside>
      </section>
    </DashboardShell>
  );
}
