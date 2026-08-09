import { apiClient, cleanParams, getData, getPage } from './http';
import type {
  CompaniesQuery,
  Company,
  CountryWithRestrictionSummary,
  CursorPage,
  CursorPaginationQuery,
  RestrictionType,
  SourceSummary,
  TechnologiesQuery,
  Technology,
  TechnologyCategory,
} from './types';

export const listCategories = (): Promise<TechnologyCategory[]> =>
  getData(apiClient.get('/categories'));

export const listTechnologies = (query?: TechnologiesQuery): Promise<CursorPage<Technology>> =>
  getPage(apiClient.get('/technologies', { params: cleanParams(query) }));

export const listCompanies = (query?: CompaniesQuery): Promise<CursorPage<Company>> =>
  getPage(apiClient.get('/companies', { params: cleanParams(query) }));

export const listCountries = (
  query?: CursorPaginationQuery,
): Promise<CursorPage<CountryWithRestrictionSummary>> =>
  getPage(apiClient.get('/countries', { params: cleanParams(query) }));

export const listRestrictions = (): Promise<RestrictionType[]> =>
  getData(apiClient.get('/restrictions'));

export const listSources = (): Promise<SourceSummary[]> => getData(apiClient.get('/sources'));
