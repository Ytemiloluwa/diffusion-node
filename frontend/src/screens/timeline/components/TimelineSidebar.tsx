import Link from 'next/link';
import { Badge, Panel } from '@/components/atoms';
import type { TimelineEventWithPolicy } from '@/lib/api';
import { formatCount } from '@/screens/shared';
import type { TimelineFilters, TimelineSummaryCount } from '../types';
import { PolicyStatusBadge } from './PolicyStatusBadge';
import { TimelineFiltersPanel } from './TimelineFiltersPanel';

type TimelineFilterOption = {
  label: string;
  value: string;
};

type TimelineSidebarProps = {
  draftFilters: TimelineFilters;
  eventTypeOptions: TimelineFilterOption[];
  linkedPolicies: Array<NonNullable<TimelineEventWithPolicy['policy']>>;
  onApplyFilters: () => void;
  onChangeDraftFilters: (filters: TimelineFilters) => void;
  onResetFilters: () => void;
  sourceCounts: TimelineSummaryCount[];
  sourceOptions: TimelineFilterOption[];
  statusCounts: TimelineSummaryCount[];
  statusOptions: TimelineFilterOption[];
};

export function TimelineSidebar({
  draftFilters,
  eventTypeOptions,
  linkedPolicies,
  onApplyFilters,
  onChangeDraftFilters,
  onResetFilters,
  sourceCounts,
  sourceOptions,
  statusCounts,
  statusOptions,
}: TimelineSidebarProps) {
  return (
    <aside className="space-y-6">
      <TimelineFiltersPanel
        draftFilters={draftFilters}
        eventTypeOptions={eventTypeOptions}
        onApplyFilters={onApplyFilters}
        onChangeDraftFilters={onChangeDraftFilters}
        onResetFilters={onResetFilters}
        sourceOptions={sourceOptions}
        statusOptions={statusOptions}
      />

      <Panel description="Policy records connected to the current timeline view." title="Policy Drilldowns">
        {linkedPolicies.length ? (
          <div className="space-y-3">
            {linkedPolicies.map((policy) => (
              <Link
                className="block rounded-panel border border-line bg-surface p-3 transition-colors hover:border-brand-line hover:bg-brand-soft"
                href={`/policies/${policy.id}`}
                key={policy.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm font-semibold leading-5 text-ink">{policy.title}</p>
                  <PolicyStatusBadge status={policy.status} />
                </div>
                {policy.controlNumber ? (
                  <p className="mt-2 text-xs font-semibold uppercase text-subtle">{policy.controlNumber}</p>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No linked policies in the current view.</p>
        )}
      </Panel>

      <Panel description="Source concentration for the current timeline view." title="Source Summary">
        {sourceCounts.length ? (
          <div className="space-y-3">
            {sourceCounts.map((source) => (
              <div className="flex items-center justify-between gap-3" key={source.label}>
                <span className="truncate text-sm font-semibold text-muted">{source.label}</span>
                <Badge tone="amber">{formatCount(source.count)}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No source summary available.</p>
        )}
      </Panel>

      <Panel description="Policy status mix across the current timeline view." title="Status Summary">
        {statusCounts.length ? (
          <div className="space-y-3">
            {statusCounts.map((status) => (
              <div className="flex items-center justify-between gap-3" key={status.label}>
                <span className="text-sm font-semibold text-muted">{status.label}</span>
                <Badge tone="slate">{formatCount(status.count)}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No status summary available.</p>
        )}
      </Panel>
    </aside>
  );
}
