import { ShieldCheck } from 'lucide-react';
import { Panel } from '@/components/atoms';

export type SettingsErrorPanelProps = {
  error: string;
};

export function SettingsErrorPanel({ error }: SettingsErrorPanelProps) {
  return (
    <Panel className="mb-5 border-danger-line bg-danger-soft" title="Settings unavailable">
      <div className="flex gap-3 text-sm text-danger">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
        <p>{error}</p>
      </div>
    </Panel>
  );
}
