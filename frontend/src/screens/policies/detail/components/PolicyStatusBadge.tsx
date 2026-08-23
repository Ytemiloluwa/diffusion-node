import { Badge } from '@/components/atoms';
import type { PolicyStatus } from '@/lib/api';
import { policyStatusLabels, policyStatusTones } from '@/screens/shared';

type PolicyStatusBadgeProps = {
  status: PolicyStatus | null;
};

export function PolicyStatusBadge({ status }: PolicyStatusBadgeProps) {
  if (!status) {
    return <Badge tone="slate">Not set</Badge>;
  }

  return <Badge tone={policyStatusTones[status]}>{policyStatusLabels[status]}</Badge>;
}
