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
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge, Button, IconButton, Input, Panel, Spinner } from '@/components/atoms';
import { ApiKeyRow } from '@/components/molecules';
import { DashboardShell } from '@/components/templates';
import { API_BASE_URL_ENV_VAR, getApiBaseUrl, type ApiKeySummary, type UserProfile } from '@/lib/api';
import { useAuthStore } from '@/store';

type MetricTone = 'amber' | 'emerald' | 'sky' | 'slate';

type Metric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

const metricToneClasses: Record<MetricTone, string> = {
  amber: 'bg-warning-soft text-warning ring-warning-line',
  emerald: 'bg-success-soft text-success ring-success-line',
  sky: 'bg-info-soft text-info ring-info-line',
  slate: 'bg-surface-muted text-ink-soft ring-line',
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatCount = (value: number): string => value.toLocaleString('en-US');

const getDisplayName = (email?: string): string => {
  if (!email) {
    return 'Analyst';
  }

  const localPart = email.split('@')[0] ?? email;
  const words = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.length ? words.join(' ') : email;
};

const getInitials = (email?: string): string => {
  if (!email) {
    return 'DN';
  }

  const words = email.split('@')[0]?.split(/[._-]+/).filter(Boolean) ?? [];
  const initials = words.map((word) => word.charAt(0).toUpperCase()).join('');

  return (initials || email.slice(0, 2).toUpperCase()).slice(0, 2);
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Settings data could not be loaded.';
};

const getApiDocsUrl = (apiBaseUrl: string): string => {
  const baseWithoutVersion = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

  return `${baseWithoutVersion}/docs`;
};

const maskApiKeySummary = (apiKey: ApiKeySummary): string => {
  const suffix = apiKey.id.replaceAll('-', '').slice(-8).toUpperCase();

  return `Stored as hash (${suffix})`;
};

function MetricCard({ detail, icon: Icon, label, tone, value }: Metric) {
  return (
    <section className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-ink">{value}</p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-control ring-1 ring-inset ${metricToneClasses[tone]}`}
        >
          <Icon aria-hidden="true" size={19} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </section>
  );
}

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
  const [newApiKeyLabel, setNewApiKeyLabel] = useState('Dashboard session');
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
      setError(toErrorMessage(loadError));
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
        setNewApiKeyLabel('Dashboard session');
        window.setTimeout(() => {
          void refreshProfile();
        }, 0);
      } catch (createError) {
        setError(toErrorMessage(createError));
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
        setError(toErrorMessage(revokeError));
      } finally {
        setRevokingApiKeyId(null);
      }
    },
    [revokeApiKey],
  );

  const activeApiKeys = profile?.apiKeys ?? [];
  const displayUser = profile ?? user;
  const metrics = useMemo<Metric[]>(
    () => [
      {
        detail: displayUser?.role ?? 'No active role',
        icon: UserRound,
        label: 'Signed-in user',
        tone: 'slate',
        value: displayUser ? getDisplayName(displayUser.email) : 'Not loaded',
      },
      {
        detail: 'Bearer token present in the current browser session',
        icon: ShieldCheck,
        label: 'Session',
        tone: accessToken ? 'emerald' : 'amber',
        value: accessToken ? 'Active' : 'Missing',
      },
      {
        detail: 'Active credentials returned by the profile API',
        icon: KeyRound,
        label: 'API keys',
        tone: activeApiKeys.length ? 'sky' : 'slate',
        value: formatCount(activeApiKeys.length),
      },
      {
        detail: API_BASE_URL_ENV_VAR,
        icon: ServerCog,
        label: 'API target',
        tone: apiBaseUrl ? 'emerald' : 'amber',
        value: apiBaseUrl ? 'Configured' : 'Missing',
      },
    ],
    [accessToken, activeApiKeys.length, apiBaseUrl, displayUser],
  );

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
      description="Review authenticated profile, active API credentials, and runtime API configuration."
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <section
                aria-hidden="true"
                className="rounded-panel border border-line bg-surface p-4 shadow-panel"
                key={index}
              >
                <div className="h-4 w-28 rounded-control bg-line" />
                <div className="mt-4 h-8 w-24 rounded-control bg-line" />
                <div className="mt-4 h-4 w-40 rounded-control bg-line" />
              </section>
            ))
          : metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <Panel
            actions={<Badge tone={displayUser ? 'emerald' : 'slate'}>{displayUser?.role ?? 'Unknown'}</Badge>}
            title="Profile"
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
              description="This raw credential is only available in the current login response."
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
            description="Active key summaries returned by the authenticated profile endpoint."
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
                placeholder="Dashboard session"
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
              <p className="text-sm text-muted">No active API keys returned.</p>
            )}
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel actions={<Badge tone={apiBaseUrl ? 'emerald' : 'amber'}>{apiBaseUrl ? 'Ready' : 'Missing'}</Badge>} title="API Runtime">
            <dl>
              <SettingRow label="Environment" value={API_BASE_URL_ENV_VAR} />
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
                label="Base URL"
                value={
                  apiBaseUrl ? (
                    <span className="break-all font-mono text-xs">{apiBaseUrl}</span>
                  ) : (
                    <span className="text-warning">Not configured</span>
                  )
                }
              />
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
                label="Docs"
                value={apiDocsUrl ? <span className="break-all font-mono text-xs">{apiDocsUrl}</span> : 'Not set'}
              />
            </dl>
          </Panel>

          <Panel title="Session">
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
                <p>API keys are stored hashed on the server.</p>
              </div>
              <div className="flex items-start gap-2">
                <KeyRound aria-hidden="true" className="mt-0.5 size-4 text-info" strokeWidth={2} />
                <p>Existing raw API key values are not returned by the profile endpoint.</p>
              </div>
              <div className="flex items-start gap-2">
                <ServerCog aria-hidden="true" className="mt-0.5 size-4 text-warning" strokeWidth={2} />
                <p>Credential creation and revocation require backend endpoints before controls are enabled.</p>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </DashboardShell>
  );
}
