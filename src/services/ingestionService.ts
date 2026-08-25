import { Prisma } from '@prisma/client';
import { z } from 'zod';

import prisma from '../db/prisma';
import { AppError } from '../utils/errors';
import {
  FEDERAL_REGISTER_DOCUMENTS_URL,
  fetchFederalRegisterDocuments,
  type FetchLike,
  type FederalRegisterDocument,
} from './federalRegisterClient';

const DEFAULT_SOURCE_NAME = 'Federal Register semiconductor export-control monitor';
const DEFAULT_DRY_RUN_SOURCE_ID = 'federal-register-default-dry-run';

const defaultFederalRegisterQuery = {
  agencies: ['commerce-department'],
  limit: 25,
  lookbackDays: 30,
  terms: [
    'semiconductor export controls',
    'advanced computing items',
    'Entity List semiconductor',
    'artificial intelligence diffusion',
  ],
};

const federalRegisterSourceQuerySchema = z.object({
  agencies: z.array(z.string()).default(defaultFederalRegisterQuery.agencies),
  limit: z.number().int().positive().max(100).default(defaultFederalRegisterQuery.limit),
  lookbackDays: z.number().int().positive().max(365).default(defaultFederalRegisterQuery.lookbackDays),
  terms: z.array(z.string()).min(1).default(defaultFederalRegisterQuery.terms),
});

export type RunFederalRegisterIngestionOptions = {
  dryRun?: boolean;
  fetchImpl?: FetchLike;
  limit?: number;
  publicationDateGte?: string;
  sourceId?: string;
  terms?: string[];
};

export type FederalRegisterIngestionResult = {
  documentsCreated: number;
  documentsFound: number;
  documentsUpdated: number;
  dryRun: boolean;
  runId: string | null;
  sourceId: string;
};

const defaultFederalRegisterDryRunSource = {
  baseUrl: FEDERAL_REGISTER_DOCUMENTS_URL,
  id: DEFAULT_DRY_RUN_SOURCE_ID,
  isActive: true,
  query: defaultFederalRegisterQuery,
};

const toDateOnlyString = (date: Date): string => date.toISOString().slice(0, 10);

const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);

  return toDateOnlyString(date);
};

const normalizeSourceQuery = (query: Prisma.JsonValue) =>
  federalRegisterSourceQuerySchema.parse(query ?? {});

const toPublicationDate = (value?: string | null): Date | null =>
  value ? new Date(`${value}T00:00:00.000Z`) : null;

const normalizeAgencyNames = (document: FederalRegisterDocument): string[] =>
  (document.agencies ?? [])
    .map((agency) => agency.name ?? agency.raw_name ?? '')
    .map((agencyName) => agencyName.trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));

const getMatchedTerms = (document: FederalRegisterDocument, terms: string[]): string[] => {
  const searchText = [document.title, document.abstract, document.type]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return terms.filter((term) => searchText.includes(term.toLowerCase()));
};

export const ensureFederalRegisterIngestionSource = async () =>
  prisma.ingestionSource.upsert({
    create: {
      baseUrl: FEDERAL_REGISTER_DOCUMENTS_URL,
      name: DEFAULT_SOURCE_NAME,
      query: defaultFederalRegisterQuery,
      sourceType: 'FEDERAL_REGISTER_API',
    },
    update: {
      baseUrl: FEDERAL_REGISTER_DOCUMENTS_URL,
      isActive: true,
      query: defaultFederalRegisterQuery,
    },
    where: {
      sourceType_name: {
        name: DEFAULT_SOURCE_NAME,
        sourceType: 'FEDERAL_REGISTER_API',
      },
    },
  });

export const runFederalRegisterIngestion = async ({
  dryRun = false,
  fetchImpl,
  limit,
  publicationDateGte,
  sourceId,
  terms,
}: RunFederalRegisterIngestionOptions = {}): Promise<FederalRegisterIngestionResult> => {
  const source = sourceId
    ? await prisma.ingestionSource.findUnique({ where: { id: sourceId } })
    : dryRun
      ? defaultFederalRegisterDryRunSource
      : await ensureFederalRegisterIngestionSource();

  if (!source) {
    throw new AppError(404, 'INGESTION_SOURCE_NOT_FOUND', 'Ingestion source was not found.');
  }

  if (!source.isActive) {
    throw new AppError(409, 'INGESTION_SOURCE_INACTIVE', 'Ingestion source is inactive.');
  }

  const sourceQuery = normalizeSourceQuery(source.query);
  const optionTerms = terms?.map((term) => term.trim()).filter(Boolean) ?? [];
  const searchTerms = optionTerms.length ? optionTerms : sourceQuery.terms;
  const run = dryRun
    ? null
    : await prisma.ingestionRun.create({
        data: {
          sourceId: source.id,
          status: 'RUNNING',
        },
      });

  let documentsCreated = 0;
  let documentsUpdated = 0;

  try {
    const documents = await fetchFederalRegisterDocuments(
      {
        agencies: sourceQuery.agencies,
        baseUrl: source.baseUrl,
        limit: limit ?? sourceQuery.limit,
        publicationDateGte: publicationDateGte ?? getDateDaysAgo(sourceQuery.lookbackDays),
        terms: searchTerms,
      },
      fetchImpl,
    );

    if (!dryRun) {
      for (const document of documents) {
        const existingDocument = await prisma.ingestionDocument.findUnique({
          where: {
            sourceId_externalId: {
              externalId: document.document_number,
              sourceId: source.id,
            },
          },
        });
        const documentData = {
          abstract: document.abstract ?? null,
          agencyNames: normalizeAgencyNames(document),
          documentType: document.type ?? null,
          htmlUrl: document.html_url ?? null,
          matchedTerms: getMatchedTerms(document, searchTerms),
          pdfUrl: document.pdf_url ?? null,
          publicationDate: toPublicationDate(document.publication_date),
          rawPayload: document as unknown as Prisma.InputJsonValue,
          runId: run?.id,
          title: document.title,
        };

        if (existingDocument) {
          await prisma.ingestionDocument.update({
            data: documentData,
            where: { id: existingDocument.id },
          });
          documentsUpdated += 1;
          continue;
        }

        await prisma.ingestionDocument.create({
          data: {
            ...documentData,
            externalId: document.document_number,
            sourceId: source.id,
            status: 'NEW',
          },
        });
        documentsCreated += 1;
      }

      if (run) {
        await Promise.all([
          prisma.ingestionRun.update({
            data: {
              documentsCreated,
              documentsFound: documents.length,
              documentsUpdated,
              finishedAt: new Date(),
              status: 'SUCCEEDED',
            },
            where: { id: run.id },
          }),
          prisma.ingestionSource.update({
            data: { lastFetchedAt: new Date() },
            where: { id: source.id },
          }),
        ]);
      }
    }

    return {
      documentsCreated,
      documentsFound: documents.length,
      documentsUpdated,
      dryRun,
      runId: run?.id ?? null,
      sourceId: source.id,
    };
  } catch (error) {
    if (run) {
      await prisma.ingestionRun.update({
        data: {
          errorMessage: error instanceof Error ? error.message : 'Unknown ingestion error.',
          finishedAt: new Date(),
          status: 'FAILED',
        },
        where: { id: run.id },
      });
    }

    throw error;
  }
};
