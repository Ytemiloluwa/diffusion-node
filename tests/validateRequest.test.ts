import { describe, expect, it, jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validateRequest } from '../src/middleware/validateRequest';

describe('validateRequest', () => {
  it('stores parsed query values when req.query is getter-only', () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn<NextFunction>();

    Object.defineProperty(req, 'query', {
      configurable: true,
      get: () => ({ limit: '10' }),
    });

    validateRequest({
      query: z.object({
        limit: z.coerce.number().int().positive(),
      }),
    })(req, res, next);

    expect(req.query).toEqual({ limit: 10 });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
