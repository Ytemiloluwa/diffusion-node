import { apiClient, getData } from './http';
import type { ApiKeyCredential, ApiKeySummary } from './types';

export type CreateApiKeyPayload = {
  label: string;
};

export const createApiKey = (payload: CreateApiKeyPayload): Promise<ApiKeyCredential> =>
  getData(apiClient.post('/api-keys', payload));

export const revokeApiKey = (apiKeyId: string): Promise<ApiKeySummary> =>
  getData(apiClient.post(`/api-keys/${apiKeyId}/revoke`));
