import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  helperText?: string;
  label?: string;
};

export function Input({ className, error, helperText, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label className="text-sm font-medium text-ink-soft" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        aria-describedby={errorId ?? helperId}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-10 rounded-control border bg-surface px-3 text-sm text-ink shadow-control transition-colors',
          'placeholder:text-subtle disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted',
          'focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft',
          error ? 'border-danger focus:border-danger focus:ring-danger-soft' : 'border-line-strong',
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? (
        <p className="text-sm text-danger" id={errorId}>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-sm text-muted" id={helperId}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
