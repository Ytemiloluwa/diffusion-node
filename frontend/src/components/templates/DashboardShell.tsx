import type { ReactNode } from 'react';
import type { NavigationItemId } from '@/components/organisms';
import { AppHeader, NavigationSidebar } from '@/components/organisms';

export type DashboardShellProps = {
  actions?: ReactNode;
  activeItem: NavigationItemId;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
  userInitials?: string;
  userName?: string;
};

export function DashboardShell({
  actions,
  activeItem,
  children,
  description,
  eyebrow,
  title,
  userInitials,
  userName,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <NavigationSidebar activeItem={activeItem} />
      <div className="min-w-0">
        <AppHeader userInitials={userInitials} userName={userName} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[92rem]">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-sm font-semibold uppercase text-brand">{eyebrow}</p>
                ) : null}
                <h1 className="mt-1 text-2xl font-semibold tracking-normal text-ink sm:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
                ) : null}
              </div>
              {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
              ) : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
