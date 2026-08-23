import type { PageInfo } from '@/lib/api';

export const TECHNOLOGY_PAGE_SIZE = 20;
export const TECHNOLOGY_POLICY_CONTEXT_PAGE_LIMIT = 100;
export const TECHNOLOGY_POLICY_CONTEXT_PAGE_CAP = 5;

export const emptyTechnologyPageInfo: PageInfo = {
  hasNextPage: false,
  limit: TECHNOLOGY_PAGE_SIZE,
  nextCursor: null,
};
