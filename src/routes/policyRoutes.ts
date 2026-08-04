import { Router } from 'express';

import {
  getPolicyHandler,
  getPolicyTimelineHandler,
  listPoliciesHandler,
} from '../controllers/policyHttpController';
import { validateRequest } from '../middleware/validateRequest';
import { idParamsSchema, policiesQuerySchema } from './validators';

export const policyRoutes = Router();

/**
 * @openapi
 * /api/v1/policies:
 *   get:
 *     summary: List policies with cursor pagination and advanced filters.
 */
policyRoutes.get('/', validateRequest({ query: policiesQuerySchema }), listPoliciesHandler);

/**
 * @openapi
 * /api/v1/policies/{id}:
 *   get:
 *     summary: Fetch one policy with sources, documents, and jurisdictions.
 */
policyRoutes.get('/:id', validateRequest({ params: idParamsSchema }), getPolicyHandler);

/**
 * @openapi
 * /api/v1/policies/{id}/timeline:
 *   get:
 *     summary: Fetch the ordered revision and event history for one policy.
 */
policyRoutes.get(
  '/:id/timeline',
  validateRequest({ params: idParamsSchema }),
  getPolicyTimelineHandler,
);
