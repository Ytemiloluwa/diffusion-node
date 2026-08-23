import type { BadgeProps } from '@/components/atoms';
import {
  listPolicies,
  type Company,
  type CursorPage,
  type Policy,
} from '@/lib/api';
import { getPolicyDate } from '@/screens/shared';
import {
  COMPANY_POLICY_CONTEXT_PAGE_CAP,
  COMPANY_POLICY_CONTEXT_PAGE_LIMIT,
} from './constants';
import type {
  CompanyCountryCount,
  CompanyStats,
  CompanyStatusCount,
} from './types';

export const emptyCompanyStats = (): CompanyStats => ({
  countries: new Map<string, string>(),
  latestPolicyDate: null,
  policyCount: 0,
  technologies: new Set<string>(),
});

export const buildCompanyStats = (policies: Policy[]): Map<string, CompanyStats> => {
  const statsByCompanyId = new Map<string, CompanyStats>();

  policies.forEach((policy) => {
    policy.companies.forEach(({ companyId }) => {
      const stats = statsByCompanyId.get(companyId) ?? emptyCompanyStats();
      const policyDate = getPolicyDate(policy);

      stats.policyCount += 1;

      policy.technologies.forEach(({ technology }) => {
        stats.technologies.add(technology.name);
      });
      policy.jurisdictions.forEach(({ country }) => {
        stats.countries.set(country.isoCode, country.name);
      });

      if (
        policyDate &&
        (!stats.latestPolicyDate ||
          new Date(policyDate).getTime() > new Date(stats.latestPolicyDate).getTime())
      ) {
        stats.latestPolicyDate = policyDate;
      }

      statsByCompanyId.set(companyId, stats);
    });
  });

  return statsByCompanyId;
};

export const matchesCompanySearch = (company: Company, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    company.name,
    company.entityListStatus,
    company.hqCountry.name,
    company.hqCountry.isoCode,
    ...company.aliases,
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedQuery));
};

export const getEntityStatusTone = (status?: string | null): BadgeProps['tone'] => {
  if (!status) {
    return 'slate';
  }

  return status.toLowerCase().includes('entity') ? 'red' : 'amber';
};

export const getActiveCompanyFilterCount = (filters: Record<string, unknown>): number =>
  Object.values(filters).filter((value) => value !== undefined && value !== '').length;

export const getTopCountries = (companies: Company[]): CompanyCountryCount[] => {
  const countryCounts = companies.reduce<Record<string, CompanyCountryCount>>((counts, company) => {
    const existingCountry = counts[company.hqCountryId];
    counts[company.hqCountryId] = {
      count: (existingCountry?.count ?? 0) + 1,
      isoCode: company.hqCountry.isoCode,
      name: company.hqCountry.name,
    };
    return counts;
  }, {});

  return Object.values(countryCounts)
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 5);
};

export const getStatusDistribution = (companies: Company[]): CompanyStatusCount[] => {
  const statusCounts = companies.reduce<Record<string, number>>((counts, company) => {
    const status = company.entityListStatus ?? 'Not listed';
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});

  return Object.entries(statusCounts)
    .map(([status, count]) => ({ count, status }))
    .sort((left, right) => right.count - left.count || left.status.localeCompare(right.status));
};

export const loadCompanyPolicyContext = async (): Promise<{
  isPartial: boolean;
  policies: Policy[];
}> => {
  const policies: Policy[] = [];
  let cursor: string | undefined;
  let isPartial = false;

  for (let pageIndex = 0; pageIndex < COMPANY_POLICY_CONTEXT_PAGE_CAP; pageIndex += 1) {
    const page: CursorPage<Policy> = await listPolicies({
      cursor,
      limit: COMPANY_POLICY_CONTEXT_PAGE_LIMIT,
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
