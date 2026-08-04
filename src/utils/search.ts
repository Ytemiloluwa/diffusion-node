import type { Prisma } from '@prisma/client';

export interface PolicySearchFilters {
  company?: string;
  country?: string;
  q?: string;
  restriction?: string;
  source?: string;
  technology?: string;
  title?: string;
  year?: number;
}

const textContains = (value: string): { contains: string } => ({ contains: value });

const policyTextMatch = (value: string): Prisma.PolicyWhereInput => ({
  OR: [
    { title: textContains(value) },
    { summary: textContains(value) },
    { controlNumber: textContains(value) },
  ],
});

export const buildAdvancedSearchQuery = (
  filters: PolicySearchFilters,
): Prisma.PolicyWhereInput => {
  const AND: Prisma.PolicyWhereInput[] = [];

  if (filters.q) {
    AND.push({
      OR: [
        policyTextMatch(filters.q),
        { sources: { some: { sourceName: textContains(filters.q) } } },
        {
          jurisdictions: {
            some: {
              OR: [
                { country: { name: textContains(filters.q) } },
                { restrictionType: { name: textContains(filters.q) } },
              ],
            },
          },
        },
        {
          technologies: {
            some: {
              technology: {
                OR: [
                  { name: textContains(filters.q) },
                  { description: textContains(filters.q) },
                  { category: { name: textContains(filters.q) } },
                ],
              },
            },
          },
        },
        {
          companies: {
            some: {
              company: {
                OR: [
                  { name: textContains(filters.q) },
                  { entityListStatus: textContains(filters.q) },
                  { hqCountry: { name: textContains(filters.q) } },
                  { hqCountry: { isoCode: textContains(filters.q) } },
                ],
              },
            },
          },
        },
      ],
    });
  }

  if (filters.title) {
    AND.push({ title: textContains(filters.title) });
  }

  if (filters.source) {
    AND.push({ sources: { some: { sourceName: textContains(filters.source) } } });
  }

  if (filters.country) {
    AND.push({
      jurisdictions: {
        some: {
          country: {
            OR: [{ name: textContains(filters.country) }, { isoCode: textContains(filters.country) }],
          },
        },
      },
    });
  }

  if (filters.restriction) {
    AND.push({
      jurisdictions: {
        some: {
          restrictionType: { name: textContains(filters.restriction) },
        },
      },
    });
  }

  if (filters.year) {
    AND.push({
      effectiveDate: {
        gte: new Date(Date.UTC(filters.year, 0, 1)),
        lt: new Date(Date.UTC(filters.year + 1, 0, 1)),
      },
    });
  }

  if (filters.technology) {
    AND.push({
      technologies: {
        some: {
          technology: {
            OR: [
              { name: textContains(filters.technology) },
              { description: textContains(filters.technology) },
              { category: { name: textContains(filters.technology) } },
            ],
          },
        },
      },
    });
  }

  if (filters.company) {
    AND.push({
      companies: {
        some: {
          company: {
            OR: [
              { name: textContains(filters.company) },
              { entityListStatus: textContains(filters.company) },
              { hqCountry: { name: textContains(filters.company) } },
              { hqCountry: { isoCode: textContains(filters.company) } },
            ],
          },
        },
      },
    });
  }

  return AND.length ? { AND } : {};
};
