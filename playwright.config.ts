import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const frontendPort = Number(process.env.E2E_FRONTEND_PORT ?? 3100);
const backendPort = Number(process.env.E2E_BACKEND_PORT ?? 3101);
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const apiBaseUrl = process.env.E2E_API_BASE_URL ?? `http://127.0.0.1:${backendPort}/api/v1`;
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/diffusion?schema=public';

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  testDir: './tests/e2e',
  timeout: 45_000,
  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npx ts-node src/server.ts',
      env: {
        ...process.env,
        CORS_ORIGIN: frontendUrl,
        DATABASE_URL: databaseUrl,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'e2e-refresh-secret',
        JWT_SECRET: process.env.JWT_SECRET ?? 'e2e-access-secret',
        PORT: String(backendPort),
        RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX ?? '1000',
        RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ?? '60000',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: `http://127.0.0.1:${backendPort}/health`,
    },
    {
      command: `npm run build -w frontend && npm run start -w frontend -- --hostname 127.0.0.1 --port ${frontendPort}`,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      url: frontendUrl,
    },
  ],
});
