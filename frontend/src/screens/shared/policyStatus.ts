import type { BadgeProps } from '@/components/atoms';
import type { PolicyStatus } from '@/lib/api';

export const policyStatusLabels: Record<PolicyStatus, string> = {
  ACTIVE: 'Active',
  CONTESTED: 'Contested',
  DRAFT: 'Draft',
  RESCINDED: 'Rescinded',
  SUPERSEDED: 'Superseded',
};

export const policyStatusTones: Record<PolicyStatus, BadgeProps['tone']> = {
  ACTIVE: 'emerald',
  CONTESTED: 'amber',
  DRAFT: 'slate',
  RESCINDED: 'red',
  SUPERSEDED: 'sky',
};

export const createPolicyStatusCounts = (): Record<PolicyStatus, number> => ({
  ACTIVE: 0,
  CONTESTED: 0,
  DRAFT: 0,
  RESCINDED: 0,
  SUPERSEDED: 0,
});

export const policyStatusValues = Object.keys(policyStatusLabels) as PolicyStatus[];
