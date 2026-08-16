import { describe, expect, it } from '@jest/globals';

import { env, loadEnv } from '../src/config/env';

describe('test environment setup', () => {
  it('loads test env defaults before application modules import env config', () => {
    expect(env.jwtRefreshSecret).toBe('test-refresh-secret');
    expect(env.jwtSecret).toBe('test-access-secret');
    expect(env.port).toBe(3001);
    expect(env.rateLimitMax).toBe(1000);
    expect(env.rateLimitWindowMs).toBe(60000);
  });

  it('keeps development defaults ergonomic for local setup', () => {
    expect(loadEnv({ NODE_ENV: 'development' })).toMatchObject({
      corsOrigin: '*',
      databaseUrl: '',
      jwtRefreshSecret: 'dev-refresh-secret',
      jwtSecret: 'dev-access-secret',
      nodeEnv: 'development',
      port: 3001,
      rateLimitMax: 100,
      rateLimitWindowMs: 900000,
    });
  });

  it('requires production secrets and database configuration', () => {
    expect(() => loadEnv({ NODE_ENV: 'production' })).toThrow(
      'CORS_ORIGIN is required when NODE_ENV=production.',
    );

    expect(() =>
      loadEnv({
        CORS_ORIGIN: 'https://diffusion-node.vercel.app',
        DATABASE_URL: 'postgresql://example',
        JWT_SECRET: 'access-secret',
        NODE_ENV: 'production',
      }),
    ).toThrow('JWT_REFRESH_SECRET is required when NODE_ENV=production.');
  });

  it('rejects wildcard CORS and invalid numbers in production', () => {
    const productionEnv = {
      CORS_ORIGIN: '*',
      DATABASE_URL: 'postgresql://example',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_SECRET: 'access-secret',
      NODE_ENV: 'production',
    };

    expect(() => loadEnv(productionEnv)).toThrow(
      'CORS_ORIGIN must be an explicit origin when NODE_ENV=production.',
    );

    expect(() =>
      loadEnv({
        ...productionEnv,
        CORS_ORIGIN: 'https://diffusion-node.vercel.app',
        RATE_LIMIT_MAX: 'not-a-number',
      }),
    ).toThrow('RATE_LIMIT_MAX must be a positive number when NODE_ENV=production.');
  });

  it('loads explicit production configuration', () => {
    expect(
      loadEnv({
        CORS_ORIGIN: 'https://diffusion-node.vercel.app',
        DATABASE_URL: 'postgresql://example',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_SECRET: 'access-secret',
        NODE_ENV: 'production',
        PORT: '8080',
        RATE_LIMIT_MAX: '250',
        RATE_LIMIT_WINDOW_MS: '120000',
      }),
    ).toEqual({
      corsOrigin: 'https://diffusion-node.vercel.app',
      databaseUrl: 'postgresql://example',
      jwtRefreshSecret: 'refresh-secret',
      jwtSecret: 'access-secret',
      nodeEnv: 'production',
      port: 8080,
      rateLimitMax: 250,
      rateLimitWindowMs: 120000,
    });
  });
});
