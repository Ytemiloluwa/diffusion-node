import jwt from 'jsonwebtoken';
import type { Role, User } from '@prisma/client';

import { env } from '../config/env';
import { AppError } from './errors';

type TokenKind = 'access' | 'refresh';

interface TokenPayload extends jwt.JwtPayload {
  email: string;
  role: Role;
  sub: string;
  type: TokenKind;
}

const signToken = (user: Pick<User, 'email' | 'id' | 'role'>, type: TokenKind): string => {
  const secret = type === 'access' ? env.jwtSecret : env.jwtRefreshSecret;
  const expiresIn = type === 'access' ? '15m' : '7d';

  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      type,
    },
    secret,
    {
      expiresIn,
      subject: user.id,
    },
  );
};

const verifyToken = (token: string, type: TokenKind): TokenPayload => {
  const secret = type === 'access' ? env.jwtSecret : env.jwtRefreshSecret;

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;

    if (payload.type !== type || !payload.sub) {
      throw new AppError(401, 'INVALID_TOKEN', 'Token payload is invalid.');
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, 'INVALID_TOKEN', 'Token is invalid or expired.');
  }
};

export const signAccessToken = (user: Pick<User, 'email' | 'id' | 'role'>): string =>
  signToken(user, 'access');

export const signRefreshToken = (user: Pick<User, 'email' | 'id' | 'role'>): string =>
  signToken(user, 'refresh');

export const verifyAccessToken = (token: string): TokenPayload => verifyToken(token, 'access');

export const verifyRefreshToken = (token: string): TokenPayload => verifyToken(token, 'refresh');
