import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type IconButtonVariant = 'ghost' | 'primary' | 'secondary';
type IconButtonSize = 'lg' | 'md' | 'sm';

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500',
  primary: 'bg-slate-950 text-white hover:bg-slate-800 focus-visible:outline-slate-950',
  secondary:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-500',
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
        'inline-flex items-center justify-center rounded-md transition-colors',
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
