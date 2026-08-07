import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';
type ButtonSize = 'lg' | 'md' | 'sm';

const variantClasses: Record<ButtonVariant, string> = {
  danger: 'bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500',
  primary: 'bg-slate-950 text-white hover:bg-slate-800 focus-visible:outline-slate-950',
  secondary:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-500',
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
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
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
