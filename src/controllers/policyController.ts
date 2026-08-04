import prisma from '../db/prisma';
import { AppError } from '../utils/errors';
import { getPage, normalizeLimit } from '../utils/pagination';
import { buildAdvancedSearchQuery, type PolicySearchFilters } from '../utils/search';

const policyInclude = {
  companies: {
    include: {
      company: {
        include: {
          hqCountry: true,
        },
      },
    },
  },
  documents: true,
  jurisdictions: {
    include: {
      country: true,
      restrictionType: true,
    },
  },
  sources: true,
  technologies: {
    include: {
      technology: {
        include: {
          category: true,
        },
      },
    },
  },
} as const;

export const listPolicies = async (
  filters: PolicySearchFilters & { cursor?: string; limit?: number },
) => {
  const limit = normalizeLimit(filters.limit);
  const policies = await prisma.policy.findMany({
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    include: policyInclude,
    orderBy: { id: 'asc' },
    skip: filters.cursor ? 1 : 0,
    take: limit + 1,
    where: buildAdvancedSearchQuery(filters),
  });

  return getPage(policies, limit);
};

export const getPolicyById = async (id: string) => {
  const policy = await prisma.policy.findUnique({
    include: {
      ...policyInclude,
      revisions: {
        orderBy: { revisionDate: 'asc' },
      },
      timelineEvents: {
        orderBy: { eventDate: 'asc' },
      },
    },
    where: { id },
  });

  if (!policy) {
    throw new AppError(404, 'POLICY_NOT_FOUND', 'Policy was not found.');
  }

  return policy;
};

export const getPolicyTimeline = async (id: string) => {
  const policy = await prisma.policy.findUnique({
    select: { id: true },
    where: { id },
  });

  if (!policy) {
    throw new AppError(404, 'POLICY_NOT_FOUND', 'Policy was not found.');
  }

  const [revisions, events] = await Promise.all([
    prisma.policyRevision.findMany({
      orderBy: { revisionDate: 'asc' },
      where: { policyId: id },
    }),
    prisma.timelineEvent.findMany({
      orderBy: { eventDate: 'asc' },
      where: { policyId: id },
    }),
  ]);

  return [...revisions, ...events]
    .map((item) =>
      'revisionDate' in item
        ? {
            changeSummary: item.changeSummary,
            date: item.revisionDate,
            id: item.id,
            newStatus: item.newStatus,
            previousStatus: item.previousStatus,
            type: 'revision',
          }
        : {
            date: item.eventDate,
            description: item.description,
            eventType: item.eventType,
            id: item.id,
            type: 'event',
          },
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};
