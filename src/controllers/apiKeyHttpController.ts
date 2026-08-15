import type { RequestHandler } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { createApiKey, revokeApiKey } from './apiKeyController';

const requireUserId = (userId?: string): string => {
  if (!userId) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
  }

  return userId;
};

export const createApiKeyHandler: RequestHandler = asyncHandler(async (req, res) => {
  const apiKey = await createApiKey(requireUserId(req.user?.id), req.body.label);
  res.status(201).json({ data: apiKey });
});

export const revokeApiKeyHandler: RequestHandler = asyncHandler(async (req, res) => {
  const apiKey = await revokeApiKey(requireUserId(req.user?.id), String(req.params.id));
  res.status(200).json({ data: apiKey });
});
