import { apiClient, getData } from './http';
import type { AuthTokenResponse, RefreshTokenResponse, Role, User } from './types';

export type RegisterUserPayload = {
  email: string;
  password: string;
  role?: Role;
};

export type IssueTokenPayload = {
  email: string;
  label?: string;
  password: string;
};

export type RefreshAccessTokenPayload = {
  refreshToken: string;
};

export const registerUser = (payload: RegisterUserPayload): Promise<User> =>
  getData(apiClient.post('/auth/register', payload));

export const issueToken = (payload: IssueTokenPayload): Promise<AuthTokenResponse> =>
  getData(apiClient.post('/auth/token', payload));

export const refreshAccessToken = (
  payload: RefreshAccessTokenPayload,
): Promise<RefreshTokenResponse> => getData(apiClient.post('/auth/refresh', payload));
