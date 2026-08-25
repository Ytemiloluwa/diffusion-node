import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type AsyncMock<TResult> = (args?: unknown) => Promise<TResult>;

const mockPrisma = {
  ingestionDocument: {
    create: jest.fn<AsyncMock<unknown>>(),
    findUnique: jest.fn<AsyncMock<unknown | null>>(),
    update: jest.fn<AsyncMock<unknown>>(),
  },
  ingestionRun: {
    create: jest.fn<AsyncMock<{ id: string }>>(),
    update: jest.fn<AsyncMock<unknown>>(),
  },
  ingestionSource: {
    findUnique: jest.fn<AsyncMock<unknown | null>>(),
    update: jest.fn<AsyncMock<unknown>>(),
    upsert: jest.fn<AsyncMock<unknown>>(),
  },
};

jest.mock('../src/db/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const {
  buildFederalRegisterDocumentsUrl,
  normalizeFederalRegisterLimit,
} = require('../src/services/federalRegisterClient');
type FetchLike = import('../src/services/federalRegisterClient').FetchLike;
const { runFederalRegisterIngestion } = require('../src/services/ingestionService');

const federalRegisterDocument = {
  abstract: 'BIS updates export controls for advanced computing semiconductors.',
  agencies: [{ name: 'Commerce Department' }],
  document_number: '2026-12345',
  html_url: 'https://www.federalregister.gov/documents/2026/01/15/2026-12345/rule',
  pdf_url: 'https://www.govinfo.gov/content/pkg/FR-2026-01-15/pdf/2026-12345.pdf',
  publication_date: '2026-01-15',
  title: 'Export Controls on Advanced Computing Semiconductors',
  type: 'Rule',
};

const ingestionSource = {
  baseUrl: 'https://www.federalregister.gov/api/v1/documents.json',
  id: 'source-1',
  isActive: true,
  query: {
    agencies: ['commerce-department'],
    limit: 10,
    lookbackDays: 30,
    terms: ['semiconductor export controls'],
  },
};

describe('Federal Register ingestion', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockPrisma.ingestionSource.upsert.mockResolvedValue(ingestionSource);
    mockPrisma.ingestionRun.create.mockResolvedValue({ id: 'run-1' });
  });

  it('builds Federal Register document search URLs with policy query filters', () => {
    const url = buildFederalRegisterDocumentsUrl({
      agencies: ['commerce-department'],
      limit: 25,
      publicationDateGte: '2026-01-01',
      terms: ['semiconductor export controls', 'advanced computing items'],
    });

    expect(url.origin).toBe('https://www.federalregister.gov');
    expect(url.searchParams.get('conditions[term]')).toBe(
      'semiconductor export controls advanced computing items',
    );
    expect(url.searchParams.get('conditions[publication_date][gte]')).toBe('2026-01-01');
    expect(url.searchParams.getAll('conditions[agencies][]')).toEqual(['commerce-department']);
    expect(url.searchParams.get('per_page')).toBe('25');
  });

  it('clamps Federal Register API limits to a safe range', () => {
    expect(normalizeFederalRegisterLimit(0)).toBe(20);
    expect(normalizeFederalRegisterLimit(250)).toBe(100);
    expect(normalizeFederalRegisterLimit(3.8)).toBe(3);
  });

  it('supports dry runs without creating ingestion records', async () => {
    const fetchImpl: FetchLike = jest.fn(async () => ({
      json: async () => ({ results: [federalRegisterDocument] }),
      ok: true,
      status: 200,
    }));

    const result = await runFederalRegisterIngestion({ dryRun: true, fetchImpl });

    expect(result).toMatchObject({
      documentsCreated: 0,
      documentsFound: 1,
      documentsUpdated: 0,
      dryRun: true,
      runId: null,
      sourceId: 'federal-register-default-dry-run',
    });
    expect(mockPrisma.ingestionSource.upsert).not.toHaveBeenCalled();
    expect(mockPrisma.ingestionRun.create).not.toHaveBeenCalled();
    expect(mockPrisma.ingestionDocument.create).not.toHaveBeenCalled();
  });

  it('stores new Federal Register documents as ingestion candidates', async () => {
    const fetchImpl: FetchLike = jest.fn(async () => ({
      json: async () => ({ results: [federalRegisterDocument] }),
      ok: true,
      status: 200,
    }));
    mockPrisma.ingestionDocument.findUnique.mockResolvedValue(null);

    const result = await runFederalRegisterIngestion({
      fetchImpl,
      terms: ['advanced computing'],
    });

    expect(result).toMatchObject({
      documentsCreated: 1,
      documentsFound: 1,
      documentsUpdated: 0,
      dryRun: false,
      runId: 'run-1',
      sourceId: 'source-1',
    });
    expect(mockPrisma.ingestionDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          agencyNames: ['Commerce Department'],
          externalId: '2026-12345',
          matchedTerms: ['advanced computing'],
          sourceId: 'source-1',
          status: 'NEW',
          title: 'Export Controls on Advanced Computing Semiconductors',
        }),
      }),
    );
    expect(mockPrisma.ingestionRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentsCreated: 1,
          documentsFound: 1,
          documentsUpdated: 0,
          status: 'SUCCEEDED',
        }),
      }),
    );
  });

  it('updates existing ingestion candidates without resetting review status', async () => {
    const fetchImpl: FetchLike = jest.fn(async () => ({
      json: async () => ({ results: [federalRegisterDocument] }),
      ok: true,
      status: 200,
    }));
    mockPrisma.ingestionDocument.findUnique.mockResolvedValue({
      id: 'document-1',
      status: 'REVIEWED',
    });

    const result = await runFederalRegisterIngestion({ fetchImpl });

    expect(result.documentsCreated).toBe(0);
    expect(result.documentsUpdated).toBe(1);
    expect(mockPrisma.ingestionDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ status: expect.any(String) }),
        where: { id: 'document-1' },
      }),
    );
  });
});
