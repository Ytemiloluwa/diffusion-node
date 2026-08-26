import type { RequestHandler } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import {
  getIngestionDocument,
  listIngestionDocuments,
  listIngestionRuns,
  listIngestionSources,
  updateIngestionDocumentStatus,
} from './ingestionController';

export const listIngestionSourcesHandler: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json({ data: await listIngestionSources(req.query) });
});

export const listIngestionRunsHandler: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json(await listIngestionRuns(req.query));
});

export const listIngestionDocumentsHandler: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json(await listIngestionDocuments(req.query));
});

export const getIngestionDocumentHandler: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json({ data: await getIngestionDocument(String(req.params.id)) });
});

export const updateIngestionDocumentStatusHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    res.status(200).json({
      data: await updateIngestionDocumentStatus(String(req.params.id), req.body.status),
    });
  },
);
