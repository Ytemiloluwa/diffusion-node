import { Router } from 'express';

import { refreshHandler, registerHandler, tokenHandler } from '../controllers/authHttpController';
import { validateRequest } from '../middleware/validateRequest';
import { refreshBodySchema, registerBodySchema, tokenBodySchema } from './validators';

export const authRoutes = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a Diffusion Node user.
 */
authRoutes.post('/register', validateRequest({ body: registerBodySchema }), registerHandler);

/**
 * @openapi
 * /api/v1/auth/token:
 *   post:
 *     summary: Issue JWT credentials and persist an API key.
 */
authRoutes.post('/token', validateRequest({ body: tokenBodySchema }), tokenHandler);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Rotate an access token from a valid refresh token.
 */
authRoutes.post('/refresh', validateRequest({ body: refreshBodySchema }), refreshHandler);
