import type {
  Company,
  CountryWithRestrictionSummary,
  PolicyStatus,
  RestrictionType,
  SourceSummary,
  Technology,
} from '@/lib/api';
import type { PolicyFilters as StorePolicyFilters } from '@/store';

export type PolicyExplorerOptions = {
  companies: Company[];
  countries: CountryWithRestrictionSummary[];
  restrictions: RestrictionType[];
  sources: SourceSummary[];
  technologies: Technology[];
  years: string[];
};

export type ActivePolicyFilter = {
  key: keyof StorePolicyFilters;
  label: string;
  value: string;
};

export type LinkedEntityCounts = {
  companies: number;
  countries: number;
  technologies: number;
};

export type PolicyStatusCounts = Record<PolicyStatus, number>;
