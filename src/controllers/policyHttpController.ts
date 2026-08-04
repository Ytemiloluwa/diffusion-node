import type { RequestHandler } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { getPolicyById, getPolicyTimeline, listPolicies } from './policyController';

export const listPoliciesHandler: RequestHandler = asyncHandler(async (req, res) => {
  const page = await listPolicies(req.query);
  res.status(200).json(page);
});

export const getPolicyHandler: RequestHandler = asyncHandler(async (req, res) => {
  const policy = await getPolicyById(String(req.params.id));
  res.status(200).json({ data: policy });
});

export const getPolicyTimelineHandler: RequestHandler = asyncHandler(async (req, res) => {
  const timeline = await getPolicyTimeline(String(req.params.id));
  res.status(200).json({ data: timeline });
});
