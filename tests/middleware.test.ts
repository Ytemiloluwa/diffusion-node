import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Role } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import { hashApiKey } from '../src/utils/apiKeys';

type AsyncMock<TResult> = (args?: unknown) => Promise<TResult>;

const mockPrisma = {
  apiKey: {
    findFirst: jest.fn<AsyncMock<unknown | null>>(),
    update: jest.fn<AsyncMock<unknown>>(),
  },
};

jest.mock('../src/db/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const { authenticateApiKey } = require('../src/middleware/auth');
const { errorHandler } = require('../src/middleware/errorHandler');

const createApiKeyApp = () => {
  const app = express();
  app.get('/protected', authenticateApiKey, (req, res) => {
    res.status(200).json({ user: req.user });
  });
  app.use(errorHandler);
  return app;
};

describe('auth middleware', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('rejects requests without an API key header', async () => {
    const response = await request(createApiKeyApp()).get('/protected').expect(401);

    expect(response.body).toMatchObject({
      error: {
        code: 'MISSING_API_KEY',
      },
    });
  });

  it('rejects invalid API keys', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue(null);

    const response = await request(createApiKeyApp())
      .get('/protected')
      .set('x-api-key', 'dn_invalid')
      .expect(401);

    expect(response.body).toMatchObject({
      error: {
        code: 'INVALID_API_KEY',
      },
    });
  });

  it('accepts valid API keys and updates last-used time', async () => {
    const rawApiKey = 'dn_valid_key';
    mockPrisma.apiKey.findFirst.mockResolvedValue({
      id: 'api-key-1',
      user: {
        email: 'developer@example.com',
        role: Role.DEVELOPER,
      },
      userId: 'user-1',
    });
    mockPrisma.apiKey.update.mockResolvedValue({ id: 'api-key-1' });

    const response = await request(createApiKeyApp())
      .get('/protected')
      .set('x-api-key', rawApiKey)
      .expect(200);

    expect(mockPrisma.apiKey.findFirst).toHaveBeenCalledWith({
      include: {
        user: true,
      },
      where: {
        key: hashApiKey(rawApiKey),
        revokedAt: null,
      },
    });
    expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
      data: {
        lastUsedAt: expect.any(Date),
      },
      where: {
        id: 'api-key-1',
      },
    });
    expect(response.body).toMatchObject({
      user: {
        email: 'developer@example.com',
        id: 'user-1',
        role: Role.DEVELOPER,
      },
    });
  });
});

describe('rate limiter middleware', () => {
  it('rejects requests after the configured limit is exceeded', async () => {
    jest.resetModules();
    jest.doMock('../src/config/env', () => ({
      env: {
        nodeEnv: 'test',
        rateLimitMax: 1,
        rateLimitWindowMs: 60_000,
      },
    }));

    const { rateLimiter } = require('../src/middleware/rateLimiter');
    const app = express();
    app.use(rateLimiter);
    app.get('/limited', (_req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    await request(app).get('/limited').expect(200);
    const response = await request(app).get('/limited').expect(429);

    expect(response.body).toMatchObject({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    });

    jest.dontMock('../src/config/env');
    jest.resetModules();
  });
});
