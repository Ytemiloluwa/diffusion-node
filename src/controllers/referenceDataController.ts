import prisma from '../db/prisma';
import { getPage, normalizeLimit } from '../utils/pagination';

const textContains = (value: string): { contains: string } => ({ contains: value });

export const listCategories = async () =>
  prisma.technologyCategory.findMany({
    include: {
      _count: {
        select: { technologies: true },
      },
    },
    orderBy: { name: 'asc' },
  });

export const listTechnologies = async (filters: { category?: string; cursor?: string; limit?: number }) => {
  const limit = normalizeLimit(filters.limit);
  const technologies = await prisma.technology.findMany({
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    include: { category: true },
    orderBy: { id: 'asc' },
    skip: filters.cursor ? 1 : 0,
    take: limit + 1,
    where: filters.category
      ? {
          category: {
            name: textContains(filters.category),
          },
        }
      : undefined,
  });

  return getPage(technologies, limit);
};

export const listCompanies = async (filters: {
  country?: string;
  cursor?: string;
  entityListStatus?: string;
  limit?: number;
}) => {
  const limit = normalizeLimit(filters.limit);
  const companies = await prisma.company.findMany({
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    include: { hqCountry: true },
    orderBy: { id: 'asc' },
    skip: filters.cursor ? 1 : 0,
    take: limit + 1,
    where: {
      ...(filters.country
        ? {
            hqCountry: {
              OR: [{ name: textContains(filters.country) }, { isoCode: textContains(filters.country) }],
            },
          }
        : {}),
      ...(filters.entityListStatus
        ? { entityListStatus: textContains(filters.entityListStatus) }
        : {}),
    },
  });

  return getPage(companies, limit);
};

export const listCountries = async (filters: { cursor?: string; limit?: number }) => {
  const limit = normalizeLimit(filters.limit);
  const countries = await prisma.country.findMany({
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    include: {
      jurisdictions: {
        include: {
          restrictionType: true,
        },
      },
    },
    orderBy: { id: 'asc' },
    skip: filters.cursor ? 1 : 0,
    take: limit + 1,
  });

  const page = getPage(countries, limit);

  return {
    ...page,
    data: page.data.map((country) => ({
      ...country,
      restrictionSummary: country.jurisdictions.reduce<Record<string, number>>((summary, jurisdiction) => {
        summary[jurisdiction.restrictionType.name] =
          (summary[jurisdiction.restrictionType.name] || 0) + 1;
        return summary;
      }, {}),
    })),
  };
};

export const listRestrictions = async () =>
  prisma.restrictionType.findMany({
    orderBy: { name: 'asc' },
  });

export const listSources = async () =>
  prisma.policySource.findMany({
    distinct: ['sourceName'],
    orderBy: { sourceName: 'asc' },
    select: { sourceName: true },
  });
