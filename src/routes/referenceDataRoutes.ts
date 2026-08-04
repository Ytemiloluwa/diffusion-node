import { Router } from 'express';

import {
  listCategoriesHandler,
  listCompaniesHandler,
  listCountriesHandler,
  listRestrictionsHandler,
  listSourcesHandler,
  listTechnologiesHandler,
} from '../controllers/referenceDataHttpController';
import { validateRequest } from '../middleware/validateRequest';
import { companiesQuerySchema, paginationQuerySchema, technologiesQuerySchema } from './validators';

export const referenceDataRoutes = Router();

referenceDataRoutes.get('/categories', listCategoriesHandler);
referenceDataRoutes.get(
  '/technologies',
  validateRequest({ query: technologiesQuerySchema }),
  listTechnologiesHandler,
);
referenceDataRoutes.get(
  '/companies',
  validateRequest({ query: companiesQuerySchema }),
  listCompaniesHandler,
);
referenceDataRoutes.get(
  '/countries',
  validateRequest({ query: paginationQuerySchema }),
  listCountriesHandler,
);
referenceDataRoutes.get('/restrictions', listRestrictionsHandler);
referenceDataRoutes.get('/sources', listSourcesHandler);
