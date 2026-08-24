import { CheckCircle2, Clipboard, ExternalLink } from 'lucide-react';
import { Badge, IconButton, Panel } from '@/components/atoms';
import { API_BASE_URL_ENV_VAR } from '@/lib/api';
import type { CopySettingsValue } from '../types';
import { SettingRow } from './SettingRow';

export type EnvironmentPanelProps = {
  apiBaseUrl: string | null;
  apiDocsUrl: string | null;
  copiedValue: string | null;
  onCopyValue: CopySettingsValue;
};

export function EnvironmentPanel({
  apiBaseUrl,
  apiDocsUrl,
  copiedValue,
  onCopyValue,
}: EnvironmentPanelProps) {
  return (
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
                onClick={() => void onCopyValue('api-base-url', apiBaseUrl)}
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
  );
}
