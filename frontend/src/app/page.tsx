import { ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-md bg-slate-950 text-white">
            <ShieldCheck aria-hidden="true" size={22} strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase text-slate-600">Diffusion Node</p>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Export control intelligence
            </h1>
          </div>
        </div>
      </section>
    </main>
  );
}
