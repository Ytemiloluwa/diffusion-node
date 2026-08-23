import {
  Building2,
  FileSearch,
  Globe2,
  ShieldAlert,
} from 'lucide-react';
import { formatCount } from '@/screens/shared';
import type { CompanyExplorerMetric } from './types';

type CreateCompanyMetricsArgs = {
  companyCount: number;
  entityListedCompanyCount: number;
  hasNextPage: boolean;
  isPolicyContextPartial: boolean;
  policyLinkedCompanyCount: number;
  restrictedCountryCount: number;
};

export const createCompanyMetrics = ({
  companyCount,
  entityListedCompanyCount,
  hasNextPage,
  isPolicyContextPartial,
  policyLinkedCompanyCount,
  restrictedCountryCount,
}: CreateCompanyMetricsArgs): CompanyExplorerMetric[] => [
  {
    detail: hasNextPage ? 'Showing current result page' : 'Loaded from company records',
    icon: Building2,
    label: 'Companies loaded',
    tone: 'slate',
    value: formatCount(companyCount),
  },
  {
    detail: isPolicyContextPartial ? 'From the loaded policy context window' : 'Matched through policy joins',
    icon: FileSearch,
    label: 'Policy-linked companies',
    tone: 'sky',
    value: formatCount(policyLinkedCompanyCount),
  },
  {
    detail: 'Companies marked by list status',
    icon: ShieldAlert,
    label: 'Entity-list records',
    tone: 'amber',
    value: formatCount(entityListedCompanyCount),
  },
  {
    detail: 'Headquarters countries with listed companies',
    icon: Globe2,
    label: 'Restricted HQ countries',
    tone: 'emerald',
    value: formatCount(restrictedCountryCount),
  },
];
