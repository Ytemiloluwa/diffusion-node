import type { BadgeProps } from '@/components/atoms';
import {
  listPolicies,
  type Company,
  type CountryWithRestrictionSummary,
  type CursorPage,
  type Policy,
} from '@/lib/api';
import {
  getPolicyDate,
  getRestrictionCount,
} from '@/screens/shared';
import {
  COUNTRY_POLICY_CONTEXT_PAGE_CAP,
  COUNTRY_POLICY_CONTEXT_PAGE_LIMIT,
} from './constants';
import type {
  CountryExposure,
  CountryFilterState,
  CountryTierDistribution,
} from './types';

const tierToneClasses: Record<string, BadgeProps['tone']> = {
  'Group A:5': 'sky',
  'Group A:6': 'amber',
  'Group D:5': 'red',
};

const createCountryExposure = (country: CountryWithRestrictionSummary): CountryExposure => ({
  ...country,
  activePolicyCount: 0,
  companyCount: 0,
  companyNames: [],
  latestPolicyDate: null,
  policyCount: 0,
  restrictionCount: getRestrictionCount(country),
  restrictionTypes: [],
  technologyCount: 0,
  technologyNames: [],
});

export const buildCountryExposure = (
  countries: CountryWithRestrictionSummary[],
  policies: Policy[],
  companies: Company[],
): CountryExposure[] => {
  const exposureByCountryId = new Map<string, CountryExposure>();
  const policyIdsByCountryId = new Map<string, Set<string>>();
  const activePolicyIdsByCountryId = new Map<string, Set<string>>();
  const restrictionTypesByCountryId = new Map<string, Set<string>>();
  const technologiesByCountryId = new Map<string, Set<string>>();
  const companyNamesByCountryId = new Map<string, Set<string>>();

  countries.forEach((country) => {
    exposureByCountryId.set(country.id, createCountryExposure(country));
  });

  const ensureExposure = (country: CountryWithRestrictionSummary): CountryExposure => {
    const existingExposure = exposureByCountryId.get(country.id);

    if (existingExposure) {
      return existingExposure;
    }

    const exposure = createCountryExposure(country);
    exposureByCountryId.set(country.id, exposure);
    return exposure;
  };

  policies.forEach((policy) => {
    const policyDate = getPolicyDate(policy);

    policy.jurisdictions.forEach((jurisdiction) => {
      const exposure = ensureExposure({
        ...jurisdiction.country,
        jurisdictions: [],
        restrictionSummary: {},
      });
      const policyIds = policyIdsByCountryId.get(exposure.id) ?? new Set<string>();
      const activePolicyIds = activePolicyIdsByCountryId.get(exposure.id) ?? new Set<string>();
      const restrictionTypes = restrictionTypesByCountryId.get(exposure.id) ?? new Set<string>();
      const technologies = technologiesByCountryId.get(exposure.id) ?? new Set<string>();

      policyIds.add(policy.id);
      restrictionTypes.add(jurisdiction.restrictionType.name);

      if (policy.status === 'ACTIVE') {
        activePolicyIds.add(policy.id);
      }

      policy.technologies.forEach(({ technology }) => {
        technologies.add(technology.name);
      });

      if (
        policyDate &&
        (!exposure.latestPolicyDate ||
          new Date(policyDate).getTime() > new Date(exposure.latestPolicyDate).getTime())
      ) {
        exposure.latestPolicyDate = policyDate;
      }

      policyIdsByCountryId.set(exposure.id, policyIds);
      activePolicyIdsByCountryId.set(exposure.id, activePolicyIds);
      restrictionTypesByCountryId.set(exposure.id, restrictionTypes);
      technologiesByCountryId.set(exposure.id, technologies);
    });
  });

  companies.forEach((company) => {
    const companyNames = companyNamesByCountryId.get(company.hqCountryId) ?? new Set<string>();
    companyNames.add(company.name);
    companyNamesByCountryId.set(company.hqCountryId, companyNames);
  });

  return [...exposureByCountryId.values()]
    .map((country) => {
      const policyIds = policyIdsByCountryId.get(country.id) ?? new Set<string>();
      const activePolicyIds = activePolicyIdsByCountryId.get(country.id) ?? new Set<string>();
      const restrictionTypes = restrictionTypesByCountryId.get(country.id) ?? new Set<string>();
      const technologies = technologiesByCountryId.get(country.id) ?? new Set<string>();
      const companyNames = companyNamesByCountryId.get(country.id) ?? new Set<string>();

      return {
        ...country,
        activePolicyCount: activePolicyIds.size,
        companyCount: companyNames.size,
        companyNames: [...companyNames].sort((left, right) => left.localeCompare(right)),
        policyCount: policyIds.size,
        restrictionCount: Math.max(country.restrictionCount, restrictionTypes.size),
        restrictionTypes: [...restrictionTypes].sort((left, right) => left.localeCompare(right)),
        technologyCount: technologies.size,
        technologyNames: [...technologies].sort((left, right) => left.localeCompare(right)),
      };
    })
    .sort(
      (left, right) =>
        right.activePolicyCount - left.activePolicyCount ||
        right.restrictionCount - left.restrictionCount ||
        left.name.localeCompare(right.name),
    );
};

export const loadCountryPolicyContext = async (): Promise<{
  isPartial: boolean;
  policies: Policy[];
}> => {
  const policies: Policy[] = [];
  let cursor: string | undefined;
  let isPartial = false;

  for (let pageIndex = 0; pageIndex < COUNTRY_POLICY_CONTEXT_PAGE_CAP; pageIndex += 1) {
    const page: CursorPage<Policy> = await listPolicies({
      cursor,
      limit: COUNTRY_POLICY_CONTEXT_PAGE_LIMIT,
    });

    policies.push(...page.data);

    if (!page.pageInfo.hasNextPage || !page.pageInfo.nextCursor) {
      return { isPartial: false, policies };
    }

    cursor = page.pageInfo.nextCursor;
    isPartial = true;
  }

  return { isPartial, policies };
};

export const matchesCountrySearch = (country: CountryExposure, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    country.name,
    country.isoCode,
    country.tierClassification,
    ...country.restrictionTypes,
    ...country.companyNames,
    ...country.technologyNames,
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedQuery));
};

export const getActiveCountryFilterCount = (
  filters: CountryFilterState,
  selectedCountryId?: string | null,
): number =>
  Object.values(filters).filter((value) => value !== undefined && value !== '').length +
  (selectedCountryId ? 1 : 0);

export const getTierTone = (tierClassification?: string | null): BadgeProps['tone'] =>
  tierClassification ? (tierToneClasses[tierClassification] ?? 'slate') : 'slate';

export const getTopCountries = (countries: CountryExposure[]): CountryExposure[] =>
  [...countries]
    .sort(
      (left, right) =>
        right.activePolicyCount - left.activePolicyCount ||
        right.restrictionCount - left.restrictionCount ||
        left.name.localeCompare(right.name),
    )
    .slice(0, 6);

export const getTierDistribution = (
  countries: CountryExposure[],
): CountryTierDistribution[] => {
  const counts = countries.reduce<Record<string, CountryTierDistribution>>((distribution, country) => {
    const key = country.tierClassification ?? 'Unclassified';
    distribution[key] = {
      count: (distribution[key]?.count ?? 0) + 1,
      tier: country.tierClassification,
    };
    return distribution;
  }, {});

  return Object.values(counts).sort(
    (left, right) => right.count - left.count || (left.tier ?? '').localeCompare(right.tier ?? ''),
  );
};
