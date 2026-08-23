import type { LucideIcon } from 'lucide-react';
import type {
  PolicyStatus,
  Technology,
  TechnologyCategory,
} from '@/lib/api';
import type { MetricTone } from '@/screens/shared';

export type CountrySummary = {
  isoCode: string;
  name: string;
};

export type TechnologyStats = {
  activePolicyCount: number;
  companies: Map<string, string>;
  countries: Map<string, CountrySummary>;
  latestPolicyDate: string | null;
  policyCount: number;
  statuses: Record<PolicyStatus, number>;
};

export type TechnologyExplorerMetric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

export type CategoryCount = {
  category: TechnologyCategory;
  count: number;
};

export type RankedTechnology = {
  stats: TechnologyStats;
  technology: Technology;
};
