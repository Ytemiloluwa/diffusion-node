import { CalendarDays, FileText, GitBranch, Landmark } from 'lucide-react';
import { Badge, Panel } from '@/components/atoms';
import type { PolicyDetail, PolicySource } from '@/lib/api';
import {
  formatCount,
  formatDate,
  policyStatusLabels,
  policyStatusTones,
} from '@/screens/shared';

type PolicyOverviewPanelProps = {
  policy: PolicyDetail;
  primarySource?: PolicySource;
  timelineCount: number;
};

export function PolicyOverviewPanel({
  policy,
  primarySource,
  timelineCount,
}: PolicyOverviewPanelProps) {
  return (
    <Panel
      actions={<Badge tone={policyStatusTones[policy.status]}>{policyStatusLabels[policy.status]}</Badge>}
      title="Policy Overview"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted">
            <FileText aria-hidden="true" size={14} strokeWidth={2} />
            Control
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">{policy.controlNumber ?? 'Not assigned'}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted">
            <CalendarDays aria-hidden="true" size={14} strokeWidth={2} />
            Effective
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatDate(policy.effectiveDate)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted">
            <Landmark aria-hidden="true" size={14} strokeWidth={2} />
            Source
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">{primarySource?.sourceName ?? 'Source pending'}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted">
            <GitBranch aria-hidden="true" size={14} strokeWidth={2} />
            Timeline
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(timelineCount)} events</p>
        </div>
      </div>
    </Panel>
  );
}
