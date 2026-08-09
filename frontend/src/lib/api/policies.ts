import { apiClient, cleanParams, getData, getPage } from './http';
import type { CursorPage, Policy, PolicyDetail, PolicySearchQuery, PolicyTimelineItem } from './types';

export const listPolicies = (query?: PolicySearchQuery): Promise<CursorPage<Policy>> =>
  getPage(apiClient.get('/policies', { params: cleanParams(query) }));

export const getPolicy = (id: string): Promise<PolicyDetail> => getData(apiClient.get(`/policies/${id}`));

export const getPolicyTimeline = (id: string): Promise<PolicyTimelineItem[]> =>
  getData(apiClient.get(`/policies/${id}/timeline`));
