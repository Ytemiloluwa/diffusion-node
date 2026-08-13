'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useUiStore } from '@/store';

export type AppHeaderProps = {
  userInitials?: string;
  userName?: string;
};

export function AppHeader({ userInitials = 'AK', userName = 'Analyst' }: AppHeaderProps) {
  const router = useRouter();
  const setPolicyFilter = useUiStore((state) => state.setPolicyFilter);
  const [searchValue, setSearchValue] = useState('');

  const submitGlobalSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchValue.trim();
    setPolicyFilter('q', query || undefined);
    router.push(query ? `/policies?search=${encodeURIComponent(query)}` : '/policies');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <form
            className="relative hidden w-full max-w-md sm:block"
            onSubmit={submitGlobalSearch}
            role="search"
          >
            <label className="sr-only" htmlFor="global-search">
              Global policy search
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
            />
            <input
              className="h-10 w-full rounded-control border border-line-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink shadow-control placeholder:text-subtle focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
              id="global-search"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search policies, companies, countries"
              type="search"
              value={searchValue}
            />
          </form>
        </div>

        <div className="flex shrink-0 items-center">
          <Link
            className="flex h-10 items-center gap-2 rounded-control px-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            href="/developer/settings"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-contrast">
              {userInitials}
            </span>
            <span className="hidden text-ink md:inline">{userName}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
