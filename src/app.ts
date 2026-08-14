import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { openApiSpec } from './docs/openapi';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { apiKeyRoutes } from './routes/apiKeyRoutes';
import { authRoutes } from './routes/authRoutes';
import { policyRoutes } from './routes/policyRoutes';
import { referenceDataRoutes } from './routes/referenceDataRoutes';
import { timelineRoutes } from './routes/timelineRoutes';
import { userRoutes } from './routes/userRoutes';

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use('/api/v1', rateLimiter);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', apiKeyRoutes);
  app.use('/api/v1/policies', policyRoutes);
  app.use('/api/v1/timeline', timelineRoutes);
  app.use('/api/v1', referenceDataRoutes);
  app.use('/api/v1', userRoutes);

  app.use(errorHandler);

  return app;
};
