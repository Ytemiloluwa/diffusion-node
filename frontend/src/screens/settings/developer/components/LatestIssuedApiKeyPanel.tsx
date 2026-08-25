import { Badge, Panel } from '@/components/atoms';
import { ApiKeyRow } from '@/components/molecules';
import type { ApiKeyCredential } from '@/lib/api';
import { formatDateTime as formatDate } from '@/screens/shared';
import type { CopySettingsValue } from '../types';

export type LatestIssuedApiKeyPanelProps = {
  apiKey: ApiKeyCredential;
  onCopyValue: CopySettingsValue;
};

export function LatestIssuedApiKeyPanel({
  apiKey,
  onCopyValue,
}: LatestIssuedApiKeyPanelProps) {
  return (
    <Panel
      actions={<Badge tone="amber">One-time value</Badge>}
      description="Copy this new key now; it will not be shown again after refresh or sign-out."
      title="Latest Issued API Key"
    >
      <ApiKeyRow
        createdAt={formatDate(apiKey.createdAt)}
        label={apiKey.label}
        maskedKey={apiKey.key}
        onCopy={() => void onCopyValue('latest-api-key', apiKey.key)}
      />
    </Panel>
  );
}
