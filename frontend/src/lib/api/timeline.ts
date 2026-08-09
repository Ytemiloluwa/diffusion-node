import { apiClient, cleanParams, getPage } from './http';
import type { CursorPage, CursorPaginationQuery, TimelineEventWithPolicy } from './types';

export const listTimeline = (
  query?: CursorPaginationQuery,
): Promise<CursorPage<TimelineEventWithPolicy>> =>
  getPage(apiClient.get('/timeline', { params: cleanParams(query) }));
