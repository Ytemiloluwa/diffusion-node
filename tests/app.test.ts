import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';

const mockPrisma = {
  policy: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  policyRevision: {
    findMany: jest.fn(),
  },
  timelineEvent: {
    findMany: jest.fn(),
  },
};

jest.mock('../src/db/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const { createApp } = require('../src/app');

describe('API app', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('serves a health check', async () => {
    await request(createApp()).get('/health').expect(200).expect({ status: 'ok' });
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

  it('returns 404 for missing policy detail', async () => {
    mockPrisma.policy.findUnique.mockResolvedValue(null);

    await request(createApp())
      .get('/api/v1/policies/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });
});
