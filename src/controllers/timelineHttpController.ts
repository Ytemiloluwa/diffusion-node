import type { RequestHandler } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { listTimeline } from './timelineController';

export const listTimelineHandler: RequestHandler = asyncHandler(async (req, res) => {
  const page = await listTimeline(req.query);
  res.status(200).json(page);
});
