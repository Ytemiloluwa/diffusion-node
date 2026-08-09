import axios, { type AxiosError } from 'axios';
import type { ApiErrorResponse, ApiResponse, CursorPage } from './types';

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

let accessToken: string | null = null;

export class ApiClientError extends Error {
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly status?: number;

  constructor(message: string, options: { code?: string; details?: unknown; status?: number } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}

export const API_BASE_URL_ENV_VAR = 'NEXT_PUBLIC_API_BASE_URL';

export const getApiBaseUrl = (): string => {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    throw new ApiClientError(
      `${API_BASE_URL_ENV_VAR} is required. Set it in the root .env file or the deployment environment.`,
      { code: 'MISSING_API_BASE_URL' },
    );
  }

  return normalizeBaseUrl(value);
};

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== 'object' || !('error' in value)) {
    return false;
  }

  const error = (value as { error?: unknown }).error;
  return Boolean(
    error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string',
  );
};

const toApiClientError = (error: AxiosError<unknown>): ApiClientError => {
  const status = error.response?.status;
  const payload = error.response?.data;

  if (isApiErrorResponse(payload)) {
    return new ApiClientError(payload.error.message, {
      code: payload.error.code,
      details: payload.error.details,
      status,
    });
  }

  return new ApiClientError(error.message || 'API request failed.', { status });
};

export const setApiAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getApiAccessToken = (): string | null => accessToken;

export const apiClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => Promise.reject(toApiClientError(error)),
);

export const getData = async <T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> => {
  const response = await request;
  return response.data.data;
};

export const getPage = async <T>(request: Promise<{ data: CursorPage<T> }>): Promise<CursorPage<T>> => {
  const response = await request;
  return response.data;
};

export const cleanParams = <T extends Record<string, unknown>>(params?: T): Partial<T> | undefined => {
  if (!params) {
    return undefined;
  }

  const entries = Object.entries(params).filter(([, value]) => {
    if (value === null || value === undefined) {
      return false;
    }

    return !(typeof value === 'string' && value.trim() === '');
  });

  return Object.fromEntries(entries) as Partial<T>;
};
