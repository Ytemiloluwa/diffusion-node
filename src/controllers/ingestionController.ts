import type {
  IngestionDocumentStatus,
  IngestionRunStatus,
  IngestionSourceType,
} from '@prisma/client';

import prisma from '../db/prisma';
import { AppError } from '../utils/errors';
import { getPage, normalizeLimit } from '../utils/pagination';

const textContains = (value: string): { contains: string } => ({ contains: value });

export type IngestionDocumentFilters = {
  cursor?: string;
  limit?: number;
  q?: string;
  runId?: string;
  sourceId?: string;
  status?: IngestionDocumentStatus;
};

export type IngestionRunFilters = {
  cursor?: string;
  limit?: number;
  sourceId?: string;
  status?: IngestionRunStatus;
};

export type IngestionSourceFilters = {
  sourceType?: IngestionSourceType;
};

export const listIngestionSources = async (filters: IngestionSourceFilters) =>
  prisma.ingestionSource.findMany({
    include: {
      _count: {
        select: {
          documents: true,
          runs: true,
        },
      },
    },
    orderBy: { name: 'asc' },
    where: {
      ...(filters.sourceType ? { sourceType: filters.sourceType } : {}),
    },
  });

export const listIngestionRuns = async (filters: IngestionRunFilters) => {
  const limit = normalizeLimit(filters.limit);
  const runs = await prisma.ingestionRun.findMany({
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    include: {
      source: {
        select: {
          id: true,
          name: true,
          sourceType: true,
        },
      },
    },
    orderBy: { id: 'asc' },
    skip: filters.cursor ? 1 : 0,
    take: limit + 1,
    where: {
      ...(filters.sourceId ? { sourceId: filters.sourceId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
  });

  return getPage(runs, limit);
};

export const listIngestionDocuments = async (filters: IngestionDocumentFilters) => {
  const limit = normalizeLimit(filters.limit);
  const documents = await prisma.ingestionDocument.findMany({
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    include: {
      run: {
        select: {
          id: true,
          status: true,
          startedAt: true,
        },
      },
      source: {
        select: {
          id: true,
          name: true,
          sourceType: true,
        },
      },
    },
    orderBy: { id: 'asc' },
    skip: filters.cursor ? 1 : 0,
    take: limit + 1,
    where: {
      ...(filters.q
        ? {
            OR: [
              { title: textContains(filters.q) },
              { abstract: textContains(filters.q) },
              { externalId: textContains(filters.q) },
              { documentType: textContains(filters.q) },
              { matchedTerms: { has: filters.q } },
              { matchedCategoryNames: { has: filters.q } },
              { matchedTechnologyNames: { has: filters.q } },
            ],
          }
        : {}),
      ...(filters.runId ? { runId: filters.runId } : {}),
      ...(filters.sourceId ? { sourceId: filters.sourceId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
  });

  return getPage(documents, limit);
};

export const getIngestionDocument = async (id: string) => {
  const document = await prisma.ingestionDocument.findUnique({
    include: {
      run: {
        select: {
          id: true,
          status: true,
          startedAt: true,
        },
      },
      source: {
        select: {
          id: true,
          name: true,
          sourceType: true,
        },
      },
    },
    where: { id },
  });

  if (!document) {
    throw new AppError(404, 'INGESTION_DOCUMENT_NOT_FOUND', 'Ingestion document was not found.');
  }

  return document;
};

export const updateIngestionDocumentStatus = async (
  id: string,
  status: Exclude<IngestionDocumentStatus, 'IMPORTED'>,
) => {
  await getIngestionDocument(id);

  return prisma.ingestionDocument.update({
    include: {
      run: {
        select: {
          id: true,
          status: true,
          startedAt: true,
        },
      },
      source: {
        select: {
          id: true,
          name: true,
          sourceType: true,
        },
      },
    },
    data: { status },
    where: { id },
  });
};
