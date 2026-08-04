import type { RequestHandler } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { issueToken, refreshAccessToken, register } from './authController';

export const registerHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = await register(req.body.email, req.body.password, req.body.role);
  res.status(201).json({ data: user });
});

export const tokenHandler: RequestHandler = asyncHandler(async (req, res) => {
  const tokenResponse = await issueToken(req.body.email, req.body.password, req.body.label);
  res.status(200).json({ data: tokenResponse });
});

export const refreshHandler: RequestHandler = asyncHandler(async (req, res) => {
  const tokenResponse = await refreshAccessToken(req.body.refreshToken);
  res.status(200).json({ data: tokenResponse });
});
