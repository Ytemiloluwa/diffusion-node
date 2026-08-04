import { describe, expect, it } from '@jest/globals';
import { buildAdvancedSearchQuery } from '../src/utils/search';

describe('buildAdvancedSearchQuery', () => {
  it('builds relation filters for country, source, restriction, and year', () => {
    const where = buildAdvancedSearchQuery({
      company: 'Acme',
      country: 'US',
      restriction: 'Entity List',
      source: 'BIS',
      technology: 'Semiconductor',
      year: 2026,
    });

    expect(where).toMatchObject({
      AND: [
        { sources: { some: { sourceName: { contains: 'BIS' } } } },
        {
          jurisdictions: {
            some: {
              country: {
                OR: [{ name: { contains: 'US' } }, { isoCode: { contains: 'US' } }],
              },
            },
          },
        },
        {
          jurisdictions: {
            some: {
              restrictionType: { name: { contains: 'Entity List' } },
            },
          },
        },
        {
          effectiveDate: {
            gte: new Date(Date.UTC(2026, 0, 1)),
            lt: new Date(Date.UTC(2027, 0, 1)),
          },
        },
        {
          technologies: {
            some: {
              technology: {
                OR: [
                  { name: { contains: 'Semiconductor' } },
                  { description: { contains: 'Semiconductor' } },
                  { category: { name: { contains: 'Semiconductor' } } },
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
                  { name: { contains: 'Acme' } },
                  { entityListStatus: { contains: 'Acme' } },
                  { hqCountry: { name: { contains: 'Acme' } } },
                  { hqCountry: { isoCode: { contains: 'Acme' } } },
                ],
              },
            },
          },
        },
      ],
    });
  });
});
