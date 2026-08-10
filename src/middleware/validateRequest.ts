import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';

interface RequestSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

const setParsedQuery = (req: Request, query: unknown): void => {
  Object.defineProperty(req, 'query', {
    configurable: true,
    enumerable: true,
    value: query,
    writable: true,
  });
};

export const validateRequest =
  (schemas: RequestSchemas): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }

    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as Request['params'];
    }

    if (schemas.query) {
      setParsedQuery(req, schemas.query.parse(req.query));
    }

    next();
  };
