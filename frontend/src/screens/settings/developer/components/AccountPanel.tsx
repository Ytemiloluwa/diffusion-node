import { CheckCircle2, Clipboard } from 'lucide-react';
import { Badge, IconButton, Panel, Spinner } from '@/components/atoms';
import type { User } from '@/lib/api';
import { formatDateTime as formatDate } from '@/screens/shared';
import type { CopySettingsValue } from '../types';
import { SettingRow } from './SettingRow';

export type AccountPanelProps = {
  copiedValue: string | null;
  displayUser?: User | null;
  isLoading: boolean;
  onCopyValue: CopySettingsValue;
};

export function AccountPanel({
  copiedValue,
  displayUser,
  isLoading,
  onCopyValue,
}: AccountPanelProps) {
  return (
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
                onClick={() => void onCopyValue('email', displayUser.email)}
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
                onClick={() => void onCopyValue('user-id', displayUser.id)}
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
  );
}
