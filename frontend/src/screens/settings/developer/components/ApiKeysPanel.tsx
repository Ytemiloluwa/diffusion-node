import { KeyRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { Badge, Button, Input, Panel, Spinner } from '@/components/atoms';
import { ApiKeyRow } from '@/components/molecules';
import type { ApiKeySummary } from '@/lib/api';
import {
  formatCount,
  formatDateTime as formatDate,
} from '@/screens/shared';
import { maskApiKeySummary } from '../settingsHelpers';

export type ApiKeysPanelProps = {
  activeApiKeys: ApiKeySummary[];
  isCreatingApiKey: boolean;
  isLoading: boolean;
  newApiKeyLabel: string;
  onCreateApiKey: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onNewApiKeyLabelChange: (value: string) => void;
  onRevokeApiKey: (apiKeyId: string) => Promise<void>;
  revokingApiKeyId: string | null;
};

export function ApiKeysPanel({
  activeApiKeys,
  isCreatingApiKey,
  isLoading,
  newApiKeyLabel,
  onCreateApiKey,
  onNewApiKeyLabelChange,
  onRevokeApiKey,
  revokingApiKeyId,
}: ApiKeysPanelProps) {
  return (
    <Panel
      actions={<Badge tone="slate">{formatCount(activeApiKeys.length)} active</Badge>}
      description="Create named keys for scripts, CI jobs, or integrations. Raw key values are shown only once."
      title="API Keys"
    >
      <form
        className="mb-4 grid gap-3 rounded-panel border border-line bg-surface-muted p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        onSubmit={(event) => void onCreateApiKey(event)}
      >
        <Input
          id="new-api-key-label"
          label="New API key label"
          maxLength={80}
          onChange={(event) => onNewApiKeyLabelChange(event.target.value)}
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
              onRevoke={() => void onRevokeApiKey(apiKey.id)}
              revokedAt={apiKey.revokedAt}
              isRevoking={revokingApiKeyId === apiKey.id}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No active API keys yet.</p>
      )}
    </Panel>
  );
}
