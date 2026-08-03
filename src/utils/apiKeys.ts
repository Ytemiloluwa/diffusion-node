import { createHash, randomBytes } from 'crypto';

export const generateApiKey = (): string => `dn_${randomBytes(32).toString('base64url')}`;

export const hashApiKey = (apiKey: string): string =>
  createHash('sha256').update(apiKey).digest('hex');
