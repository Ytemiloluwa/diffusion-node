import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PolicyStatus, Role } from '@prisma/client';
import request from 'supertest';

type AsyncMock<TResult> = (args?: unknown) => Promise<TResult>;

const mockPrisma = {
  company: {
    findMany: jest.fn<AsyncMock<unknown[]>>(),
  },
  country: {
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
});
