'use client';

import { AlertCircle, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useId, useState } from 'react';
import { AppLogo, Badge, Button, IconButton, Input } from '@/components/atoms';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/cn';

type AuthMode = 'login' | 'register';

type AuthFormFields = {
  confirmPassword: string;
  email: string;
  password: string;
};

const initialFields: AuthFormFields = {
  confirmPassword: '',
  email: '',
  password: '',
};

const tabs: Array<{ label: string; mode: AuthMode }> = [
  { label: 'Login', mode: 'login' },
  { label: 'Register', mode: 'register' },
];

export type AuthFormProps = {
  className?: string;
  defaultMode?: AuthMode;
};

export function AuthForm({ className, defaultMode = 'login' }: AuthFormProps) {
  const router = useRouter();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const [fields, setFields] = useState<AuthFormFields>(initialFields);
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [passwordsVisible, setPasswordsVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { clearError, error, isAuthenticated, login, register, status } = useAuthStore();
  const isSubmitting = status === 'loading';
  const passwordType = passwordsVisible ? 'text' : 'password';

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const updateField =
    (field: keyof AuthFormFields) => (event: ChangeEvent<HTMLInputElement>) => {
      setFields((current) => ({ ...current, [field]: event.target.value }));
      setValidationError(null);
      clearError();
    };

  const setActiveMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setValidationError(null);
    clearError();
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);
    clearError();

    const email = fields.email.trim();
    const password = fields.password;

    if (mode === 'register' && fields.confirmPassword !== password) {
      setValidationError('Passwords do not match.');
      return;
    }

    try {
      if (mode === 'register') {
        await register({ email, password });
      }

      await login({ email, password });
      router.replace('/');
    } catch {
      // Store state already carries the normalized API error for rendering.
    }
  };

  return (
    <section
      aria-labelledby="auth-heading"
      className={cn('rounded-panel border border-line bg-surface shadow-panel', className)}
    >
      <header className="border-b border-line px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <AppLogo aria-label="Diffusion Node" size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-brand">Diffusion Node</p>
              <h1 className="mt-1 text-xl font-semibold text-ink" id="auth-heading">
                Access policy intelligence
              </h1>
            </div>
          </div>
          <Badge tone="slate">v1</Badge>
        </div>
      </header>

      <div className="px-5 py-5">
        <div
          aria-label="Authentication mode"
          className="grid grid-cols-2 gap-1 rounded-control bg-surface-muted p-1"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              aria-selected={mode === tab.mode}
              className={cn(
                'h-9 rounded-control text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                mode === tab.mode
                  ? 'bg-surface text-ink shadow-control'
                  : 'text-muted hover:text-ink',
              )}
              key={tab.mode}
              onClick={() => setActiveMode(tab.mode)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form className="mt-5 space-y-4" onSubmit={submitForm}>
          <Input
            autoComplete="email"
            label="Email"
            name="email"
            onChange={updateField('email')}
            placeholder="analyst@company.com"
            required
            type="email"
            value={fields.email}
          />

          <div className="relative">
            <Input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="pr-11"
              id={passwordId}
              label="Password"
              minLength={mode === 'register' ? 8 : 1}
              name="password"
              onChange={updateField('password')}
              required
              type={passwordType}
              value={fields.password}
            />
            <IconButton
              className="absolute right-1 top-7"
              icon={
                passwordsVisible ? (
                  <EyeOff aria-hidden="true" size={16} strokeWidth={2} />
                ) : (
                  <Eye aria-hidden="true" size={16} strokeWidth={2} />
                )
              }
              label={passwordsVisible ? 'Hide password' : 'Show password'}
              onClick={() => setPasswordsVisible((isVisible) => !isVisible)}
              size="sm"
              variant="ghost"
            />
          </div>

          {mode === 'register' ? (
            <Input
              autoComplete="new-password"
              className="pr-11"
              error={validationError ?? undefined}
              id={confirmPasswordId}
              label="Confirm password"
              minLength={8}
              name="confirmPassword"
              onChange={updateField('confirmPassword')}
              required
              type={passwordType}
              value={fields.confirmPassword}
            />
          ) : null}

          {error || validationError ? (
            <div className="flex gap-2 rounded-control border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              <p>{validationError ?? error?.message}</p>
            </div>
          ) : null}

          <Button
            className="w-full"
            isLoading={isSubmitting}
            leadingIcon={
              mode === 'login' ? (
                <LogIn aria-hidden="true" size={16} strokeWidth={2} />
              ) : (
                <UserPlus aria-hidden="true" size={16} strokeWidth={2} />
              )
            }
            type="submit"
          >
            {mode === 'login' ? 'Login' : 'Create account'}
          </Button>
        </form>
      </div>
    </section>
  );
}
