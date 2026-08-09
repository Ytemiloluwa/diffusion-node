import { apiClient, getData } from './http';
import type { UserProfile } from './types';

export const getCurrentUser = (): Promise<UserProfile> => getData(apiClient.get('/me'));
