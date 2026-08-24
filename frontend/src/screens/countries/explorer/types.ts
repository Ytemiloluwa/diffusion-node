import type { LucideIcon } from 'lucide-react';
import type {
  CountryWithRestrictionSummary,
  RestrictionType,
} from '@/lib/api';
import type { MetricTone } from '@/screens/shared';

export type CountryFilterState = {
  restriction?: string;
  tier?: string;
};

export type CountryExposure = CountryWithRestrictionSummary & {
  activePolicyCount: number;
  companyCount: number;
  companyNames: string[];
  latestPolicyDate: string | null;
  policyCount: number;
  restrictionCount: number;
  restrictionTypes: string[];
  technologyCount: number;
  technologyNames: string[];
};

export type CountryExplorerMetric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

export type CountryOptionState = {
  restrictions: RestrictionType[];
};

export type CountryTierDistribution = {
  count: number;
  tier: string | null;
};
