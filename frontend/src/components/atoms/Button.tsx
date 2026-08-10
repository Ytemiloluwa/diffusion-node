import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';
type ButtonSize = 'lg' | 'md' | 'sm';

const variantClasses: Record<ButtonVariant, string> = {
  danger: 'bg-danger text-brand-contrast hover:bg-danger-hover focus-visible:outline-danger',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-muted focus-visible:outline-focus',
  primary: 'bg-brand text-brand-contrast hover:bg-brand-hover focus-visible:outline-focus',
  secondary:
    'border border-line-strong bg-surface text-ink hover:bg-surface-muted focus-visible:outline-focus',
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'h-11 px-5 text-base',
  md: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-sm',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  size?: ButtonSize;
  trailingIcon?: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  leadingIcon,
  size = 'md',
  trailingIcon,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control font-medium shadow-control transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <Spinner label="Button loading" size={size === 'sm' ? 'sm' : 'md'} />
      ) : (
        leadingIcon
      )}
      <span>{children}</span>
      {isLoading ? null : trailingIcon}
    </button>
  );
}
