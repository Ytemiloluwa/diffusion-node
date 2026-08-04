import rateLimit from 'express-rate-limit';

import { env } from '../config/env';

export const rateLimiter = rateLimit({
  legacyHeaders: false,
  limit: env.rateLimitMax,
  standardHeaders: true,
  windowMs: env.rateLimitWindowMs,
});
