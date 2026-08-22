import type { LucideIcon } from 'lucide-react';
import type {
  Company,
  CountryWithRestrictionSummary,
  Policy,
  Technology,
  TimelineEventWithPolicy,
} from '@/lib/api';
import type { MetricTone } from '@/screens/shared';

export type DashboardData = {
  companies: Company[];
  countries: CountryWithRestrictionSummary[];
  hasMoreCompanies: boolean;
  hasMoreCountries: boolean;
  hasMorePolicies: boolean;
  hasMoreTechnologies: boolean;
  policies: Policy[];
  technologies: Technology[];
  timeline: TimelineEventWithPolicy[];
};

export type DashboardMetric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};
