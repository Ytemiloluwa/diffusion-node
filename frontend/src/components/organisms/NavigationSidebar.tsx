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
        'hidden min-h-screen border-r border-slate-200 bg-white text-slate-700 lg:flex lg:flex-col',
        className,
      )}
    >
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
        <span className="flex size-10 items-center justify-center rounded-md bg-teal-700 text-white">
          <ShieldCheck aria-hidden="true" size={21} strokeWidth={2} />
        </span>
        <span className="text-lg font-semibold text-slate-950">Diffusion Node</span>
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-6">
        {navigationItems.map((item) => {
          const isActive = item.id === activeItem;
          const Icon = item.icon;

          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700',
                isActive
                  ? 'bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
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

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-500">Workspace</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">Policy Intelligence</p>
          <p className="mt-1 text-xs text-slate-500">Production dataset</p>
        </div>
      </div>
    </aside>
  );
}
