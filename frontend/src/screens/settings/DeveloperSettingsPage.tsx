'use client';

import { LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import { getDisplayName, getInitials } from '@/screens/shared';
import {
  AccountPanel,
  ApiKeysPanel,
  BrowserAccessPanel,
  EnvironmentPanel,
  LatestIssuedApiKeyPanel,
  SecurityPosturePanel,
  SettingsErrorPanel,
} from './developer/components';
import { useDeveloperSettingsData } from './developer/hooks/useDeveloperSettingsData';

export function DeveloperSettingsPage() {
  const {
    accessToken,
    activeApiKeys,
    apiBaseUrl,
    apiDocsUrl,
    copiedValue,
    copyValue,
    displayUser,
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
  } = useDeveloperSettingsData();

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
      {error ? <SettingsErrorPanel error={error} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 space-y-5">
          <AccountPanel
            copiedValue={copiedValue}
            displayUser={displayUser}
            isLoading={isLoading}
            onCopyValue={copyValue}
          />

          {lastIssuedApiKey ? (
            <LatestIssuedApiKeyPanel apiKey={lastIssuedApiKey} onCopyValue={copyValue} />
          ) : null}

          <ApiKeysPanel
            activeApiKeys={activeApiKeys}
            isCreatingApiKey={isCreatingApiKey}
            isLoading={isLoading}
            newApiKeyLabel={newApiKeyLabel}
            onCreateApiKey={handleCreateApiKey}
            onNewApiKeyLabelChange={setNewApiKeyLabel}
            onRevokeApiKey={handleRevokeApiKey}
            revokingApiKeyId={revokingApiKeyId}
          />
        </div>

        <aside className="space-y-5">
          <EnvironmentPanel
            apiBaseUrl={apiBaseUrl}
            apiDocsUrl={apiDocsUrl}
            copiedValue={copiedValue}
            onCopyValue={copyValue}
          />
          <BrowserAccessPanel
            accessToken={accessToken}
            lastIssuedApiKey={lastIssuedApiKey}
            profile={profile}
          />
          <SecurityPosturePanel />
        </aside>
      </div>
    </DashboardShell>
  );
}
