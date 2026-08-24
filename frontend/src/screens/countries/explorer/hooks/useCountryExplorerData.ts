'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MapCountryDatum,
  MapExposureMode,
} from '@/components/organisms';
import {
  listCompanies,
  listCountries,
  listRestrictions,
} from '@/lib/api';
import {
  toErrorMessage,
  toFilterOptions,
} from '@/screens/shared';
import { useAuthStore, useUiStore } from '@/store';
import { emptyCountryPageInfo, COUNTRY_OPTION_LIMIT, COUNTRY_PAGE_SIZE } from '../constants';
import { getCountryExplorerColumns } from '../countryExplorerColumns';
import { createCountryMetrics } from '../countryMetrics';
import {
  buildCountryExposure,
  getActiveCountryFilterCount,
  getTierDistribution,
  getTopCountries,
  loadCountryPolicyContext,
  matchesCountrySearch,
} from '../countryModel';
import type {
  CountryExposure,
  CountryFilterState,
  CountryOptionState,
} from '../types';

const emptyCountryOptions: CountryOptionState = {
  restrictions: [],
};

export function useCountryExplorerData() {
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
  const [options, setOptions] = useState<CountryOptionState>(emptyCountryOptions);
  const [pageInfo, setPageInfo] = useState(emptyCountryPageInfo);
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

  const metrics = useMemo(
    () =>
      createCountryMetrics({
        countries,
        hasNextPage: pageInfo.hasNextPage,
        isPolicyContextPartial,
      }),
    [countries, isPolicyContextPartial, pageInfo.hasNextPage],
  );

  const countryColumns = useMemo(() => getCountryExplorerColumns(), []);

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
        listCompanies({ limit: COUNTRY_OPTION_LIMIT }),
        listRestrictions(),
        loadCountryPolicyContext(),
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

  const updateDraftFilter = useCallback((key: keyof CountryFilterState, value: string) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value || undefined,
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchDraft('');
    setSearchQuery('');
  }, []);

  return {
    activeFilterCount: getActiveCountryFilterCount(filters, selectedCountryId),
    applyFilters,
    countryColumns,
    cursorStack,
    draftFilters,
    error,
    filteredCountries,
    filters,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    mapCountries,
    mapMode,
    metrics,
    pageInfo,
    refresh: loadCountryData,
    resetFilters,
    restrictionOptions,
    searchDraft,
    searchQuery,
    selectedCountry,
    selectedCountryId,
    setMapMode,
    setSearchDraft,
    setSearchQuery,
    setSelectedCountryId,
    tierDistribution,
    tierOptions,
    topCountries,
    updateDraftFilter,
    user,
    viewCountryCompanies,
    viewCountryPolicies,
    clearSearch,
  };
}
