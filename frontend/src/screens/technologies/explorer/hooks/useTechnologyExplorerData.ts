'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listCategories,
  listTechnologies,
  type TechnologiesQuery,
  type Technology,
  type TechnologyCategory,
} from '@/lib/api';
import { toErrorMessage, toFilterOptions } from '@/screens/shared';
import { useAuthStore, useUiStore, type TechnologyFilters } from '@/store';
import { getTechnologyExplorerColumns } from '../technologyExplorerColumns';
import { createTechnologyMetrics } from '../technologyMetrics';
import {
  buildTechnologyStats,
  buildTechnologyStatusCounts,
  getActiveTechnologyFilterCount,
  getCategoryDistribution,
  getTopTechnologies,
  loadTechnologyPolicyContext,
  matchesTechnologySearch,
} from '../technologyModel';
import { TECHNOLOGY_PAGE_SIZE, emptyTechnologyPageInfo } from '../constants';
import type { TechnologyStats } from '../types';

export function useTechnologyExplorerData() {
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
  const [pageInfo, setPageInfo] = useState(emptyTechnologyPageInfo);
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
    () => buildTechnologyStatusCounts(filteredTechnologies, policyStats),
    [filteredTechnologies, policyStats],
  );

  const metrics = useMemo(
    () =>
      createTechnologyMetrics({
        affectedCompanyCount,
        affectedCountryCount,
        hasNextPage: pageInfo.hasNextPage,
        isPolicyContextPartial,
        linkedTechnologyCount,
        technologyCount: technologies.length,
      }),
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

  const technologyColumns = useMemo(
    () =>
      getTechnologyExplorerColumns({
        policyStats,
        viewTechnologyPolicies,
      }),
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
        loadTechnologyPolicyContext(),
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

  const updateDraftFilter = useCallback((key: keyof TechnologyFilters, value: string) => {
    setDraftFilters((filters) => ({
      ...filters,
      [key]: value || undefined,
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchDraft('');
    setSearchQuery('');
  }, []);

  return {
    activeFilterCount: getActiveTechnologyFilterCount(technologyFilters),
    applyFilters,
    categories,
    categoryDistribution,
    categoryOptions,
    clearSearch,
    cursorStack,
    draftFilters,
    error,
    filteredTechnologies,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    metrics,
    pageInfo,
    policyStats,
    refresh: loadTechnologyData,
    resetFilters,
    searchDraft,
    searchQuery,
    setSearchDraft,
    setSearchQuery,
    statusCounts,
    technologies,
    technologyColumns,
    technologyFilters,
    topTechnologies,
    updateDraftFilter,
    user,
    viewTechnologyPolicies,
  };
}
