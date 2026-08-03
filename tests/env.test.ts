import { describe, expect, it } from '@jest/globals';

import { env } from '../src/config/env';

describe('test environment setup', () => {
  it('loads test env defaults before application modules import env config', () => {
    expect(env.jwtRefreshSecret).toBe('test-refresh-secret');
    expect(env.jwtSecret).toBe('test-access-secret');
    expect(env.rateLimitMax).toBe(1000);
    expect(env.rateLimitWindowMs).toBe(60000);
  });
});
