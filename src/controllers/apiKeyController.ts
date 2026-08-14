import { createApiKeyForUser, revokeApiKeyForUser } from '../services/apiKeyService';

export const createApiKey = async (userId: string, label: string) => {
  const { apiKey, rawApiKey } = await createApiKeyForUser(userId, label);

  return {
    createdAt: apiKey.createdAt,
    id: apiKey.id,
    key: rawApiKey,
    label: apiKey.label,
  };
};

export const revokeApiKey = async (userId: string, apiKeyId: string) => {
  const apiKey = await revokeApiKeyForUser(userId, apiKeyId);

  return {
    createdAt: apiKey.createdAt,
    id: apiKey.id,
    label: apiKey.label,
    lastUsedAt: apiKey.lastUsedAt,
    revokedAt: apiKey.revokedAt,
  };
};
