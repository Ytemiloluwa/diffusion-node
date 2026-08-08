import { ArrowRight, CalendarDays, ExternalLink, FileText, ShieldAlert } from 'lucide-react';
import { Badge, Button, Panel } from '@/components/atoms';
import { PolicyCard } from '@/components/molecules';
import { DashboardShell, DataTable, type DataTableColumn } from '@/components/organisms';

const metrics = [
  { label: 'Tracked policies', value: '128', detail: '+12 this month', tone: 'emerald' },
  { label: 'High exposure technologies', value: '34', detail: '8 contested links', tone: 'amber' },
  { label: 'Affected companies', value: '428', detail: '24 added in latest update', tone: 'sky' },
  { label: 'Jurisdictions monitored', value: '17', detail: '5 priority countries', tone: 'slate' },
] as const;

const timelineEvents = [
  {
    date: 'May 16, 2025',
    label: 'Federal Register publication',
    source: 'Interim Final Rule',
    status: 'Active',
  },
  {
    date: 'May 12, 2025',
    label: 'BIS Entity List update',
    source: '18 entities added',
    status: 'Active',
  },
  {
    date: 'May 6, 2025',
    label: 'License review policy revision',
    source: 'AI Diffusion Framework',
    status: 'Contested',
  },
];

const countryExposure = [
  { country: 'China', count: 51, level: 'High' },
  { country: 'Russia', count: 22, level: 'High' },
  { country: 'Iran', count: 14, level: 'Medium' },
  { country: 'North Korea', count: 9, level: 'Medium' },
];

type PolicyRow = {
  companies: number;
  effectiveDate: string;
  id: string;
  policy: string;
  risk: 'High' | 'Medium';
  source: string;
  status: 'Active' | 'Contested' | 'Draft';
  technologies: string;
};

const policyRows: PolicyRow[] = [
  {
    companies: 428,
    effectiveDate: 'May 20, 2025',
    id: 'advanced-computing-controls',
    policy: 'Advanced Computing Export Controls',
    risk: 'High',
    source: 'Federal Register',
    status: 'Active',
    technologies: 'AI Accelerators, HBM',
  },
  {
    companies: 312,
    effectiveDate: 'May 12, 2025',
    id: 'entity-list-additions',
    policy: 'BIS Entity List Additions',
    risk: 'High',
    source: 'BIS Entity List',
    status: 'Active',
    technologies: 'Integrated Circuits',
  },
  {
    companies: 267,
    effectiveDate: 'May 6, 2025',
    id: 'license-review-revision',
    policy: 'License Review Policy Revision',
    risk: 'Medium',
    source: 'AI Diffusion Framework',
    status: 'Contested',
    technologies: 'EDA Software',
  },
  {
    companies: 198,
    effectiveDate: 'Apr 28, 2025',
    id: 'reporting-non-enforcement',
    policy: 'Temporary Non-Enforcement Notice',
    risk: 'Medium',
    source: 'BIS Notice',
    status: 'Draft',
    technologies: 'Advanced Computing',
  },
];

const policyColumns: DataTableColumn<PolicyRow>[] = [
  {
    cell: (row) => (
      <div>
        <p className="font-semibold text-slate-950">{row.policy}</p>
        <p className="mt-1 text-xs text-slate-500">{row.source}</p>
      </div>
    ),
    header: 'Policy',
    id: 'policy',
    isRowHeader: true,
    width: '30%',
  },
  {
    cell: (row) => row.technologies,
    header: 'Technologies',
    id: 'technologies',
    width: '22%',
  },
  {
    align: 'right',
    cell: (row) => row.companies.toLocaleString(),
    header: 'Companies',
    id: 'companies',
    width: '11%',
  },
  {
    cell: (row) => <Badge tone={row.risk === 'High' ? 'red' : 'amber'}>{row.risk}</Badge>,
    header: 'Risk',
    id: 'risk',
    width: '10%',
  },
  {
    cell: (row) => (
      <Badge
        tone={row.status === 'Active' ? 'emerald' : row.status === 'Contested' ? 'amber' : 'slate'}
      >
        {row.status}
      </Badge>
    ),
    header: 'Status',
    id: 'status',
    width: '12%',
  },
  {
    cell: (row) => row.effectiveDate,
    header: 'Effective',
    id: 'effectiveDate',
    width: '15%',
  },
];

const toneClasses = {
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  sky: 'bg-sky-50 text-sky-800 ring-sky-200',
  slate: 'bg-slate-100 text-slate-800 ring-slate-200',
} as const;

export default function Home() {
  return (
    <DashboardShell
      actions={
        <>
          <Button
            leadingIcon={<FileText aria-hidden="true" size={16} strokeWidth={2} />}
            variant="secondary"
          >
            Export brief
          </Button>
          <Button trailingIcon={<ArrowRight aria-hidden="true" size={16} strokeWidth={2} />}>
            Open Policy Explorer
          </Button>
        </>
      }
      activeItem="dashboard"
      description="Track semiconductor and AI export-control policy changes, affected technologies, companies, and jurisdictions from one analyst workspace."
      eyebrow="Policy intelligence"
      title="Dashboard"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <section
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            key={metric.label}
          >
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold tracking-normal text-slate-950">
                {metric.value}
              </p>
              <span
                className={`inline-flex min-h-6 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[metric.tone]}`}
              >
                {metric.detail}
              </span>
            </div>
          </section>
        ))}
      </div>

      <DataTable
        actions={
          <Button
            size="sm"
            trailingIcon={<ExternalLink aria-hidden="true" size={14} strokeWidth={2} />}
            variant="secondary"
          >
            Open table
          </Button>
        }
        className="mt-5"
        columns={policyColumns}
        description="A compact policy table preview for analyst workflows and upcoming explorer screens."
        rowKey={(row) => row.id}
        rows={policyRows}
        title="Policy Records"
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(24rem,0.9fr)]">
        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Policy Watch</h2>
              <p className="mt-1 text-sm text-slate-600">
                Policies with material technology, company, or jurisdiction movement.
              </p>
            </div>
            <Badge tone="amber">3 priority updates</Badge>
          </div>
          <PolicyCard
            companies={['NVIDIA', 'AMD', 'Huawei']}
            controlNumber="90 FR 4544"
            countries={['China', 'Russia']}
            effectiveDate="May 20, 2025"
            sourceName="Federal Register"
            status="ACTIVE"
            summary="Strengthens export controls on advanced computing items and links new license review posture to high-performance AI accelerator supply chains."
            technologies={['AI Accelerators', 'High-Bandwidth Memory']}
            title="Advanced Computing Export Controls"
          />
          <PolicyCard
            companies={['SMIC', 'Cambricon']}
            controlNumber="BIS-2025-0008"
            countries={['China']}
            effectiveDate="May 12, 2025"
            sourceName="BIS Entity List"
            status="CONTESTED"
            summary="Adds semiconductor and AI infrastructure entities for activities contrary to U.S. national security and foreign policy interests."
            technologies={['EDA Software', 'Manufacturing Equipment']}
            title="BIS Entity List Additions"
          />
        </section>

        <aside className="space-y-5">
          <Panel
            actions={<Badge tone="emerald">Live</Badge>}
            description="Recent source events connected to tracked policies."
            title="Regulatory Timeline"
          >
            <div className="space-y-4">
              {timelineEvents.map((event) => (
                <div className="flex gap-3" key={`${event.date}-${event.label}`}>
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                    <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{event.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{event.source}</p>
                      </div>
                      <Badge tone={event.status === 'Contested' ? 'amber' : 'emerald'}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            actions={
              <Button
                size="sm"
                trailingIcon={<ExternalLink aria-hidden="true" size={14} strokeWidth={2} />}
                variant="ghost"
              >
                View all
              </Button>
            }
            title="Country Exposure"
          >
            <div className="space-y-3">
              {countryExposure.map((item) => (
                <div className="flex items-center justify-between gap-3" key={item.country}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-950">{item.country}</p>
                    <p className="text-xs text-slate-500">{item.count} linked records</p>
                  </div>
                  <Badge tone={item.level === 'High' ? 'red' : 'amber'}>{item.level}</Badge>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Analyst Alert">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                <ShieldAlert aria-hidden="true" size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  AI accelerator exposure remains elevated
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  New license review changes affect 31 linked policies and 428 company records.
                </p>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </DashboardShell>
  );
}
