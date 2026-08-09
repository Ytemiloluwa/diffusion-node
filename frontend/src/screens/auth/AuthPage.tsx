import { ShieldCheck } from 'lucide-react';
import { AuthForm } from '@/components/organisms';

export function AuthPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section aria-labelledby="auth-product-heading" className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-md bg-teal-700 text-white">
              <ShieldCheck aria-hidden="true" size={22} strokeWidth={2} />
            </span>
            <span className="text-lg font-semibold text-slate-950">Diffusion Node</span>
          </div>
          <h1
            className="mt-7 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl"
            id="auth-product-heading"
          >
            Export-control intelligence for semiconductor and AI policy teams
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Sign in to review policy changes, linked technologies, affected companies, and
            jurisdiction exposure from the dashboard workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-sm font-medium text-slate-700">
            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              Semiconductors
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              Artificial Intelligence
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              Export controls
            </span>
          </div>
        </section>

        <AuthForm />
      </div>
    </main>
  );
}
