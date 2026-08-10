import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type IconButtonVariant = 'ghost' | 'primary' | 'secondary';
type IconButtonSize = 'lg' | 'md' | 'sm';

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-muted focus-visible:outline-focus',
  primary: 'bg-brand text-brand-contrast hover:bg-brand-hover focus-visible:outline-focus',
  secondary:
    'border border-line-strong bg-surface text-ink hover:bg-surface-muted focus-visible:outline-focus',
};

const sizeClasses: Record<IconButtonSize, string> = {
  lg: 'size-11',
  md: 'size-10',
  sm: 'size-8',
};

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: ReactNode;
  isLoading?: boolean;
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
};

export function IconButton({
  className,
  disabled,
  icon,
  isLoading = false,
  label,
  size = 'md',
  type = 'button',
  variant = 'secondary',
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-control shadow-control transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      title={label}
      type={type}
      {...props}
    >
      {isLoading ? (
        <Spinner label={`${label} loading`} size={size === 'lg' ? 'md' : 'sm'} />
      ) : (
        icon
      )}
    </button>
  );
}
