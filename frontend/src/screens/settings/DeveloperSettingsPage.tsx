'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  CheckCircle2,
  Clipboard,
  ExternalLink,
  KeyRound,
  LogOut,
  RefreshCw,
  ServerCog,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Button, IconButton, Input, Panel, Spinner } from '@/components/atoms';
import { ApiKeyRow } from '@/components/molecules';
import { DashboardShell } from '@/components/templates';
import { API_BASE_URL_ENV_VAR, getApiBaseUrl, type ApiKeySummary, type UserProfile } from '@/lib/api';
import {
  formatCount,
  formatDateTime as formatDate,
  getDisplayName,
  getInitials,
  toErrorMessage,
} from '@/screens/shared';
import { useAuthStore } from '@/store';

const getApiDocsUrl = (apiBaseUrl: string): string => {
  const baseWithoutVersion = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

  return `${baseWithoutVersion}/docs`;
};

const maskApiKeySummary = (apiKey: ApiKeySummary): string => {
  const suffix = apiKey.id.replaceAll('-', '').slice(-8).toUpperCase();

  return `Stored as hash (${suffix})`;
};

function SettingRow({
  action,
  label,
  value,
}: {
  action?: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-2 border-b border-line py-3 last:border-0 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-ink">{value}</dd>
      {action ? <div className="flex justify-start sm:justify-end">{action}</div> : null}
    </div>
  );
}

export function DeveloperSettingsPage() {
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
  const [newApiKeyLabel, setNewApiKeyLabel] = useState('Local development key');
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
        setNewApiKeyLabel('Local development key');
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

  const activeApiKeys = profile?.apiKeys ?? [];
  const displayUser = profile ?? user;

  return (
    <DashboardShell
      actions={
        <>
          <Button
            isLoading={isLoading}
            leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
            onClick={() => void refreshProfile()}
            variant="secondary"
          >
            Refresh
          </Button>
          <Button
            leadingIcon={<LogOut aria-hidden="true" size={16} strokeWidth={2} />}
            onClick={handleLogout}
            variant="ghost"
          >
            Sign out
          </Button>
        </>
      }
      activeItem="developer-settings"
      description="Manage account details, integration API keys, and the API endpoint used by this workspace."
      eyebrow="Developer settings"
      title="Developer Settings"
      userInitials={getInitials(displayUser?.email)}
      userName={getDisplayName(displayUser?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Settings unavailable">
          <div className="flex gap-3 text-sm text-danger">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 space-y-5">
          <Panel
            actions={<Badge tone={displayUser ? 'emerald' : 'slate'}>{displayUser?.role ?? 'Unknown'}</Badge>}
            description="This is the authenticated account currently using the workspace."
            title="Account"
          >
            {isLoading ? (
              <div className="flex items-center gap-3 text-sm text-muted">
                <Spinner label="Loading profile" />
                <span>Loading profile</span>
              </div>
            ) : displayUser ? (
              <dl>
                <SettingRow
                  action={
                    <IconButton
                      icon={
                        copiedValue === 'email' ? (
                          <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2} />
                        ) : (
                          <Clipboard aria-hidden="true" size={16} strokeWidth={2} />
                        )
                      }
                      label="Copy email"
                      onClick={() => void copyValue('email', displayUser.email)}
                      size="sm"
                      variant="secondary"
                    />
                  }
                  label="Email"
                  value={<span className="break-all">{displayUser.email}</span>}
                />
                <SettingRow label="Role" value={displayUser.role} />
                <SettingRow
                  action={
                    <IconButton
                      icon={
                        copiedValue === 'user-id' ? (
                          <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2} />
                        ) : (
                          <Clipboard aria-hidden="true" size={16} strokeWidth={2} />
                        )
                      }
                      label="Copy user ID"
                      onClick={() => void copyValue('user-id', displayUser.id)}
                      size="sm"
                      variant="secondary"
                    />
                  }
                  label="User ID"
                  value={<span className="break-all font-mono text-xs">{displayUser.id}</span>}
                />
                <SettingRow label="Created" value={formatDate(displayUser.createdAt)} />
              </dl>
            ) : (
              <p className="text-sm text-muted">No profile loaded.</p>
            )}
          </Panel>

          {lastIssuedApiKey ? (
            <Panel
              actions={<Badge tone="amber">One-time value</Badge>}
              description="Copy this new key now; it will not be shown again after refresh or sign-out."
              title="Latest Issued API Key"
            >
              <ApiKeyRow
                createdAt={formatDate(lastIssuedApiKey.createdAt)}
                label={lastIssuedApiKey.label}
                maskedKey={lastIssuedApiKey.key}
                onCopy={() => void copyValue('latest-api-key', lastIssuedApiKey.key)}
              />
            </Panel>
          ) : null}

          <Panel
            actions={<Badge tone="slate">{formatCount(activeApiKeys.length)} active</Badge>}
            description="Create named keys for scripts, CI jobs, or integrations. Raw key values are shown only once."
            title="API Keys"
          >
            <form
              className="mb-4 grid gap-3 rounded-panel border border-line bg-surface-muted p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
              onSubmit={(event) => void handleCreateApiKey(event)}
            >
              <Input
                id="new-api-key-label"
                label="New API key label"
                maxLength={80}
                onChange={(event) => setNewApiKeyLabel(event.target.value)}
                placeholder="Local development key"
                value={newApiKeyLabel}
              />
              <Button
                isLoading={isCreatingApiKey}
                leadingIcon={<KeyRound aria-hidden="true" size={16} strokeWidth={2} />}
                type="submit"
              >
                Generate key
              </Button>
            </form>

            {isLoading ? (
              <div className="flex items-center gap-3 text-sm text-muted">
                <Spinner label="Loading API keys" />
                <span>Loading API keys</span>
              </div>
            ) : activeApiKeys.length ? (
              <div className="grid gap-3">
                {activeApiKeys.map((apiKey) => (
                  <ApiKeyRow
                    createdAt={formatDate(apiKey.createdAt)}
                    key={apiKey.id}
                    label={apiKey.label}
                    lastUsedAt={apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : null}
                    maskedKey={maskApiKeySummary(apiKey)}
                    onRevoke={() => void handleRevokeApiKey(apiKey.id)}
                    revokedAt={apiKey.revokedAt}
                    isRevoking={revokingApiKeyId === apiKey.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No active API keys yet.</p>
            )}
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel
            actions={<Badge tone={apiBaseUrl ? 'emerald' : 'amber'}>{apiBaseUrl ? 'Ready' : 'Missing'}</Badge>}
            description="These values come from the deployment environment, not from user-entered settings."
            title="Environment"
          >
            <dl>
              <SettingRow
                action={
                  apiBaseUrl ? (
                    <IconButton
                      icon={
                        copiedValue === 'api-base-url' ? (
                          <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2} />
                        ) : (
                          <Clipboard aria-hidden="true" size={16} strokeWidth={2} />
                        )
                      }
                      label="Copy API base URL"
                      onClick={() => void copyValue('api-base-url', apiBaseUrl)}
                      size="sm"
                      variant="secondary"
                    />
                  ) : null
                }
                label="API base URL"
                value={
                  apiBaseUrl ? (
                    <span className="break-all font-mono text-xs">{apiBaseUrl}</span>
                  ) : (
                    <span className="text-warning">Not configured</span>
                  )
                }
              />
              <SettingRow label="Variable" value={<span className="font-mono text-xs">{API_BASE_URL_ENV_VAR}</span>} />
              <SettingRow
                action={
                  apiDocsUrl ? (
                    <a
                      className="inline-flex size-8 items-center justify-center rounded-control border border-line-strong bg-surface text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                      href={apiDocsUrl}
                      rel="noreferrer"
                      target="_blank"
                      title="Open API docs"
                    >
                      <ExternalLink aria-hidden="true" size={16} strokeWidth={2} />
                      <span className="sr-only">Open API docs</span>
                    </a>
                  ) : null
                }
                label="API docs"
                value={apiDocsUrl ? <span className="break-all font-mono text-xs">{apiDocsUrl}</span> : 'Not set'}
              />
            </dl>
          </Panel>

          <Panel
            actions={<Badge tone={accessToken ? 'emerald' : 'amber'}>{accessToken ? 'Signed in' : 'Missing'}</Badge>}
            description="This reflects the current browser login, not an API key."
            title="Browser Access"
          >
            <dl>
              <SettingRow
                label="Access token"
                value={<Badge tone={accessToken ? 'emerald' : 'amber'}>{accessToken ? 'Loaded' : 'Missing'}</Badge>}
              />
              <SettingRow
                label="Profile sync"
                value={<Badge tone={profile ? 'emerald' : 'slate'}>{profile ? 'Loaded' : 'Pending'}</Badge>}
              />
              <SettingRow
                label="Key visibility"
                value={lastIssuedApiKey ? 'Latest raw key available' : 'Stored key summaries only'}
              />
            </dl>
          </Panel>

          <Panel title="Security Posture">
            <div className="grid gap-3 text-sm text-muted">
              <div className="flex items-start gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 text-success" strokeWidth={2} />
                <p>API keys are stored as hashes on the server.</p>
              </div>
              <div className="flex items-start gap-2">
                <KeyRound aria-hidden="true" className="mt-0.5 size-4 text-info" strokeWidth={2} />
                <p>Raw key values are shown once, immediately after creation.</p>
              </div>
              <div className="flex items-start gap-2">
                <ServerCog aria-hidden="true" className="mt-0.5 size-4 text-warning" strokeWidth={2} />
                <p>Revoking a key disables future API-key authentication for that credential.</p>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </DashboardShell>
  );
}
