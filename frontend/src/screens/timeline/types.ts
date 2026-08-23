import type { LucideIcon } from 'lucide-react';
import type { MetricTone } from '@/screens/shared';

export type TimelineFilters = {
  eventType: string;
  sourceName: string;
  status: string;
};

export type TimelineMetric = {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
};

export type TimelineSummaryCount = {
  count: number;
  label: string;
};
