import { AuthForm } from '@/components/organisms';
import { AuthGlobe } from './AuthGlobe';

export function AuthPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-canvas px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section
          aria-labelledby="auth-product-heading"
          className="flex min-h-[34rem] flex-col items-start justify-center gap-5 overflow-visible py-8 lg:justify-start lg:pt-10"
        >
          <AuthGlobe className="mx-auto opacity-95 sm:mx-0" />

          <div className="relative z-10 max-w-2xl pt-8 sm:pt-10 lg:max-w-none lg:pt-12">
            <h1
              className="max-w-2xl text-3xl font-semibold tracking-normal text-ink sm:text-4xl"
              id="auth-product-heading"
            >
              Export-control intelligence for semiconductor and AI policy teams
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Sign in to review policy changes, linked technologies, affected companies, and
              jurisdiction exposure from the dashboard workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-sm font-medium text-ink-soft">
              <span className="rounded-control border border-line bg-surface px-3 py-2 shadow-control">
                Semiconductors
              </span>
              <span className="rounded-control border border-line bg-surface px-3 py-2 shadow-control">
                Artificial Intelligence
              </span>
              <span className="rounded-control border border-line bg-surface px-3 py-2 shadow-control">
                Export controls
              </span>
            </div>
          </div>
        </section>

        <AuthForm />
      </div>
    </main>
  );
}
