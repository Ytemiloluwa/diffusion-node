import type { BadgeProps } from '@/components/atoms';
import type { TimelineEventWithPolicy } from '@/lib/api';
import type { TimelineFilters } from './types';

const eventTypeTones: Record<string, BadgeProps['tone']> = {
  announcement: 'sky',
  clarification: 'slate',
  effective: 'emerald',
  enforcement: 'red',
  extension: 'amber',
  final_rule: 'emerald',
  interim_final_rule: 'amber',
  policy_update: 'sky',
  proposed_rule: 'amber',
  rescission: 'red',
};

export const formatEventType = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

export const getEventTone = (eventType: string): BadgeProps['tone'] =>
  eventTypeTones[eventType.toLowerCase()] ?? 'slate';

export const getSourceLabel = (event: TimelineEventWithPolicy) =>
  event.sourceName?.trim() || event.sourceUrl?.replace(/^https?:\/\//, '') || 'Unattributed';

export const getSourceHost = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value.replace(/^https?:\/\//, '');
  }
};

export const getActiveFilterCount = (filters: TimelineFilters, searchQuery: string) =>
  [filters.eventType, filters.sourceName, filters.status, searchQuery.trim()].filter(Boolean).length;

const timelineSearchFields = (event: TimelineEventWithPolicy) => [
  event.description,
  event.eventType,
  event.policy?.controlNumber,
  event.policy?.status,
  event.policy?.title,
  event.sourceName,
  event.sourceUrl,
];

export const matchesSearch = (event: TimelineEventWithPolicy, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return timelineSearchFields(event).some((value) => value?.toLowerCase().includes(normalizedQuery));
};

export const matchesFilters = (event: TimelineEventWithPolicy, filters: TimelineFilters) => {
  if (filters.eventType && event.eventType !== filters.eventType) {
    return false;
  }

  if (filters.sourceName && getSourceLabel(event) !== filters.sourceName) {
    return false;
  }

  if (filters.status && event.policy?.status !== filters.status) {
    return false;
  }

  return true;
};

export const getPolicyKey = (event: TimelineEventWithPolicy) => event.policy?.id ?? event.policyId;
