import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { IngestionDocumentStatus, IngestionRunStatus, IngestionSourceType, PolicyStatus, Role } from '@prisma/client';
import request from 'supertest';

type AsyncMock<TResult> = (args?: unknown) => Promise<TResult>;

const mockPrisma = {
  apiKey: {
    create: jest.fn<AsyncMock<unknown>>(),
    findFirst: jest.fn<AsyncMock<unknown | null>>(),
    update: jest.fn<AsyncMock<unknown>>(),
  },
  company: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  country: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  ingestionDocument: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
    findUnique: jest.fn<AsyncMock<unknown | null>>(),
    update: jest.fn<AsyncMock<unknown>>(),
  },
  ingestionRun: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  ingestionSource: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  policy: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
    findUnique: jest.fn<AsyncMock<unknown | null>>(),
  },
  policySource: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  policyRevision: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  restrictionType: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  technology: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  technologyCategory: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  timelineEvent: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  user: {
    findUnique: jest.fn<AsyncMock<unknown | null>>(),
  },
};

jest.mock('../src/db/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const { createApp } = require('../src/app');
const { signAccessToken } = require('../src/utils/jwt');

describe('API app', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('serves a health check', async () => {
    await request(createApp()).get('/health').expect(200).expect({ status: 'ok' });
  });

  it('serves Swagger UI documentation', async () => {
    const response = await request(createApp()).get('/docs/').expect(200);

    expect(response.text).toContain('Swagger UI');
  });

  it('validates policy list query params', async () => {
    await request(createApp()).get('/api/v1/policies?limit=0').expect(400);
  });

  it('lists policies with cursor pagination metadata', async () => {
    mockPrisma.policy.findMany.mockResolvedValue([
      { id: 'a', title: 'Policy A' },
      { id: 'b', title: 'Policy B' },
    ]);

    const response = await request(createApp()).get('/api/v1/policies?limit=1').expect(200);

    expect(response.body).toMatchObject({
      data: [{ id: 'a', title: 'Policy A' }],
      pageInfo: {
        hasNextPage: true,
        limit: 1,
        nextCursor: 'a',
      },
    });
  });

  it('fetches policy detail with relations', async () => {
    const policyId = '00000000-0000-4000-8000-000000000001';
    mockPrisma.policy.findUnique.mockResolvedValue({
      companies: [],
      documents: [{ documentType: 'Federal Register PDF', id: 'doc-1', title: 'Rule PDF' }],
      effectiveDate: new Date('2026-01-15T00:00:00.000Z'),
      id: policyId,
      jurisdictions: [
        {
          country: { isoCode: 'CHN', name: 'China' },
          id: 'jurisdiction-1',
          restrictionType: { name: 'Case-by-Case Review' },
        },
      ],
      revisions: [],
      sources: [{ id: 'source-1', sourceName: 'BIS Federal Register' }],
      status: PolicyStatus.ACTIVE,
      technologies: [],
      timelineEvents: [],
      title: 'Revision to License Review Policy',
    });

    const response = await request(createApp()).get(`/api/v1/policies/${policyId}`).expect(200);

    expect(response.body).toMatchObject({
      data: {
        id: policyId,
        jurisdictions: [
          {
            country: { isoCode: 'CHN', name: 'China' },
            restrictionType: { name: 'Case-by-Case Review' },
          },
        ],
        sources: [{ sourceName: 'BIS Federal Register' }],
        title: 'Revision to License Review Policy',
      },
    });
  });

  it('returns 404 for missing policy detail', async () => {
    mockPrisma.policy.findUnique.mockResolvedValue(null);

    await request(createApp())
      .get('/api/v1/policies/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });

  it('fetches a policy timeline with revisions and sourced events in date order', async () => {
    const policyId = '00000000-0000-4000-8000-000000000002';
    mockPrisma.policy.findUnique.mockResolvedValue({ id: policyId });
    mockPrisma.policyRevision.findMany.mockResolvedValue([
      {
        changeSummary: 'Rule moved from draft to active.',
        id: 'revision-1',
        newStatus: PolicyStatus.ACTIVE,
        previousStatus: PolicyStatus.DRAFT,
        revisionDate: new Date('2026-01-15T00:00:00.000Z'),
      },
    ]);
    mockPrisma.timelineEvent.findMany.mockResolvedValue([
      {
        description: 'GAO reviewed the rule status.',
        eventDate: new Date('2026-05-12T00:00:00.000Z'),
        eventType: 'Legal Challenge',
        id: 'event-1',
        sourceName: 'U.S. Government Accountability Office',
        sourceUrl: 'https://www.gao.gov/products/b-337935',
      },
    ]);

    const response = await request(createApp())
      .get(`/api/v1/policies/${policyId}/timeline`)
      .expect(200);

    expect(response.body.data).toMatchObject([
      {
        changeSummary: 'Rule moved from draft to active.',
        id: 'revision-1',
        newStatus: PolicyStatus.ACTIVE,
        previousStatus: PolicyStatus.DRAFT,
        type: 'revision',
      },
      {
        eventType: 'Legal Challenge',
        id: 'event-1',
        sourceName: 'U.S. Government Accountability Office',
        sourceUrl: 'https://www.gao.gov/products/b-337935',
        type: 'event',
      },
    ]);
  });

  it('lists the global timeline with cursor pagination metadata', async () => {
    mockPrisma.timelineEvent.findMany.mockResolvedValue([
      {
        eventDate: new Date('2026-05-12T00:00:00.000Z'),
        eventType: 'Legal Challenge',
        id: 'event-1',
        policy: { id: 'policy-1', status: PolicyStatus.CONTESTED, title: 'AI Diffusion' },
      },
      {
        eventDate: new Date('2026-01-15T00:00:00.000Z'),
        eventType: 'License Policy Revision',
        id: 'event-2',
        policy: { id: 'policy-2', status: PolicyStatus.ACTIVE, title: 'License Revision' },
      },
    ]);

    const response = await request(createApp()).get('/api/v1/timeline?limit=1').expect(200);

    expect(response.body).toMatchObject({
      data: [{ eventType: 'Legal Challenge', id: 'event-1' }],
      pageInfo: {
        hasNextPage: true,
        limit: 1,
        nextCursor: 'event-1',
      },
    });
  });

  it('lists technology categories', async () => {
    mockPrisma.technologyCategory.findMany.mockResolvedValue([
      {
        _count: { technologies: 5 },
        id: 'category-1',
        isActiveInV1: true,
        name: 'Artificial Intelligence',
      },
    ]);

    const response = await request(createApp()).get('/api/v1/categories').expect(200);

    expect(response.body).toMatchObject({
      data: [{ isActiveInV1: true, name: 'Artificial Intelligence' }],
    });
  });

  it('lists technologies filtered by category with pagination', async () => {
    mockPrisma.technology.findMany.mockResolvedValue([
      {
        category: { name: 'Artificial Intelligence' },
        id: 'technology-1',
        name: 'AI Accelerators',
      },
      { category: { name: 'Artificial Intelligence' }, id: 'technology-2', name: 'Model Weights' },
    ]);

    const response = await request(createApp())
      .get('/api/v1/technologies?category=Artificial%20Intelligence&limit=1')
      .expect(200);

    expect(mockPrisma.technology.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        where: { category: { name: { contains: 'Artificial Intelligence' } } },
      }),
    );
    expect(response.body.pageInfo).toMatchObject({
      hasNextPage: true,
      limit: 1,
      nextCursor: 'technology-1',
    });
  });

  it('validates technology query params', async () => {
    await request(createApp()).get('/api/v1/technologies?limit=0').expect(400);
  });

  it('lists companies filtered by country and entity-list status', async () => {
    mockPrisma.company.findMany.mockResolvedValue([
      {
        entityListStatus: 'Entity List',
        hqCountry: { isoCode: 'CHN', name: 'China' },
        id: 'company-1',
        name: 'Biren Technology',
      },
    ]);

    const response = await request(createApp())
      .get('/api/v1/companies?country=China&entityListStatus=Entity%20List')
      .expect(200);

    expect(mockPrisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          entityListStatus: { contains: 'Entity List' },
          hqCountry: {
            OR: [{ name: { contains: 'China' } }, { isoCode: { contains: 'China' } }],
          },
        }),
      }),
    );
    expect(response.body.data).toMatchObject([{ name: 'Biren Technology' }]);
  });

  it('validates company query params', async () => {
    await request(createApp()).get('/api/v1/companies?cursor=not-a-uuid').expect(400);
  });

  it('lists countries with restriction summaries', async () => {
    mockPrisma.country.findMany.mockResolvedValue([
      {
        id: 'country-1',
        isoCode: 'CHN',
        jurisdictions: [
          { restrictionType: { name: 'Entity List Addition' } },
          { restrictionType: { name: 'Entity List Addition' } },
          { restrictionType: { name: 'Foreign Direct Product Rule' } },
        ],
        name: 'China',
      },
    ]);

    const response = await request(createApp()).get('/api/v1/countries').expect(200);

    expect(response.body.data).toMatchObject([
      {
        isoCode: 'CHN',
        restrictionSummary: {
          'Entity List Addition': 2,
          'Foreign Direct Product Rule': 1,
        },
      },
    ]);
  });

  it('lists restriction types and sources', async () => {
    mockPrisma.restrictionType.findMany.mockResolvedValue([
      { id: 'restriction-1', name: 'Entity List Addition' },
    ]);
    mockPrisma.policySource.findMany.mockResolvedValue([{ sourceName: 'BIS Federal Register' }]);

    await request(createApp())
      .get('/api/v1/restrictions')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject([{ name: 'Entity List Addition' }]);
      });

    await request(createApp())
      .get('/api/v1/sources')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject([{ sourceName: 'BIS Federal Register' }]);
      });
  });

  it('returns the authenticated user profile and active API keys', async () => {
    const userId = '00000000-0000-4000-8000-000000000003';
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: userId,
      role: Role.DEVELOPER,
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      apiKeys: [{ id: 'api-key-1', label: 'Local dev', revokedAt: null }],
      email: 'developer@example.com',
      id: userId,
      role: Role.DEVELOPER,
    });

    const response = await request(createApp())
      .get('/api/v1/me')
      .set('authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: userId },
      }),
    );
    expect(response.body).toMatchObject({
      data: {
        apiKeys: [{ label: 'Local dev' }],
        email: 'developer@example.com',
        id: userId,
      },
    });
  });

  it('rejects missing authentication for the user profile route', async () => {
    await request(createApp()).get('/api/v1/me').expect(401);
  });

  it('returns 404 when the authenticated profile no longer exists', async () => {
    const accessToken = signAccessToken({
      email: 'deleted@example.com',
      id: '00000000-0000-4000-8000-000000000004',
      role: Role.DEVELOPER,
    });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await request(createApp())
      .get('/api/v1/me')
      .set('authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('rejects missing authentication for ingestion review routes', async () => {
    await request(createApp()).get('/api/v1/ingestion/documents').expect(401);
  });

  it('lists ingestion sources for authenticated reviewers', async () => {
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: '00000000-0000-4000-8000-000000000012',
      role: Role.DEVELOPER,
    });
    mockPrisma.ingestionSource.findMany.mockResolvedValue([
      {
        _count: { documents: 3, runs: 2 },
        id: 'source-1',
        name: 'Federal Register monitor',
        sourceType: IngestionSourceType.FEDERAL_REGISTER_API,
      },
    ]);

    const response = await request(createApp())
      .get('/api/v1/ingestion/sources?sourceType=FEDERAL_REGISTER_API')
      .set('authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(mockPrisma.ingestionSource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sourceType: IngestionSourceType.FEDERAL_REGISTER_API },
      }),
    );
    expect(response.body.data).toMatchObject([{ name: 'Federal Register monitor' }]);
  });

  it('lists ingestion runs with pagination metadata', async () => {
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: '00000000-0000-4000-8000-000000000013',
      role: Role.DEVELOPER,
    });
    mockPrisma.ingestionRun.findMany.mockResolvedValue([
      {
        documentsFound: 2,
        id: 'run-1',
        source: { id: 'source-1', name: 'Federal Register monitor' },
        status: IngestionRunStatus.SUCCEEDED,
      },
      {
        documentsFound: 1,
        id: 'run-2',
        source: { id: 'source-1', name: 'Federal Register monitor' },
        status: IngestionRunStatus.FAILED,
      },
    ]);

    const response = await request(createApp())
      .get('/api/v1/ingestion/runs?status=SUCCEEDED&limit=1')
      .set('authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(mockPrisma.ingestionRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        where: { status: IngestionRunStatus.SUCCEEDED },
      }),
    );
    expect(response.body).toMatchObject({
      data: [{ id: 'run-1', status: IngestionRunStatus.SUCCEEDED }],
      pageInfo: {
        hasNextPage: true,
        limit: 1,
        nextCursor: 'run-1',
      },
    });
  });

  it('lists ingestion document candidates with review filters', async () => {
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: '00000000-0000-4000-8000-000000000014',
      role: Role.DEVELOPER,
    });
    const sourceId = '00000000-0000-4000-8000-000000000015';
    mockPrisma.ingestionDocument.findMany.mockResolvedValue([
      {
        externalId: '2026-12345',
        id: 'document-1',
        matchedCategoryNames: ['Artificial Intelligence and Advanced Computing'],
        matchedTechnologyNames: ['AI Training Accelerators (ECCN 3A090)'],
        source: { id: sourceId, name: 'Federal Register monitor' },
        status: IngestionDocumentStatus.NEW,
        title: 'Export Controls on Advanced Computing Semiconductors',
      },
    ]);

    const response = await request(createApp())
      .get(`/api/v1/ingestion/documents?status=NEW&sourceId=${sourceId}&q=advanced&limit=10`)
      .set('authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(mockPrisma.ingestionDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 11,
        where: expect.objectContaining({
          sourceId,
          status: IngestionDocumentStatus.NEW,
        }),
      }),
    );
    expect(response.body.data).toMatchObject([
      {
        matchedCategoryNames: ['Artificial Intelligence and Advanced Computing'],
        status: IngestionDocumentStatus.NEW,
      },
    ]);
  });

  it('fetches one ingestion document with its raw source payload', async () => {
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: '00000000-0000-4000-8000-000000000018',
      role: Role.DEVELOPER,
    });
    const documentId = '00000000-0000-4000-8000-000000000019';
    mockPrisma.ingestionDocument.findUnique.mockResolvedValue({
      externalId: '2026-12345',
      id: documentId,
      rawPayload: { document_number: '2026-12345' },
      source: { id: 'source-1', name: 'Federal Register monitor' },
      status: IngestionDocumentStatus.REVIEWED,
      title: 'Export Controls on Advanced Computing Semiconductors',
    });

    const response = await request(createApp())
      .get(`/api/v1/ingestion/documents/${documentId}`)
      .set('authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(mockPrisma.ingestionDocument.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: documentId },
      }),
    );
    expect(response.body.data).toMatchObject({
      rawPayload: { document_number: '2026-12345' },
      status: IngestionDocumentStatus.REVIEWED,
    });
  });

  it('updates ingestion document review status without allowing imported status', async () => {
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: '00000000-0000-4000-8000-000000000016',
      role: Role.DEVELOPER,
    });
    const documentId = '00000000-0000-4000-8000-000000000017';
    mockPrisma.ingestionDocument.findUnique.mockResolvedValue({
      id: documentId,
      status: IngestionDocumentStatus.NEW,
    });
    mockPrisma.ingestionDocument.update.mockResolvedValue({
      id: documentId,
      status: IngestionDocumentStatus.SKIPPED,
    });

    const response = await request(createApp())
      .patch(`/api/v1/ingestion/documents/${documentId}/status`)
      .set('authorization', `Bearer ${accessToken}`)
      .send({ status: IngestionDocumentStatus.SKIPPED })
      .expect(200);

    expect(mockPrisma.ingestionDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: IngestionDocumentStatus.SKIPPED },
        where: { id: documentId },
      }),
    );
    expect(response.body.data).toMatchObject({ status: IngestionDocumentStatus.SKIPPED });

    await request(createApp())
      .patch(`/api/v1/ingestion/documents/${documentId}/status`)
      .set('authorization', `Bearer ${accessToken}`)
      .send({ status: IngestionDocumentStatus.IMPORTED })
      .expect(400);
  });

  it('creates a new API key for the authenticated user and returns the raw key once', async () => {
    const userId = '00000000-0000-4000-8000-000000000005';
    const apiKeyId = '00000000-0000-4000-8000-000000000006';
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: userId,
      role: Role.DEVELOPER,
    });
    mockPrisma.apiKey.create.mockImplementation(async (args?: unknown) => {
      const { data } = args as {
        data: {
          key: string;
          label: string;
          userId: string;
        };
      };

      return {
        createdAt: new Date('2026-08-14T00:00:00.000Z'),
        id: apiKeyId,
        key: data.key,
        label: data.label,
        lastUsedAt: null,
        revokedAt: null,
        userId: data.userId,
      };
    });

    const response = await request(createApp())
      .post('/api/v1/api-keys')
      .set('authorization', `Bearer ${accessToken}`)
      .send({ label: 'Reviewer demo key' })
      .expect(201);
    const createCall = mockPrisma.apiKey.create.mock.calls[0][0] as {
      data: {
        key: string;
        label: string;
        userId: string;
      };
    };

    expect(response.body.data).toMatchObject({
      createdAt: '2026-08-14T00:00:00.000Z',
      id: apiKeyId,
      key: expect.stringMatching(/^dn_/),
      label: 'Reviewer demo key',
    });
    expect(createCall.data).toMatchObject({
      label: 'Reviewer demo key',
      userId,
    });
    expect(createCall.data.key).not.toBe(response.body.data.key);
  });

  it('validates API key labels before creation', async () => {
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: '00000000-0000-4000-8000-000000000007',
      role: Role.DEVELOPER,
    });

    await request(createApp())
      .post('/api/v1/api-keys')
      .set('authorization', `Bearer ${accessToken}`)
      .send({ label: '   ' })
      .expect(400);

    expect(mockPrisma.apiKey.create).not.toHaveBeenCalled();
  });

  it('revokes an authenticated user API key without exposing other users keys', async () => {
    const userId = '00000000-0000-4000-8000-000000000008';
    const apiKeyId = '00000000-0000-4000-8000-000000000009';
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: userId,
      role: Role.DEVELOPER,
    });
    mockPrisma.apiKey.findFirst.mockResolvedValue({
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      id: apiKeyId,
      key: 'stored-hash',
      label: 'Reviewer demo key',
      lastUsedAt: null,
      revokedAt: null,
      userId,
    });
    mockPrisma.apiKey.update.mockImplementation(async (args?: unknown) => {
      const { data } = args as { data: { revokedAt: Date } };

      return {
        createdAt: new Date('2026-08-01T00:00:00.000Z'),
        id: apiKeyId,
        key: 'stored-hash',
        label: 'Reviewer demo key',
        lastUsedAt: null,
        revokedAt: data.revokedAt,
        userId,
      };
    });

    const response = await request(createApp())
      .post(`/api/v1/api-keys/${apiKeyId}/revoke`)
      .set('authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(mockPrisma.apiKey.findFirst).toHaveBeenCalledWith({
      where: {
        id: apiKeyId,
        revokedAt: null,
        userId,
      },
    });
    expect(mockPrisma.apiKey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          revokedAt: expect.any(Date),
        },
        where: { id: apiKeyId },
      }),
    );
    expect(response.body.data).toMatchObject({
      id: apiKeyId,
      label: 'Reviewer demo key',
      lastUsedAt: null,
      revokedAt: expect.any(String),
    });
    expect(response.body.data).not.toHaveProperty('key');
  });

  it('returns 404 when revoking a missing or already revoked API key', async () => {
    const accessToken = signAccessToken({
      email: 'developer@example.com',
      id: '00000000-0000-4000-8000-000000000010',
      role: Role.DEVELOPER,
    });
    mockPrisma.apiKey.findFirst.mockResolvedValue(null);

    await request(createApp())
      .post('/api/v1/api-keys/00000000-0000-4000-8000-000000000011/revoke')
      .set('authorization', `Bearer ${accessToken}`)
      .expect(404)
      .expect(({ body }) => {
        expect(body.error.code).toBe('API_KEY_NOT_FOUND');
      });

    expect(mockPrisma.apiKey.update).not.toHaveBeenCalled();
  });
});
