import { Copy, KeyRound, Trash2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { Badge, IconButton } from '@/components/atoms';
import { cn } from '@/lib/cn';

export type ApiKeyRowProps = HTMLAttributes<HTMLDivElement> & {
  createdAt?: string;
  isRevoking?: boolean;
  label: string;
  lastUsedAt?: string | null;
  maskedKey: string;
  onCopy?: () => void;
  onRevoke?: () => void;
  revokedAt?: string | null;
};

export function ApiKeyRow({
  className,
  createdAt,
  isRevoking = false,
  label,
  lastUsedAt,
  maskedKey,
  onCopy,
  onRevoke,
  revokedAt,
  ...props
}: ApiKeyRowProps) {
  const isRevoked = Boolean(revokedAt);

  return (
    <div
      className={cn(
        'grid gap-3 rounded-panel border border-line bg-surface px-4 py-3 shadow-panel sm:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <KeyRound aria-hidden="true" className="text-muted" size={16} strokeWidth={2} />
          <p className="font-medium text-ink">{label}</p>
          <Badge tone={isRevoked ? 'red' : 'emerald'}>{isRevoked ? 'Revoked' : 'Active'}</Badge>
        </div>
        <p className="mt-2 truncate font-mono text-sm text-muted">{maskedKey}</p>
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {createdAt ? (
            <div className="flex gap-1">
              <dt>Created</dt>
              <dd>{createdAt}</dd>
            </div>
          ) : null}
          <div className="flex gap-1">
            <dt>Last used</dt>
            <dd>{lastUsedAt ?? 'Never'}</dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        {onCopy ? (
          <IconButton
            icon={<Copy aria-hidden="true" size={16} strokeWidth={2} />}
            label="Copy API key"
            onClick={onCopy}
            size="sm"
            variant="secondary"
          />
        ) : null}
        {onRevoke ? (
          <IconButton
            disabled={isRevoked}
            icon={<Trash2 aria-hidden="true" size={16} strokeWidth={2} />}
            isLoading={isRevoking}
            label="Revoke API key"
            onClick={onRevoke}
            size="sm"
            variant="ghost"
          />
        ) : null}
      </div>
    </div>
  );
}
