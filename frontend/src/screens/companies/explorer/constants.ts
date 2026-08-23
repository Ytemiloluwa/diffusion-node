import type { PageInfo } from '@/lib/api';

export const COMPANY_PAGE_SIZE = 20;
export const COMPANY_OPTION_LIMIT = 100;
export const COMPANY_POLICY_CONTEXT_PAGE_LIMIT = 100;
export const COMPANY_POLICY_CONTEXT_PAGE_CAP = 5;

export const emptyCompanyPageInfo: PageInfo = {
  hasNextPage: false,
  limit: COMPANY_PAGE_SIZE,
  nextCursor: null,
};
