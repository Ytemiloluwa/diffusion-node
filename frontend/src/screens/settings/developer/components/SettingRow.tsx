import type { ReactNode } from 'react';

export type SettingRowProps = {
  action?: ReactNode;
  label: string;
  value: ReactNode;
};

export function SettingRow({ action, label, value }: SettingRowProps) {
  return (
    <div className="grid min-w-0 gap-2 border-b border-line py-3 last:border-0 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-ink">{value}</dd>
      {action ? <div className="flex justify-start sm:justify-end">{action}</div> : null}
    </div>
  );
}
