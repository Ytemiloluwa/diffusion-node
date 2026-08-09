import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(frontendDir, '..');

loadEnvConfig(repoRoot, process.env.NODE_ENV !== 'production');

const nextConfig: NextConfig = {
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
