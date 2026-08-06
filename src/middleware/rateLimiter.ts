import rateLimit from 'express-rate-limit';

import { env } from '../config/env';

export const rateLimiter = rateLimit({
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    });
  },
  legacyHeaders: false,
  limit: env.rateLimitMax,
  standardHeaders: true,
  windowMs: env.rateLimitWindowMs,
});
