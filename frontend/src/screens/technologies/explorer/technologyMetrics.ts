import {
  Building2,
  Cpu,
  FileSearch,
  Globe2,
} from 'lucide-react';
import { formatCount } from '@/screens/shared';
import type { TechnologyExplorerMetric } from './types';

type CreateTechnologyMetricsArgs = {
  affectedCompanyCount: number;
  affectedCountryCount: number;
  hasNextPage: boolean;
  isPolicyContextPartial: boolean;
  linkedTechnologyCount: number;
  technologyCount: number;
};

export const createTechnologyMetrics = ({
  affectedCompanyCount,
  affectedCountryCount,
  hasNextPage,
  isPolicyContextPartial,
  linkedTechnologyCount,
  technologyCount,
}: CreateTechnologyMetricsArgs): TechnologyExplorerMetric[] => [
  {
    detail: hasNextPage ? 'Showing current result page' : 'Loaded technology records',
    icon: Cpu,
    label: 'Technologies loaded',
    tone: 'slate',
    value: formatCount(technologyCount),
  },
  {
    detail: isPolicyContextPartial ? 'Matched from current policy coverage' : 'Matched through policy links',
    icon: FileSearch,
    label: 'Policy-linked technologies',
    tone: 'sky',
    value: formatCount(linkedTechnologyCount),
  },
  {
    detail: 'Companies connected through policy records',
    icon: Building2,
    label: 'Linked companies',
    tone: 'amber',
    value: formatCount(affectedCompanyCount),
  },
  {
    detail: 'Jurisdictions connected through policy records',
    icon: Globe2,
    label: 'Affected countries',
    tone: 'emerald',
    value: formatCount(affectedCountryCount),
  },
];
