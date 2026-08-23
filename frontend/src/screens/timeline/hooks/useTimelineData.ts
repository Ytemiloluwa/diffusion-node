'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, FileSearch, FileText } from 'lucide-react';
import { listTimeline } from '@/lib/api';
import type { PageInfo, PolicyStatus, TimelineEventWithPolicy } from '@/lib/api';
import {
  formatCount,
  formatUtcDate as formatDate,
  formatYear,
  policyStatusLabels,
  toErrorMessage,
  toFilterOptions,
} from '@/screens/shared';
import { useAuthStore } from '@/store';
import {
  emptyTimelinePageInfo,
  initialTimelineFilters,
  TIMELINE_PAGE_SIZE,
} from '../constants';
import { toTimelineFeedItems } from '../timelineFeedItems';
import {
  getActiveFilterCount,
  getPolicyKey,
  getSourceLabel,
  matchesFilters,
  matchesSearch,
} from '../timelineModel';
import type { TimelineFilters, TimelineMetric, TimelineSummaryCount } from '../types';

export function useTimelineData() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const [timeline, setTimeline] = useState<TimelineEventWithPolicy[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyTimelinePageInfo);
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftFilters, setDraftFilters] = useState<TimelineFilters>(initialTimelineFilters);
  const [filters, setFilters] = useState<TimelineFilters>(initialTimelineFilters);

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
      setPageInfo(emptyTimelinePageInfo);
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
      return undefined;
    }

    if (!accessToken) {
      router.replace('/auth');
      return undefined;
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
        label: policyStatusLabels[option.value as PolicyStatus] ?? option.value,
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

  const metrics: TimelineMetric[] = [
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

  const sourceCounts = useMemo<TimelineSummaryCount[]>(() => {
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

  const statusCounts = useMemo<TimelineSummaryCount[]>(() => {
    const counts = new Map<string, number>();

    for (const event of filteredTimeline) {
      const label = event.policy?.status ? policyStatusLabels[event.policy.status] : 'No policy';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({ count, label }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [filteredTimeline]);

  const timelineFeedItems = useMemo(() => toTimelineFeedItems(filteredTimeline), [filteredTimeline]);

  const goToNextPage = useCallback(() => {
    if (!pageInfo.hasNextPage || !pageInfo.nextCursor) {
      return;
    }

    setCursorStack((previousStack) => [...previousStack, cursor]);
    setCursor(pageInfo.nextCursor ?? undefined);
    setPageNumber((previousPage) => previousPage + 1);
  }, [cursor, pageInfo.hasNextPage, pageInfo.nextCursor]);

  const goToPreviousPage = useCallback(() => {
    if (!cursorStack.length) {
      return;
    }

    const previousCursor = cursorStack[cursorStack.length - 1];
    setCursorStack((previousStack) => previousStack.slice(0, -1));
    setCursor(previousCursor);
    setPageNumber((previousPage) => Math.max(1, previousPage - 1));
  }, [cursorStack]);

  const resetFilters = useCallback(() => {
    setDraftFilters(initialTimelineFilters);
    setFilters(initialTimelineFilters);
    setSearchDraft('');
    setSearchQuery('');
  }, []);

  const applyFilters = useCallback(() => {
    setFilters(draftFilters);
    setSearchQuery(searchDraft.trim());
  }, [draftFilters, searchDraft]);

  return {
    activeFilterCount,
    applyFilters,
    cursorStack,
    draftFilters,
    error,
    eventTypeOptions,
    filteredTimeline,
    filters,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    linkedPolicies,
    metrics,
    pageInfo,
    pageNumber,
    refresh: loadTimelineData,
    resetFilters,
    searchDraft,
    searchQuery,
    setDraftFilters,
    setSearchDraft,
    setSearchQuery,
    sourceCounts,
    sourceOptions,
    statusCounts,
    statusOptions,
    timelineFeedItems,
    user,
  };
}
