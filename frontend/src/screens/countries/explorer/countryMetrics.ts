import {
  Building2,
  Globe2,
  Layers3,
  ShieldAlert,
} from 'lucide-react';
import { formatCount } from '@/screens/shared';
import type { CountryExplorerMetric } from './types';

type CountryMetricsArgs = {
  countries: Array<{
    activePolicyCount: number;
    companyCount: number;
    technologyNames: string[];
  }>;
  hasNextPage: boolean;
  isPolicyContextPartial: boolean;
};

export const createCountryMetrics = ({
  countries,
  hasNextPage,
  isPolicyContextPartial,
}: CountryMetricsArgs): CountryExplorerMetric[] => [
  {
    detail: hasNextPage ? 'Showing current result page' : 'Loaded country records',
    icon: Globe2,
    label: 'Countries loaded',
    tone: 'slate',
    value: formatCount(countries.length),
  },
  {
    detail: isPolicyContextPartial ? 'From the loaded policy context window' : 'Countries in active records',
    icon: ShieldAlert,
    label: 'Active exposure',
    tone: 'amber',
    value: formatCount(countries.filter((country) => country.activePolicyCount > 0).length),
  },
  {
    detail: 'Companies headquartered in loaded countries',
    icon: Building2,
    label: 'Linked companies',
    tone: 'sky',
    value: formatCount(countries.reduce((total, country) => total + country.companyCount, 0)),
  },
  {
    detail: 'Unique technology links across exposed countries',
    icon: Layers3,
    label: 'Technology scope',
    tone: 'emerald',
    value: formatCount(new Set(countries.flatMap((country) => country.technologyNames)).size),
  },
];
