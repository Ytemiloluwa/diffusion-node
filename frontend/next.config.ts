import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(frontendDir, '..');

loadEnvConfig(repoRoot, process.env.NODE_ENV !== 'production', console, true);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
