'use client';

import { Search, X } from 'lucide-react';
import type { ChangeEvent, FormEvent, InputHTMLAttributes } from 'react';
import { useEffect, useId } from 'react';
import { IconButton } from '@/components/atoms';
import { cn } from '@/lib/cn';

export type SearchBarProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'size' | 'value'
> & {
  debounceMs?: number;
  label?: string;
  onClear?: () => void;
  onDebouncedChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onValueChange?: (value: string) => void;
  value: string;
};

export function SearchBar({
  className,
  debounceMs = 300,
  id,
  label = 'Search',
  onClear,
  onDebouncedChange,
  onSearch,
  onValueChange,
  placeholder = 'Search',
  value,
  ...props
}: SearchBarProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  useEffect(() => {
    if (!onDebouncedChange) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onDebouncedChange(value);
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, onDebouncedChange, value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(event.target.value);
  };

  const handleClear = () => {
    onValueChange?.('');
    onClear?.();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(value);
  };

  return (
    <form className={cn('relative w-full', className)} onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
      />
      <input
        className={cn(
          'h-10 w-full rounded-control border border-line-strong bg-surface py-2 pl-9 pr-10 text-sm text-ink shadow-control transition-colors',
          'placeholder:text-subtle disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted',
          'focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft',
        )}
        id={inputId}
        onChange={handleChange}
        placeholder={placeholder}
        value={value}
        {...props}
      />
      {value ? (
        <IconButton
          className="absolute right-1 top-1/2 -translate-y-1/2"
          icon={<X aria-hidden="true" size={16} strokeWidth={2} />}
          label="Clear search"
          onClick={handleClear}
          size="sm"
          variant="ghost"
        />
      ) : null}
    </form>
  );
}
