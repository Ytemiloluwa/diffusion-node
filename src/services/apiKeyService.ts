import prisma from '../db/prisma';
import { AppError } from '../utils/errors';
import { generateApiKey, hashApiKey } from '../utils/apiKeys';

export const createApiKeyForUser = async (userId: string, label: string) => {
  const rawApiKey = generateApiKey();
  const apiKey = await prisma.apiKey.create({
    data: {
      key: hashApiKey(rawApiKey),
      label,
      userId,
    },
  });

  return { apiKey, rawApiKey };
};

export const revokeApiKeyForUser = async (userId: string, apiKeyId: string) => {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: apiKeyId,
      revokedAt: null,
      userId,
    },
  });

  if (!apiKey) {
    throw new AppError(
      404,
      'API_KEY_NOT_FOUND',
      'API key was not found or has already been revoked.',
    );
  }

  return prisma.apiKey.update({
    data: {
      revokedAt: new Date(),
    },
    where: {
      id: apiKey.id,
    },
  });
};
