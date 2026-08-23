'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPolicy,
  getPolicyTimeline,
  type PolicyDetail,
  type PolicyTimelineItem,
} from '@/lib/api';
import { toErrorMessage } from '@/screens/shared';
import { useAuthStore } from '@/store';
import { sortPolicyTimelineItems } from '../timelineFeedItems';

export function usePolicyDetailData(policyId: string) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const user = useAuthStore((state) => state.user);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [timeline, setTimeline] = useState<PolicyTimelineItem[]>([]);

  const loadPolicyDetail = useCallback(async () => {
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

      const [policyDetail, timelineItems] = await Promise.all([
        getPolicy(policyId),
        getPolicyTimeline(policyId),
      ]);

      setPolicy(policyDetail);
      setTimeline(timelineItems);
    } catch (loadError) {
      setError(toErrorMessage(loadError, 'Policy detail could not be loaded.'));
      setPolicy(null);
      setTimeline([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile, policyId, router]);

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
      void loadPolicyDetail();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, loadPolicyDetail, router]);

  const timelineItems = useMemo(() => sortPolicyTimelineItems(timeline), [timeline]);
  const primarySource = policy?.sources.find((source) => source.sourceUrl) ?? policy?.sources[0];

  return {
    error,
    isLoading,
    policy,
    primarySource,
    refresh: loadPolicyDetail,
    timelineItems,
    user,
  };
}
