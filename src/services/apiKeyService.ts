import prisma from '../db/prisma';
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
