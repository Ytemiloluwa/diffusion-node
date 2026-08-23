import type { LucideIcon } from 'lucide-react';
import type {
  Company,
  CountryWithRestrictionSummary,
  PolicyStatus,
} from '@/lib/api';
import type { MetricTone } from '@/screens/shared';

export type CountrySummary = {
  isoCode: string;
  name: string;
};

export type CompanyStats = {
  countries: Map<string, string>;
  latestPolicyDate: string | null;
  policyCount: number;
  technologies: Set<string>;
};

export type CompanyExplorerMetric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

export type CompanyOptionState = {
  companies: Company[];
  countries: CountryWithRestrictionSummary[];
};

export type CompanyStatusCount = {
  count: number;
  status: string;
};

export type CompanyCountryCount = {
  count: number;
  isoCode: string;
  name: string;
};

export type PolicyStatusCounts = Record<PolicyStatus, number>;
