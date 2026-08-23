'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { listCompanies, listCountries, type CompaniesQuery, type Company } from '@/lib/api';
import { toErrorMessage, toFilterOptions } from '@/screens/shared';
import { useAuthStore, useUiStore, type CompanyFilters } from '@/store';
import { getCompanyExplorerColumns } from '../companyExplorerColumns';
import { createCompanyMetrics } from '../companyMetrics';
import {
  buildCompanyStats,
  getActiveCompanyFilterCount,
  getStatusDistribution,
  getTopCountries,
  loadCompanyPolicyContext,
  matchesCompanySearch,
} from '../companyModel';
import { COMPANY_OPTION_LIMIT, COMPANY_PAGE_SIZE, emptyCompanyPageInfo } from '../constants';
import type { CompanyOptionState, CompanyStats } from '../types';

const emptyCompanyOptions: CompanyOptionState = {
  companies: [],
  countries: [],
};

export function useCompanyExplorerData() {
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
  const [options, setOptions] = useState<CompanyOptionState>(emptyCompanyOptions);
  const [pageInfo, setPageInfo] = useState(emptyCompanyPageInfo);
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

  const metrics = useMemo(
    () =>
      createCompanyMetrics({
        companyCount: companies.length,
        entityListedCompanyCount,
        hasNextPage: pageInfo.hasNextPage,
        isPolicyContextPartial,
        policyLinkedCompanyCount,
        restrictedCountryCount,
      }),
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

  const companyColumns = useMemo(
    () =>
      getCompanyExplorerColumns({
        policyStats,
        viewCompanyPolicies,
      }),
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
        listCompanies({ limit: COMPANY_OPTION_LIMIT }),
        listCountries({ limit: COMPANY_OPTION_LIMIT }),
        loadCompanyPolicyContext(),
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
      setError(toErrorMessage(loadError, 'Company records could not be loaded.'));
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

  const updateDraftFilter = useCallback((key: keyof CompanyFilters, value: string) => {
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
    activeFilterCount: getActiveCompanyFilterCount(companyFilters),
    applyFilters,
    clearSearch,
    companyColumns,
    companyFilters,
    countryOptions,
    cursorStack,
    draftFilters,
    error,
    filteredCompanies,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    metrics,
    pageInfo,
    policyStats,
    refresh: loadCompanyData,
    resetFilters,
    searchDraft,
    searchQuery,
    setSearchDraft,
    setSearchQuery,
    statusDistribution,
    statusOptions,
    topCountries,
    updateDraftFilter,
    user,
    viewCompanyPolicies,
  };
}
