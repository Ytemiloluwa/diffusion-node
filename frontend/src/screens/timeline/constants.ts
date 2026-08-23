import type { PageInfo } from '@/lib/api';
import type { TimelineFilters } from './types';

export const TIMELINE_PAGE_SIZE = 20;

export const emptyTimelinePageInfo: PageInfo = {
  hasNextPage: false,
  limit: TIMELINE_PAGE_SIZE,
  nextCursor: null,
};

export const initialTimelineFilters: TimelineFilters = {
  eventType: '',
  sourceName: '',
  status: '',
};
