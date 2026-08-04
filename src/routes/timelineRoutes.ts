import { Router } from 'express';

import { listTimelineHandler } from '../controllers/timelineHttpController';
import { validateRequest } from '../middleware/validateRequest';
import { paginationQuerySchema } from './validators';

export const timelineRoutes = Router();

timelineRoutes.get('/', validateRequest({ query: paginationQuerySchema }), listTimelineHandler);
