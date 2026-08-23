'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  listCompanies,
  listCountries,
  listPolicies,
  listTechnologies,
  listTimeline,
} from '@/lib/api';
import { toErrorMessage } from '@/screens/shared';
import { useAuthStore } from '@/store';
import { DASHBOARD_PAGE_LIMIT, TIMELINE_LIMIT } from '../constants';
import type { DashboardData } from '../types';

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

export function useDashboardData() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
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
      setError(toErrorMessage(loadError, 'Dashboard data could not be loaded.'));
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

  return {
    data,
    error,
    isLoading,
    refresh: loadDashboardData,
    user,
  };
}
