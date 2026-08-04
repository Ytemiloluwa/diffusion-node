import type { RequestHandler } from 'express';

import prisma from '../db/prisma';
import { hashApiKey } from '../utils/apiKeys';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { verifyAccessToken } from '../utils/jwt';

const getBearerToken = (authorization?: string): string | null => {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
};

export const authenticateJWT: RequestHandler = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req.header('authorization'));

  if (!token) {
    throw new AppError(401, 'MISSING_TOKEN', 'Bearer token is required.');
  }

  const payload = verifyAccessToken(token);
  req.user = {
    email: payload.email,
    id: payload.sub,
    role: payload.role,
  };

  next();
});

export const authenticateApiKey: RequestHandler = asyncHandler(async (req, _res, next) => {
  const rawApiKey = req.header('x-api-key');

  if (!rawApiKey) {
    throw new AppError(401, 'MISSING_API_KEY', 'x-api-key header is required.');
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      key: hashApiKey(rawApiKey),
      revokedAt: null,
    },
    include: {
      user: true,
    },
  });

  if (!apiKey) {
    throw new AppError(401, 'INVALID_API_KEY', 'API key is invalid or revoked.');
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  req.user = {
    email: apiKey.user.email,
    id: apiKey.userId,
    role: apiKey.user.role,
  };

  next();
});
