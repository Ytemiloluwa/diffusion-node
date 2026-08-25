'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { getApiBaseUrl, type UserProfile } from '@/lib/api';
import { toErrorMessage } from '@/screens/shared';
import { useAuthStore } from '@/store';
import { DEFAULT_API_KEY_LABEL } from '../constants';
import { getApiDocsUrl } from '../settingsHelpers';

export function useDeveloperSettingsData() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const createApiKey = useAuthStore((state) => state.createApiKey);
  const lastIssuedApiKey = useAuthStore((state) => state.lastIssuedApiKey);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const logout = useAuthStore((state) => state.logout);
  const revokeApiKey = useAuthStore((state) => state.revokeApiKey);
  const user = useAuthStore((state) => state.user);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newApiKeyLabel, setNewApiKeyLabel] = useState(DEFAULT_API_KEY_LABEL);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [revokingApiKeyId, setRevokingApiKeyId] = useState<string | null>(null);

  const apiBaseUrl = useMemo(() => {
    try {
      return getApiBaseUrl();
    } catch {
      return null;
    }
  }, []);

  const apiDocsUrl = apiBaseUrl ? getApiDocsUrl(apiBaseUrl) : null;

  const copyValue = useCallback(async (copyId: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(copyId);
      window.setTimeout(() => setCopiedValue(null), 1800);
    } catch {
      setError('Clipboard access was not available.');
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!useAuthStore.getState().accessToken) {
      router.replace('/auth');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const loadedProfile = await loadProfile();

      if (!loadedProfile) {
        router.replace('/auth');
        return;
      }

      setProfile(loadedProfile);
    } catch (loadError) {
      setError(toErrorMessage(loadError, 'Settings data could not be loaded.'));
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
      return undefined;
    }

    if (!accessToken) {
      router.replace('/auth');
      return undefined;
    }

    const loadTimer = window.setTimeout(() => {
      void refreshProfile();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, refreshProfile, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/auth');
  }, [logout, router]);

  const handleCreateApiKey = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const label = newApiKeyLabel.trim();

      if (!label) {
        setError('API key label is required.');
        return;
      }

      setError(null);
      setIsCreatingApiKey(true);

      try {
        const apiKey = await createApiKey({ label });
        setProfile((currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                apiKeys: [
                  {
                    createdAt: apiKey.createdAt,
                    id: apiKey.id,
                    label: apiKey.label,
                    lastUsedAt: null,
                    revokedAt: null,
                  },
                  ...currentProfile.apiKeys.filter((existingKey) => existingKey.id !== apiKey.id),
                ],
              }
            : currentProfile,
        );
        setNewApiKeyLabel(DEFAULT_API_KEY_LABEL);
        window.setTimeout(() => {
          void refreshProfile();
        }, 0);
      } catch (createError) {
        setError(toErrorMessage(createError, 'Settings data could not be loaded.'));
      } finally {
        setIsCreatingApiKey(false);
      }
    },
    [createApiKey, newApiKeyLabel, refreshProfile],
  );

  const handleRevokeApiKey = useCallback(
    async (apiKeyId: string) => {
      setError(null);
      setRevokingApiKeyId(apiKeyId);

      try {
        await revokeApiKey(apiKeyId);
        setProfile((currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                apiKeys: currentProfile.apiKeys.filter((apiKey) => apiKey.id !== apiKeyId),
              }
            : currentProfile,
        );
      } catch (revokeError) {
        setError(toErrorMessage(revokeError, 'Settings data could not be loaded.'));
      } finally {
        setRevokingApiKeyId(null);
      }
    },
    [revokeApiKey],
  );

  return {
    accessToken,
    activeApiKeys: profile?.apiKeys ?? [],
    apiBaseUrl,
    apiDocsUrl,
    copiedValue,
    copyValue,
    displayUser: profile ?? user,
    error,
    handleCreateApiKey,
    handleLogout,
    handleRevokeApiKey,
    isCreatingApiKey,
    isLoading,
    lastIssuedApiKey,
    newApiKeyLabel,
    profile,
    refreshProfile,
    revokingApiKeyId,
    setNewApiKeyLabel,
  };
}
