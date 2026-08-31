import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

import prisma from '../db/prisma';
import { AppError } from '../utils/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

const serializeUser = (user: { createdAt: Date; email: string; id: string; role: Role }) => ({
  createdAt: user.createdAt,
  email: user.email,
  id: user.id,
  role: user.role,
});

export const register = async (
  email: string,
  password: string,
  role: Role = Role.DEVELOPER,
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError(409, 'EMAIL_ALREADY_REGISTERED', 'A user with this email exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
    },
  });

  return serializeUser(user);
};

export const issueToken = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: serializeUser(user),
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user) {
    throw new AppError(401, 'INVALID_TOKEN', 'Refresh token user no longer exists.');
  }

  return {
    accessToken: signAccessToken(user),
  };
};
