import { AppLogo } from '@/components/atoms';
import { AuthForm } from '@/components/organisms';

export function AuthPage() {
  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section aria-labelledby="auth-product-heading" className="max-w-2xl">
          <div className="flex items-center gap-3">
            <AppLogo aria-label="Diffusion Node" size="lg" />
            <span className="text-lg font-semibold text-ink">Diffusion Node</span>
          </div>
          <h1
            className="mt-7 text-3xl font-semibold tracking-normal text-ink sm:text-4xl"
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
        </section>

        <AuthForm />
      </div>
    </main>
  );
}
