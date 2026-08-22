export type MetricTone = 'amber' | 'emerald' | 'sky' | 'slate';

export const metricToneClasses: Record<MetricTone, string> = {
  amber: 'bg-warning-soft text-warning ring-warning-line',
  emerald: 'bg-success-soft text-success ring-success-line',
  sky: 'bg-info-soft text-info ring-info-line',
  slate: 'bg-surface-muted text-ink-soft ring-line',
};
