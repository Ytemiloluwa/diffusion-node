import type { PolicyFilters as FilterPanelPolicyFilters } from '@/components/molecules';
import type { PageInfo } from '@/lib/api';

export const POLICY_EXPLORER_PAGE_SIZE = 20;
export const POLICY_EXPLORER_OPTION_LIMIT = 100;

export const emptyPolicyExplorerPageInfo: PageInfo = {
  hasNextPage: false,
  limit: POLICY_EXPLORER_PAGE_SIZE,
  nextCursor: null,
};

export const policyExplorerFilterFields: Array<keyof FilterPanelPolicyFilters> = [
  'technology',
  'company',
  'country',
  'source',
  'restriction',
  'year',
];
