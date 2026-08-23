'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PolicyFilters as FilterPanelPolicyFilters } from '@/components/molecules';
import {
  listCompanies,
  listCountries,
  listPolicies,
  listRestrictions,
  listSources,
  listTechnologies,
  type PageInfo,
  type Policy,
  type PolicyStatus,
} from '@/lib/api';
import { createPolicyStatusCounts, toErrorMessage } from '@/screens/shared';
import { useAuthStore, useUiStore } from '@/store';
import {
  POLICY_EXPLORER_OPTION_LIMIT,
  POLICY_EXPLORER_PAGE_SIZE,
  emptyPolicyExplorerPageInfo,
} from '../constants';
import { getActiveFilterEntries, toPanelFilters, toSearchFilters } from '../filterModel';
import { buildPolicyExplorerFilterOptions, emptyPolicyExplorerOptions } from '../options';
import type { LinkedEntityCounts, PolicyExplorerOptions, PolicyStatusCounts } from '../types';

export function usePolicyExplorerData(initialSearch?: string) {
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
  const [options, setOptions] = useState<PolicyExplorerOptions>(emptyPolicyExplorerOptions);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyPolicyExplorerPageInfo);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchValue, setSearchValue] = useState(
    () => initialSearch?.trim() || useUiStore.getState().policyFilters.q || '',
  );

  const resetPagination = useCallback(() => {
    setCursor(undefined);
    setCursorStack([]);
  }, []);

  const filterOptions = useMemo(() => buildPolicyExplorerFilterOptions(options), [options]);

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
            limit: POLICY_EXPLORER_PAGE_SIZE,
          }),
          listCompanies({ limit: POLICY_EXPLORER_OPTION_LIMIT }),
          listCountries({ limit: POLICY_EXPLORER_OPTION_LIMIT }),
          listTechnologies({ limit: POLICY_EXPLORER_OPTION_LIMIT }),
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
      setError(toErrorMessage(loadError, 'Policy records could not be loaded.'));
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

  const statusCounts = useMemo<PolicyStatusCounts>(
    () =>
      policies.reduce<Record<PolicyStatus, number>>(
        (counts, policy) => ({
          ...counts,
          [policy.status]: counts[policy.status] + 1,
        }),
        createPolicyStatusCounts(),
      ),
    [policies],
  );

  const linkedEntityCounts = useMemo<LinkedEntityCounts>(
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

  return {
    activeFilters,
    applyFilters,
    applySearch,
    cursorStack,
    draftFilters,
    error,
    filterOptions,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    linkedEntityCounts,
    options,
    pageInfo,
    policies,
    refresh: loadExplorerData,
    resetFilters,
    searchValue,
    setDraftFilters,
    setSearchValue,
    statusCounts,
    user,
  };
}
