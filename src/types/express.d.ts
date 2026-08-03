import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface UserPayload {
      email?: string;
      id: string;
      role?: Role;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
