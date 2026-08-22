import { useMemo } from 'react';
import { Badge, Panel } from '@/components/atoms';
import type { Policy, PolicyStatus } from '@/lib/api';
import {
  createPolicyStatusCounts,
  formatCount,
  policyStatusLabels,
  policyStatusTones,
  policyStatusValues,
} from '@/screens/shared';

type PolicyStatusPanelProps = {
  policies: Policy[];
};

export function PolicyStatusPanel({ policies }: PolicyStatusPanelProps) {
  const statusCounts = useMemo(
    () =>
      policies.reduce<Record<PolicyStatus, number>>(
        (counts, policy) => ({
          ...counts,
          [policy.status]: counts[policy.status] + 1,
        }),
        createPolicyStatusCounts(),
      ),
    [policies],
  );

  return (
    <Panel description="Current status distribution from loaded policy records." title="Policy Status">
      <div className="space-y-3">
        {policyStatusValues.map((status) => (
          <div className="flex items-center justify-between gap-3" key={status}>
            <Badge tone={policyStatusTones[status]}>{policyStatusLabels[status]}</Badge>
            <span className="text-sm font-semibold text-ink">{formatCount(statusCounts[status])}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
