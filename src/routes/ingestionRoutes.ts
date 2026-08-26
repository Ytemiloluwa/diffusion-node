import { Router } from 'express';

import {
  getIngestionDocumentHandler,
  listIngestionDocumentsHandler,
  listIngestionRunsHandler,
  listIngestionSourcesHandler,
  updateIngestionDocumentStatusHandler,
} from '../controllers/ingestionHttpController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  idParamsSchema,
  ingestionDocumentStatusBodySchema,
  ingestionDocumentsQuerySchema,
  ingestionRunsQuerySchema,
  ingestionSourcesQuerySchema,
} from './validators';

export const ingestionRoutes = Router();

ingestionRoutes.use(authenticateJWT);

ingestionRoutes.get(
  '/sources',
  validateRequest({ query: ingestionSourcesQuerySchema }),
  listIngestionSourcesHandler,
);
ingestionRoutes.get(
  '/runs',
  validateRequest({ query: ingestionRunsQuerySchema }),
  listIngestionRunsHandler,
);
ingestionRoutes.get(
  '/documents',
  validateRequest({ query: ingestionDocumentsQuerySchema }),
  listIngestionDocumentsHandler,
);
ingestionRoutes.get(
  '/documents/:id',
  validateRequest({ params: idParamsSchema }),
  getIngestionDocumentHandler,
);
ingestionRoutes.patch(
  '/documents/:id/status',
  validateRequest({ body: ingestionDocumentStatusBodySchema, params: idParamsSchema }),
  updateIngestionDocumentStatusHandler,
);
