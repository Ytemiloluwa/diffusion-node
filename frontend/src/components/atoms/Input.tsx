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
        <label className="text-sm font-medium text-slate-800" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        aria-describedby={errorId ?? helperId}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-10 rounded-md border bg-white px-3 text-sm text-slate-950 shadow-sm transition-colors',
          'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          'focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-slate-300',
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? (
        <p className="text-sm text-red-700" id={errorId}>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-sm text-slate-500" id={helperId}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
