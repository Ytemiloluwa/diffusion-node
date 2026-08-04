import type { RequestHandler } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import {
  listCategories,
  listCompanies,
  listCountries,
  listRestrictions,
  listSources,
  listTechnologies,
} from './referenceDataController';

export const listCategoriesHandler: RequestHandler = asyncHandler(async (_req, res) => {
  res.status(200).json({ data: await listCategories() });
});

export const listTechnologiesHandler: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json(await listTechnologies(req.query));
});

export const listCompaniesHandler: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json(await listCompanies(req.query));
});

export const listCountriesHandler: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json(await listCountries(req.query));
});

export const listRestrictionsHandler: RequestHandler = asyncHandler(async (_req, res) => {
  res.status(200).json({ data: await listRestrictions() });
});

export const listSourcesHandler: RequestHandler = asyncHandler(async (_req, res) => {
  res.status(200).json({ data: await listSources() });
});
