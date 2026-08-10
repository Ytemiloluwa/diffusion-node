import Link from 'next/link';
import {
  Building2,
  Clock3,
  Code2,
  Cpu,
  FileText,
  Gauge,
  Globe2,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type NavigationItemId =
  | 'companies'
  | 'countries'
  | 'dashboard'
  | 'developer-settings'
  | 'policy-explorer'
  | 'technology-explorer'
  | 'timeline';

type NavigationItem = {
  href: string;
  icon: LucideIcon;
  id: NavigationItemId;
  label: string;
};

const navigationItems: NavigationItem[] = [
  { href: '/', icon: Gauge, id: 'dashboard', label: 'Dashboard' },
  { href: '/policies', icon: FileText, id: 'policy-explorer', label: 'Policy Explorer' },
  { href: '/technologies', icon: Cpu, id: 'technology-explorer', label: 'Technology Explorer' },
  { href: '/timeline', icon: Clock3, id: 'timeline', label: 'Timeline' },
  { href: '/companies', icon: Building2, id: 'companies', label: 'Companies' },
  { href: '/countries', icon: Globe2, id: 'countries', label: 'Countries' },
  {
    href: '/developer/settings',
    icon: Code2,
    id: 'developer-settings',
    label: 'Developer Settings',
  },
];

export type NavigationSidebarProps = {
  activeItem: NavigationItemId;
  className?: string;
};

export function NavigationSidebar({ activeItem, className }: NavigationSidebarProps) {
  return (
    <aside
      className={cn(
        'hidden min-h-screen border-r border-line bg-surface text-ink-soft lg:flex lg:flex-col',
        className,
      )}
    >
      <div className="flex h-20 items-center gap-3 border-b border-line px-6">
        <span className="flex size-10 items-center justify-center rounded-panel bg-brand text-brand-contrast shadow-control">
          <ShieldCheck aria-hidden="true" size={21} strokeWidth={2} />
        </span>
        <span className="text-lg font-semibold text-ink">Diffusion Node</span>
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-6">
        {navigationItems.map((item) => {
          const isActive = item.id === activeItem;
          const Icon = item.icon;

          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                isActive
                  ? 'bg-brand-soft text-brand ring-1 ring-inset ring-brand-line'
                  : 'text-ink-soft hover:bg-surface-muted hover:text-ink',
              )}
              href={item.href}
              key={item.id}
            >
              <Icon aria-hidden="true" size={19} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <div className="rounded-panel bg-surface-muted p-3">
          <p className="text-xs font-medium uppercase text-muted">Workspace</p>
          <p className="mt-1 text-sm font-semibold text-ink">Policy Intelligence</p>
          <p className="mt-1 text-xs text-muted">Production dataset</p>
        </div>
      </div>
    </aside>
  );
}
