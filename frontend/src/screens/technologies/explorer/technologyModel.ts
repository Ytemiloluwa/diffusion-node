import type { BadgeProps } from '@/components/atoms';
import {
  listPolicies,
  type CursorPage,
  type Policy,
  type PolicyStatus,
  type Technology,
  type TechnologyCategory,
} from '@/lib/api';
import {
  createPolicyStatusCounts,
  getPolicyDate,
} from '@/screens/shared';
import {
  TECHNOLOGY_POLICY_CONTEXT_PAGE_CAP,
  TECHNOLOGY_POLICY_CONTEXT_PAGE_LIMIT,
} from './constants';
import type {
  CategoryCount,
  RankedTechnology,
  TechnologyStats,
} from './types';

export const emptyTechnologyStats = (): TechnologyStats => ({
  activePolicyCount: 0,
  companies: new Map<string, string>(),
  countries: new Map(),
  latestPolicyDate: null,
  policyCount: 0,
  statuses: createPolicyStatusCounts(),
});

export const buildTechnologyStats = (policies: Policy[]): Map<string, TechnologyStats> => {
  const statsByTechnologyId = new Map<string, TechnologyStats>();

  policies.forEach((policy) => {
    policy.technologies.forEach(({ technologyId }) => {
      const stats = statsByTechnologyId.get(technologyId) ?? emptyTechnologyStats();
      const policyDate = getPolicyDate(policy);

      stats.policyCount += 1;
      stats.statuses[policy.status] += 1;

      if (policy.status === 'ACTIVE') {
        stats.activePolicyCount += 1;
      }

      policy.companies.forEach(({ company }) => {
        stats.companies.set(company.id, company.name);
      });
      policy.jurisdictions.forEach(({ country }) => {
        stats.countries.set(country.id, {
          isoCode: country.isoCode,
          name: country.name,
        });
      });

      if (
        policyDate &&
        (!stats.latestPolicyDate ||
          new Date(policyDate).getTime() > new Date(stats.latestPolicyDate).getTime())
      ) {
        stats.latestPolicyDate = policyDate;
      }

      statsByTechnologyId.set(technologyId, stats);
    });
  });

  return statsByTechnologyId;
};

export const matchesTechnologySearch = (
  technology: Technology,
  stats: TechnologyStats | undefined,
  query: string,
): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    technology.name,
    technology.description,
    technology.category.name,
    ...(stats ? [...stats.companies.values()] : []),
    ...(stats ? [...stats.countries.values()].map((country) => country.name) : []),
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedQuery));
};

export const getActiveTechnologyFilterCount = (filters: Record<string, unknown>): number =>
  Object.values(filters).filter((value) => value !== undefined && value !== '').length;

export const getCategoryTone = (category: TechnologyCategory): BadgeProps['tone'] =>
  category.isActiveInV1 ? 'emerald' : 'slate';

export const getTopTechnologies = (
  technologies: Technology[],
  statsByTechnologyId: Map<string, TechnologyStats>,
): RankedTechnology[] =>
  technologies
    .map((technology) => ({
      stats: statsByTechnologyId.get(technology.id) ?? emptyTechnologyStats(),
      technology,
    }))
    .sort(
      (left, right) =>
        right.stats.activePolicyCount - left.stats.activePolicyCount ||
        right.stats.policyCount - left.stats.policyCount ||
        left.technology.name.localeCompare(right.technology.name),
    )
    .slice(0, 5);

export const getCategoryDistribution = (technologies: Technology[]): CategoryCount[] => {
  const distribution = new Map<string, CategoryCount>();

  technologies.forEach((technology) => {
    const current = distribution.get(technology.categoryId);
    distribution.set(technology.categoryId, {
      category: technology.category,
      count: (current?.count ?? 0) + 1,
    });
  });

  return [...distribution.values()].sort(
    (left, right) => right.count - left.count || left.category.name.localeCompare(right.category.name),
  );
};

export const buildTechnologyStatusCounts = (
  technologies: Technology[],
  statsByTechnologyId: Map<string, TechnologyStats>,
) =>
  technologies.reduce<Record<PolicyStatus, number>>((counts, technology) => {
    const stats = statsByTechnologyId.get(technology.id);

    if (!stats) {
      return counts;
    }

    Object.entries(stats.statuses).forEach(([status, count]) => {
      counts[status as PolicyStatus] += count;
    });

    return counts;
  }, createPolicyStatusCounts());

export const loadTechnologyPolicyContext = async (): Promise<{
  isPartial: boolean;
  policies: Policy[];
}> => {
  const policies: Policy[] = [];
  let cursor: string | undefined;
  let isPartial = false;

  for (let pageIndex = 0; pageIndex < TECHNOLOGY_POLICY_CONTEXT_PAGE_CAP; pageIndex += 1) {
    const page: CursorPage<Policy> = await listPolicies({
      cursor,
      limit: TECHNOLOGY_POLICY_CONTEXT_PAGE_LIMIT,
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
