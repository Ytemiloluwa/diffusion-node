import { LoaderCircle } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type SpinnerSize = 'lg' | 'md' | 'sm';

const sizeClasses: Record<SpinnerSize, string> = {
  lg: 'size-6',
  md: 'size-5',
  sm: 'size-4',
};

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string;
  size?: SpinnerSize;
};

export function Spinner({ className, label = 'Loading', size = 'md', ...props }: SpinnerProps) {
  return (
    <span
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
      role="status"
      {...props}
    >
      <LoaderCircle aria-hidden="true" className={cn('animate-spin', sizeClasses[size])} />
    </span>
  );
}
