import 'dotenv/config';

export interface AppEnv {
  corsOrigin: string;
  databaseUrl: string;
  jwtRefreshSecret: string;
  jwtSecret: string;
  nodeEnv: string;
  port: number;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

type EnvSource = Record<string, string | undefined>;

const readValue = (source: EnvSource, key: string): string | undefined => {
  const value = source[key]?.trim();
  return value ? value : undefined;
};

const requireProductionValue = (
  source: EnvSource,
  key: string,
  nodeEnv: string,
): string | undefined => {
  const value = readValue(source, key);

  if (nodeEnv === 'production' && !value) {
    throw new Error(`${key} is required when NODE_ENV=production.`);
  }

  return value;
};

const toNumber = (
  source: EnvSource,
  key: string,
  fallback: number,
  nodeEnv: string,
): number => {
  const value = readValue(source, key);

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  if (nodeEnv === 'production') {
    throw new Error(`${key} must be a positive number when NODE_ENV=production.`);
  }

  return fallback;
};

export const loadEnv = (source: EnvSource = process.env): AppEnv => {
  const nodeEnv = readValue(source, 'NODE_ENV') || 'development';
  const corsOrigin = requireProductionValue(source, 'CORS_ORIGIN', nodeEnv) || '*';

  if (nodeEnv === 'production' && corsOrigin === '*') {
    throw new Error('CORS_ORIGIN must be an explicit origin when NODE_ENV=production.');
  }

  return {
    corsOrigin,
    databaseUrl: requireProductionValue(source, 'DATABASE_URL', nodeEnv) || '',
    jwtRefreshSecret:
      requireProductionValue(source, 'JWT_REFRESH_SECRET', nodeEnv) || 'dev-refresh-secret',
    jwtSecret: requireProductionValue(source, 'JWT_SECRET', nodeEnv) || 'dev-access-secret',
    nodeEnv,
    port: toNumber(source, 'PORT', 3001, nodeEnv),
    rateLimitMax: toNumber(source, 'RATE_LIMIT_MAX', 100, nodeEnv),
    rateLimitWindowMs: toNumber(source, 'RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000, nodeEnv),
  };
};

export const env = loadEnv();
