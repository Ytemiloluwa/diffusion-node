import { KeyRound, ServerCog, ShieldCheck } from 'lucide-react';
import { Panel } from '@/components/atoms';

export function SecurityPosturePanel() {
  return (
    <Panel title="Security Posture">
      <div className="grid gap-3 text-sm text-muted">
        <div className="flex items-start gap-2">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 text-success" strokeWidth={2} />
          <p>API keys are stored as hashes on the server.</p>
        </div>
        <div className="flex items-start gap-2">
          <KeyRound aria-hidden="true" className="mt-0.5 size-4 text-info" strokeWidth={2} />
          <p>Raw key values are shown once, immediately after creation.</p>
        </div>
        <div className="flex items-start gap-2">
          <ServerCog aria-hidden="true" className="mt-0.5 size-4 text-warning" strokeWidth={2} />
          <p>Revoking a key disables future API-key authentication for that credential.</p>
        </div>
      </div>
    </Panel>
  );
}
