import type { Country, CountryWithRestrictionSummary, Policy } from '@/lib/api';

export const getPolicySource = (policy: Policy) =>
  policy.sources.find((source) => source.sourceUrl) ?? policy.sources[0];

export const getPolicySourceName = (policy: Policy): string =>
  getPolicySource(policy)?.sourceName ?? policy.documents[0]?.documentType ?? 'Source pending';

export const getPolicyTechnologyNames = (policy: Policy): string[] =>
  policy.technologies.map(({ technology }) => technology.name);

export const getPolicyCompanyNames = (policy: Policy): string[] =>
  policy.companies.map(({ company }) => company.name);

export const getPolicyCountryNames = (policy: Policy): string[] => [
  ...new Set(policy.jurisdictions.map(({ country }) => country.name)),
];

export const getPolicyCountries = (policy: Policy): Country[] => [
  ...new Map(policy.jurisdictions.map(({ country }) => [country.id, country])).values(),
];

export const getPolicyDate = (policy: Policy): string | null => policy.effectiveDate ?? policy.updatedAt ?? null;

export const getRestrictionCount = (country: CountryWithRestrictionSummary): number =>
  Object.values(country.restrictionSummary).reduce((total, count) => total + count, 0);
