import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { AppError } from '../src/utils/errors';

type MockApiKeyCreateArgs = {
  data: {
    key: string;
    label: string;
    userId: string;
  };
};

type MockApiKeyRecord = {
  createdAt: Date;
  id: string;
  label: string;
};

type MockUserCreateArgs = {
  data: {
    email: string;
    passwordHash: string;
    role: Role;
  };
};

type MockUserRecord = {
  createdAt?: Date;
  email?: string;
  id: string;
  passwordHash?: string;
  role?: Role;
};

const mockPrisma = {
  apiKey: {
    create: jest.fn<(args: MockApiKeyCreateArgs) => Promise<MockApiKeyRecord>>(),
  },
  user: {
    create:
      jest.fn<
        (args: MockUserCreateArgs) => Promise<Required<Omit<MockUserRecord, 'passwordHash'>>>
      >(),
    findUnique: jest.fn<(args: unknown) => Promise<MockUserRecord | null>>(),
  },
};

jest.mock('../src/db/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const { issueToken, refreshAccessToken, register } = require('../src/controllers/authController');
const { signRefreshToken, verifyAccessToken } = require('../src/utils/jwt');

describe('auth controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user with a bcrypt password hash', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockImplementation(async ({ data }) => ({
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      email: data.email,
      id: 'user-id',
      role: data.role,
    }));

    const user = await register('dev@example.com', 'password123');
    const createCall = mockPrisma.user.create.mock.calls[0][0];

    expect(user).toMatchObject({ email: 'dev@example.com', id: 'user-id', role: 'DEVELOPER' });
    expect(createCall.data.passwordHash).not.toBe('password123');
    await expect(bcrypt.compare('password123', createCall.data.passwordHash)).resolves.toBe(true);
  });

  it('rejects duplicate registration emails', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(register('dev@example.com', 'password123')).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_REGISTERED',
      statusCode: 409,
    } satisfies Partial<AppError>);
  });

  it('issues JWT credentials and stores only a hashed API key', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    mockPrisma.user.findUnique.mockResolvedValue({
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      email: 'dev@example.com',
      id: 'user-id',
      passwordHash,
      role: Role.DEVELOPER,
    });
    mockPrisma.apiKey.create.mockImplementation(async ({ data }) => ({
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      id: 'api-key-id',
      label: data.label,
    }));

    const response = await issueToken('dev@example.com', 'password123', 'Local dev');
    const createCall = mockPrisma.apiKey.create.mock.calls[0][0];

    expect(response.accessToken).toEqual(expect.any(String));
    expect(response.refreshToken).toEqual(expect.any(String));
    expect(response.apiKey.key).toMatch(/^dn_/);
    expect(createCall.data.key).not.toBe(response.apiKey.key);
    expect(createCall.data.label).toBe('Local dev');
  });

  it('refreshes an access token from a valid refresh token', async () => {
    const user = {
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      email: 'dev@example.com',
      id: 'user-id',
      passwordHash: 'stored-hash',
      role: Role.DEVELOPER,
    };
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const refreshToken = signRefreshToken(user);
    const response = await refreshAccessToken(refreshToken);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-id' } });
    expect(verifyAccessToken(response.accessToken)).toMatchObject({
      email: 'dev@example.com',
      role: Role.DEVELOPER,
      sub: 'user-id',
    });
  });
});
