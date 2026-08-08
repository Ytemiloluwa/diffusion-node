import { Bell, ChevronDown, CircleHelp, Search } from 'lucide-react';
import { IconButton } from '@/components/atoms';

export type AppHeaderProps = {
  userInitials?: string;
  userName?: string;
};

export function AppHeader({ userInitials = 'AK', userName = 'Analyst' }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <label className="sr-only" htmlFor="global-search">
            Global search
          </label>
          <div className="relative hidden w-full max-w-sm sm:block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-10 w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
              id="global-search"
              placeholder="Search policies, companies, countries"
              type="search"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IconButton
            icon={<CircleHelp aria-hidden="true" size={18} strokeWidth={2} />}
            label="Open help"
            size="sm"
            variant="ghost"
          />
          <IconButton
            icon={<Bell aria-hidden="true" size={18} strokeWidth={2} />}
            label="Open notifications"
            size="sm"
            variant="ghost"
          />
          <button
            className="flex h-10 items-center gap-2 rounded-md px-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            type="button"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
              {userInitials}
            </span>
            <span className="hidden text-slate-950 md:inline">{userName}</span>
            <ChevronDown aria-hidden="true" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
