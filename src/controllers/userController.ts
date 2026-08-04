import prisma from '../db/prisma';
import { AppError } from '../utils/errors';

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    select: {
      apiKeys: {
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
          id: true,
          label: true,
          lastUsedAt: true,
          revokedAt: true,
        },
        where: { revokedAt: null },
      },
      createdAt: true,
      email: true,
      id: true,
      role: true,
    },
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Authenticated user was not found.');
  }

  return user;
};
