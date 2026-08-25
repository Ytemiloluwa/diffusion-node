import { Badge, Panel } from '@/components/atoms';
import type { ApiKeyCredential, UserProfile } from '@/lib/api';
import { SettingRow } from './SettingRow';

export type BrowserAccessPanelProps = {
  accessToken: string | null;
  lastIssuedApiKey: ApiKeyCredential | null;
  profile: UserProfile | null;
};

export function BrowserAccessPanel({
  accessToken,
  lastIssuedApiKey,
  profile,
}: BrowserAccessPanelProps) {
  return (
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
  );
}
