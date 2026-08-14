import { describe, expect, it } from '@jest/globals';

import { openApiSpec } from '../src/docs/openapi';

type OpenApiOperation = {
  parameters?: Array<{ $ref?: string; name?: string }>;
  responses: Record<string, unknown>;
  security?: Array<Record<string, string[]>>;
};

type OpenApiSpec = {
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
  paths: Record<string, Record<string, OpenApiOperation>>;
  servers: Array<{ url: string }>;
};

const spec = openApiSpec as OpenApiSpec;

describe('OpenAPI spec', () => {
  it('documents every Express route with the correct base path strategy', () => {
    expect(spec.servers).toEqual([{ url: '/api/v1' }]);
    expect(Object.keys(spec.paths).sort()).toEqual(
      [
        '/auth/refresh',
        '/auth/register',
        '/auth/token',
        '/api-keys',
        '/api-keys/{id}/revoke',
        '/categories',
        '/companies',
        '/countries',
        '/docs',
        '/health',
        '/me',
        '/policies',
        '/policies/{id}',
        '/policies/{id}/timeline',
        '/restrictions',
        '/sources',
        '/technologies',
        '/timeline',
      ].sort(),
    );
    expect(spec.paths['/api/v1/policies']).toBeUndefined();
  });

  it('documents policy search filters, response shape, and rate-limit errors', () => {
    const listPolicies = spec.paths['/policies'].get;
    const parameterNames = (listPolicies.parameters ?? []).map((parameter) =>
      parameter.$ref ? parameter.$ref : parameter.name,
    );

    expect(parameterNames).toEqual(
      expect.arrayContaining([
        '#/components/parameters/Cursor',
        '#/components/parameters/Limit',
        'q',
        'title',
        'company',
        'country',
        'technology',
        'year',
        'source',
        'restriction',
      ]),
    );
    expect(listPolicies.responses).toHaveProperty('200');
    expect(listPolicies.responses).toHaveProperty('400');
    expect(listPolicies.responses).toHaveProperty('429');
  });

  it('documents authentication requirements and shared schemas', () => {
    expect(spec.paths['/me'].get.security).toEqual([{ bearerAuth: [] }]);
    expect(spec.paths['/api-keys'].post.security).toEqual([{ bearerAuth: [] }]);
    expect(spec.paths['/api-keys/{id}/revoke'].post.security).toEqual([{ bearerAuth: [] }]);
    expect(spec.paths['/auth/token'].post.security).toEqual([]);
    expect(spec.components.securitySchemes).toHaveProperty('bearerAuth');
    expect(spec.components.securitySchemes).toHaveProperty('apiKeyAuth');
    expect(spec.components.schemas).toHaveProperty('ApiKeyCreateRequest');
    expect(spec.components.schemas).toHaveProperty('ApiKeyCredential');
    expect(spec.components.schemas).toHaveProperty('ApiKeySummary');
    expect(spec.components.schemas).toHaveProperty('Policy');
    expect(spec.components.schemas).toHaveProperty('PolicyStatus');
    expect(spec.components.schemas).toHaveProperty('ValidationErrorResponse');
    expect(spec.components.schemas).toHaveProperty('ErrorResponse');
  });
});
