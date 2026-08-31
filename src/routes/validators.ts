import { IngestionDocumentStatus, IngestionRunStatus, IngestionSourceType, Role } from '@prisma/client';
import { z } from 'zod';

const cursorPaginationQuery = {
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
};

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(Role).optional(),
});

export const tokenBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const apiKeyBodySchema = z.object({
  label: z.string().trim().min(1).max(80),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export const apiKeyParamsSchema = idParamsSchema;

export const policiesQuerySchema = z.object({
  ...cursorPaginationQuery,
  company: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  q: z.string().min(1).optional(),
  restriction: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
  technology: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1900).max(2200).optional(),
});

export const paginationQuerySchema = z.object(cursorPaginationQuery);

export const technologiesQuerySchema = z.object({
  ...cursorPaginationQuery,
  category: z.string().min(1).optional(),
});

export const companiesQuerySchema = z.object({
  ...cursorPaginationQuery,
  country: z.string().min(1).optional(),
  entityListStatus: z.string().min(1).optional(),
});

export const ingestionDocumentsQuerySchema = z.object({
  ...cursorPaginationQuery,
  q: z.string().trim().min(1).optional(),
  runId: z.string().uuid().optional(),
  sourceId: z.string().uuid().optional(),
  status: z.enum(IngestionDocumentStatus).optional(),
});

export const ingestionRunsQuerySchema = z.object({
  ...cursorPaginationQuery,
  sourceId: z.string().uuid().optional(),
  status: z.enum(IngestionRunStatus).optional(),
});

export const ingestionSourcesQuerySchema = z.object({
  sourceType: z.enum(IngestionSourceType).optional(),
});

export const ingestionDocumentStatusBodySchema = z.object({
  status: z.enum([
    IngestionDocumentStatus.NEW,
    IngestionDocumentStatus.REVIEWED,
    IngestionDocumentStatus.SKIPPED,
  ]),
});
