import type { ApiKeySummary } from '@/lib/api';

export const getApiDocsUrl = (apiBaseUrl: string): string => {
  const baseWithoutVersion = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

  return `${baseWithoutVersion}/docs`;
};

export const maskApiKeySummary = (apiKey: ApiKeySummary): string => {
  const suffix = apiKey.id.replaceAll('-', '').slice(-8).toUpperCase();

  return `Stored as hash (${suffix})`;
};
