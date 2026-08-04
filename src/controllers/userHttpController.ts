import type { RequestHandler } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { getProfile } from './userController';

export const meHandler: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
  }

  res.status(200).json({ data: await getProfile(req.user.id) });
});
