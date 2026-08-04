import prisma from '../db/prisma';
import { getPage, normalizeLimit } from '../utils/pagination';

export const listTimeline = async (filters: { cursor?: string; limit?: number }) => {
  const limit = normalizeLimit(filters.limit);
  const events = await prisma.timelineEvent.findMany({
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    include: {
      policy: {
        select: {
          controlNumber: true,
          id: true,
          status: true,
          title: true,
        },
      },
    },
    orderBy: [{ eventDate: 'desc' }, { id: 'asc' }],
    skip: filters.cursor ? 1 : 0,
    take: limit + 1,
  });

  return getPage(events, limit);
};
