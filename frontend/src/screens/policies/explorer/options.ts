import { toFilterOptions } from '@/screens/shared';
import type { PolicyExplorerOptions } from './types';

export const emptyPolicyExplorerOptions: PolicyExplorerOptions = {
  companies: [],
  countries: [],
  restrictions: [],
  sources: [],
  technologies: [],
  years: [],
};

export const buildPolicyExplorerFilterOptions = (options: PolicyExplorerOptions) => ({
  company: toFilterOptions(options.companies.map((company) => company.name)),
  country: toFilterOptions(options.countries.map((country) => country.name)),
  restriction: toFilterOptions(options.restrictions.map((restriction) => restriction.name)),
  source: toFilterOptions(options.sources.map((source) => source.sourceName)),
  technology: toFilterOptions(options.technologies.map((technology) => technology.name)),
  year: options.years.map((year) => ({ label: year, value: year })),
});
