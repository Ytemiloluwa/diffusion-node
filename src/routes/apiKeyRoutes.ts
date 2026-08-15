import { Router } from 'express';

import {
  createApiKeyHandler,
  revokeApiKeyHandler,
} from '../controllers/apiKeyHttpController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { apiKeyBodySchema, apiKeyParamsSchema } from './validators';

export const apiKeyRoutes = Router();

apiKeyRoutes.post(
  '/api-keys',
  authenticateJWT,
  validateRequest({ body: apiKeyBodySchema }),
  createApiKeyHandler,
);

apiKeyRoutes.post(
  '/api-keys/:id/revoke',
  authenticateJWT,
  validateRequest({ params: apiKeyParamsSchema }),
  revokeApiKeyHandler,
);
