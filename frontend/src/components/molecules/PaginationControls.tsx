'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/cn';

export type PaginationControlsProps = {
  className?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading?: boolean;
  label?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  pageLabel?: string;
};

export function PaginationControls({
  className,
  hasNextPage,
  hasPreviousPage,
  isLoading = false,
  label = 'Pagination',
  onNext,
  onPrevious,
  pageLabel,
}: PaginationControlsProps) {
  return (
    <nav
      aria-label={label}
      className={cn('flex items-center justify-between gap-3', className)}
    >
      <Button
        disabled={!hasPreviousPage || isLoading}
        leadingIcon={<ChevronLeft aria-hidden="true" size={16} strokeWidth={2} />}
        onClick={onPrevious}
        size="sm"
        variant="secondary"
      >
        Previous
      </Button>

      {pageLabel ? <p className="text-sm font-medium text-slate-600">{pageLabel}</p> : null}

      <Button
        disabled={!hasNextPage || isLoading}
        onClick={onNext}
        size="sm"
        trailingIcon={<ChevronRight aria-hidden="true" size={16} strokeWidth={2} />}
        variant="secondary"
      >
        Next
      </Button>
    </nav>
  );
}
