import type { ReactNode } from 'react';
import type { NavigationItemId } from './NavigationSidebar';
import { AppHeader } from './AppHeader';
import { NavigationSidebar } from './NavigationSidebar';

export type DashboardShellProps = {
  actions?: ReactNode;
  activeItem: NavigationItemId;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function DashboardShell({
  actions,
  activeItem,
  children,
  description,
  eyebrow,
  title,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <NavigationSidebar activeItem={activeItem} />
      <div className="min-w-0">
        <AppHeader />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[92rem]">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-sm font-semibold uppercase text-teal-800">{eyebrow}</p>
                ) : null}
                <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
