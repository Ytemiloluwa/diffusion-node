'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  ApiClientError,
  createApiKey,
  type CreateApiKeyPayload,
  getCurrentUser,
  issueToken,
  refreshAccessToken,
  registerUser,
  revokeApiKey,
  setApiAccessToken,
  setApiUnauthorizedHandler,
  type ApiKeyCredential,
  type ApiKeySummary,
  type AuthTokenResponse,
  type IssueTokenPayload,
  type RefreshTokenResponse,
  type RegisterUserPayload,
  type User,
  type UserProfile,
} from '@/lib/api';

type AuthStatus = 'authenticated' | 'idle' | 'loading' | 'unauthenticated';

type StoreError = {
  code?: string;
  message: string;
  status?: number;
};

type PersistedAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
};

export type AuthStore = PersistedAuthState & {
  clearError: () => void;
  createApiKey: (payload: CreateApiKeyPayload) => Promise<ApiKeyCredential>;
  error: StoreError | null;
  isAuthenticated: boolean;
  lastIssuedApiKey: ApiKeyCredential | null;
  loadProfile: () => Promise<UserProfile | null>;
  login: (payload: IssueTokenPayload) => Promise<AuthTokenResponse>;
  logout: () => void;
  refreshSession: () => Promise<RefreshTokenResponse | null>;
  register: (payload: RegisterUserPayload) => Promise<User>;
  revokeApiKey: (apiKeyId: string) => Promise<ApiKeySummary>;
  status: AuthStatus;
};

const emptyAuthState: PersistedAuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const toStoreError = (error: unknown): StoreError => {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unexpected authentication error occurred.' };
};

const syncAccessToken = (token: string | null): void => {
  setApiAccessToken(token);
};

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore, [], [], PersistedAuthState>(
    (set, get) => ({
      ...emptyAuthState,
      clearError: () => set({ error: null }),
      createApiKey: async (payload) => {
        const { accessToken } = get();

        if (!accessToken) {
          get().logout();
          throw new ApiClientError('Authentication is required.', {
            code: 'UNAUTHENTICATED',
            status: 401,
          });
        }

        syncAccessToken(accessToken);
        set({ error: null });

        try {
          const apiKey = await createApiKey(payload);
          set({ error: null, lastIssuedApiKey: apiKey });
          return apiKey;
        } catch (error) {
          set({ error: toStoreError(error) });
          throw error;
        }
      },
      error: null,
      isAuthenticated: false,
      lastIssuedApiKey: null,
      loadProfile: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          set({
            ...emptyAuthState,
            error: null,
            isAuthenticated: false,
            lastIssuedApiKey: null,
            status: 'unauthenticated',
          });
          syncAccessToken(null);
          return null;
        }

        syncAccessToken(accessToken);
        set({ error: null, status: 'loading' });

        try {
          const profile = await getCurrentUser();
          set({
            error: null,
            isAuthenticated: true,
            status: 'authenticated',
            user: {
              createdAt: profile.createdAt,
              email: profile.email,
              id: profile.id,
              role: profile.role,
            },
          });
          return profile;
        } catch (error) {
          set({
            error: toStoreError(error),
            isAuthenticated: false,
            status: 'unauthenticated',
          });
          throw error;
        }
      },
      login: async (payload) => {
        set({ error: null, status: 'loading' });

        try {
          const response = await issueToken(payload);
          syncAccessToken(response.accessToken);
          set({
            accessToken: response.accessToken,
            error: null,
            isAuthenticated: true,
            lastIssuedApiKey: null,
            refreshToken: response.refreshToken,
            status: 'authenticated',
            user: response.user,
          });
          return response;
        } catch (error) {
          set({
            error: toStoreError(error),
            isAuthenticated: false,
            lastIssuedApiKey: null,
            status: 'unauthenticated',
          });
          throw error;
        }
      },
      logout: () => {
        syncAccessToken(null);
        set({
          ...emptyAuthState,
          error: null,
          isAuthenticated: false,
          lastIssuedApiKey: null,
          status: 'unauthenticated',
        });
      },
      refreshSession: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          get().logout();
          return null;
        }

        set({ error: null, status: 'loading' });

        try {
          const response = await refreshAccessToken({ refreshToken });
          syncAccessToken(response.accessToken);
          set({
            accessToken: response.accessToken,
            error: null,
            isAuthenticated: true,
            status: 'authenticated',
          });
          return response;
        } catch (error) {
          get().logout();
          set({ error: toStoreError(error) });
          throw error;
        }
      },
      register: async (payload) => {
        set({ error: null, status: 'loading' });

        try {
          const user = await registerUser(payload);
          set({ error: null, status: get().isAuthenticated ? 'authenticated' : 'unauthenticated' });
          return user;
        } catch (error) {
          set({
            error: toStoreError(error),
            status: get().isAuthenticated ? 'authenticated' : 'unauthenticated',
          });
          throw error;
        }
      },
      revokeApiKey: async (apiKeyId) => {
        const { accessToken } = get();

        if (!accessToken) {
          get().logout();
          throw new ApiClientError('Authentication is required.', {
            code: 'UNAUTHENTICATED',
            status: 401,
          });
        }

        syncAccessToken(accessToken);
        set({ error: null });

        try {
          const apiKey = await revokeApiKey(apiKeyId);
          set((state) => ({
            error: null,
            lastIssuedApiKey:
              state.lastIssuedApiKey?.id === apiKeyId ? null : state.lastIssuedApiKey,
          }));
          return apiKey;
        } catch (error) {
          set({ error: toStoreError(error) });
          throw error;
        }
      },
      status: 'idle',
    }),
    {
      name: 'diffusion-node.auth',
      onRehydrateStorage: () => (state) => {
        const accessToken = state?.accessToken ?? null;
        syncAccessToken(accessToken);

        if (accessToken && state) {
          state.isAuthenticated = true;
          state.status = 'authenticated';
        }
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      storage: createJSONStorage<PersistedAuthState>(() => window.localStorage),
    },
  ),
);

setApiUnauthorizedHandler(() => {
  const state = useAuthStore.getState();

  if (!state.accessToken) {
    return;
  }

  state.logout();

  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    window.location.replace(new URL('/auth', window.location.origin));
  }
});
