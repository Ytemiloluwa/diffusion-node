export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export interface CursorPage<T> {
  data: T[];
  pageInfo: {
    hasNextPage: boolean;
    limit: number;
    nextCursor: string | null;
  };
}

export const normalizeLimit = (limit?: number): number => {
  if (!limit || limit < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(limit, MAX_LIMIT);
};

export const getPage = <T extends { id: string }>(items: T[], limit: number): CursorPage<T> => {
  const hasNextPage = items.length > limit;
  const data = hasNextPage ? items.slice(0, limit) : items;
  const lastItem = data[data.length - 1];

  return {
    data,
    pageInfo: {
      hasNextPage,
      limit,
      nextCursor: hasNextPage && lastItem ? lastItem.id : null,
    },
  };
};
