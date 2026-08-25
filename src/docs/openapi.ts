import swaggerJsdoc from 'swagger-jsdoc';

const jsonContent = (schema: unknown) => ({
  content: {
    'application/json': {
      schema,
    },
  },
});

const okJson = (description: string, schema: unknown) => ({
  description,
  ...jsonContent(schema),
});

const validationErrorResponse = okJson('Request validation failed.', {
  $ref: '#/components/schemas/ValidationErrorResponse',
});

const unauthorizedResponse = okJson('Authentication failed or credentials are missing.', {
  $ref: '#/components/schemas/ErrorResponse',
});

const notFoundResponse = okJson('The requested resource was not found.', {
  $ref: '#/components/schemas/ErrorResponse',
});

const conflictResponse = okJson('The request conflicts with an existing resource.', {
  $ref: '#/components/schemas/ErrorResponse',
});

const rateLimitResponse = okJson('The configured rate limit was exceeded.', {
  $ref: '#/components/schemas/ErrorResponse',
});

const internalErrorResponse = okJson('An unexpected server error occurred.', {
  $ref: '#/components/schemas/ErrorResponse',
});

const cursorParameter = {
  description: 'UUID cursor returned as pageInfo.nextCursor from a previous response.',
  in: 'query',
  name: 'cursor',
  required: false,
  schema: {
    format: 'uuid',
    type: 'string',
  },
};

const limitParameter = {
  description: 'Maximum number of records to return. Defaults to 20 and caps at 100.',
  in: 'query',
  name: 'limit',
  required: false,
  schema: {
    default: 20,
    maximum: 100,
    minimum: 1,
    type: 'integer',
  },
};

const idPathParameter = {
  description: 'Policy UUID.',
  in: 'path',
  name: 'id',
  required: true,
  schema: {
    format: 'uuid',
    type: 'string',
  },
};

const apiKeyIdPathParameter = {
  description: 'API key UUID.',
  in: 'path',
  name: 'id',
  required: true,
  schema: {
    format: 'uuid',
    type: 'string',
  },
};

const paginatedResponses = {
  400: validationErrorResponse,
  429: rateLimitResponse,
  500: internalErrorResponse,
};

export const openApiSpec = swaggerJsdoc({
  apis: [],
  definition: {
    components: {
      parameters: {
        ApiKeyId: apiKeyIdPathParameter,
        Cursor: cursorParameter,
        Limit: limitParameter,
        PolicyId: idPathParameter,
      },
      schemas: {
        ApiKeyCreateRequest: {
          additionalProperties: false,
          properties: {
            label: {
              maxLength: 80,
              minLength: 1,
              type: 'string',
            },
          },
          required: ['label'],
          type: 'object',
        },
        ApiKeyCredential: {
          additionalProperties: false,
          properties: {
            createdAt: { format: 'date-time', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            key: {
              description: 'Raw API key. Returned only once when credentials are issued.',
              example: 'dn_Ez6Kf7...',
              type: 'string',
            },
            label: { type: 'string' },
          },
          required: ['createdAt', 'id', 'key', 'label'],
          type: 'object',
        },
        ApiKeySummary: {
          additionalProperties: false,
          properties: {
            createdAt: { format: 'date-time', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            label: { type: 'string' },
            lastUsedAt: { format: 'date-time', nullable: true, type: 'string' },
            revokedAt: { format: 'date-time', nullable: true, type: 'string' },
          },
          required: ['createdAt', 'id', 'label', 'lastUsedAt', 'revokedAt'],
          type: 'object',
        },
        AuthTokenResponse: {
          additionalProperties: false,
          properties: {
            accessToken: { type: 'string' },
            apiKey: { $ref: '#/components/schemas/ApiKeyCredential' },
            refreshToken: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
          required: ['accessToken', 'apiKey', 'refreshToken', 'user'],
          type: 'object',
        },
        Company: {
          additionalProperties: false,
          properties: {
            aliases: {
              items: { type: 'string' },
              type: 'array',
            },
            entityListStatus: { nullable: true, type: 'string' },
            hqCountry: { $ref: '#/components/schemas/Country' },
            hqCountryId: { format: 'uuid', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            name: { type: 'string' },
          },
          required: ['aliases', 'entityListStatus', 'hqCountry', 'hqCountryId', 'id', 'name'],
          type: 'object',
        },
        Country: {
          additionalProperties: false,
          properties: {
            id: { format: 'uuid', type: 'string' },
            isoCode: {
              description: 'Three-letter ISO code where available in the curated dataset.',
              example: 'CHN',
              type: 'string',
            },
            name: { example: 'China', type: 'string' },
            tierClassification: { nullable: true, type: 'string' },
          },
          required: ['id', 'isoCode', 'name', 'tierClassification'],
          type: 'object',
        },
        CountryWithRestrictionSummary: {
          allOf: [
            { $ref: '#/components/schemas/Country' },
            {
              additionalProperties: false,
              properties: {
                jurisdictions: {
                  items: {
                    additionalProperties: false,
                    properties: {
                      restrictionType: { $ref: '#/components/schemas/RestrictionType' },
                    },
                    required: ['restrictionType'],
                    type: 'object',
                  },
                  type: 'array',
                },
                restrictionSummary: {
                  additionalProperties: {
                    type: 'integer',
                  },
                  description:
                    'Counts of restriction types associated with the country through policy jurisdictions.',
                  example: {
                    'Entity List Addition': 2,
                    'Foreign Direct Product Rule': 1,
                  },
                  type: 'object',
                },
              },
              required: ['jurisdictions', 'restrictionSummary'],
              type: 'object',
            },
          ],
        },
        Document: {
          additionalProperties: false,
          properties: {
            documentType: { example: 'Federal Register PDF', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            policyId: { format: 'uuid', type: 'string' },
            publishedDate: { format: 'date-time', nullable: true, type: 'string' },
            title: { type: 'string' },
            url: { nullable: true, type: 'string' },
          },
          required: ['documentType', 'id', 'policyId', 'publishedDate', 'title', 'url'],
          type: 'object',
        },
        Error: {
          additionalProperties: true,
          properties: {
            code: {
              example: 'VALIDATION_ERROR',
              type: 'string',
            },
            details: {
              nullable: true,
            },
            message: {
              example: 'Request validation failed.',
              type: 'string',
            },
          },
          required: ['code', 'message'],
          type: 'object',
        },
        ErrorResponse: {
          additionalProperties: false,
          properties: {
            error: { $ref: '#/components/schemas/Error' },
          },
          required: ['error'],
          type: 'object',
        },
        HealthResponse: {
          additionalProperties: false,
          properties: {
            status: { enum: ['ok'], type: 'string' },
          },
          required: ['status'],
          type: 'object',
        },
        Jurisdiction: {
          additionalProperties: false,
          properties: {
            country: { $ref: '#/components/schemas/Country' },
            countryId: { format: 'uuid', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            policyId: { format: 'uuid', type: 'string' },
            restrictionType: { $ref: '#/components/schemas/RestrictionType' },
            restrictionTypeId: { format: 'uuid', type: 'string' },
          },
          required: [
            'country',
            'countryId',
            'id',
            'policyId',
            'restrictionType',
            'restrictionTypeId',
          ],
          type: 'object',
        },
        PageInfo: {
          additionalProperties: false,
          properties: {
            hasNextPage: { type: 'boolean' },
            limit: { maximum: 100, minimum: 1, type: 'integer' },
            nextCursor: { format: 'uuid', nullable: true, type: 'string' },
          },
          required: ['hasNextPage', 'limit', 'nextCursor'],
          type: 'object',
        },
        Policy: {
          additionalProperties: false,
          properties: {
            companies: {
              items: { $ref: '#/components/schemas/PolicyCompany' },
              type: 'array',
            },
            controlNumber: { nullable: true, type: 'string' },
            createdAt: { format: 'date-time', type: 'string' },
            documents: {
              items: { $ref: '#/components/schemas/Document' },
              type: 'array',
            },
            effectiveDate: { format: 'date-time', nullable: true, type: 'string' },
            id: { format: 'uuid', type: 'string' },
            jurisdictions: {
              items: { $ref: '#/components/schemas/Jurisdiction' },
              type: 'array',
            },
            sources: {
              items: { $ref: '#/components/schemas/PolicySource' },
              type: 'array',
            },
            status: { $ref: '#/components/schemas/PolicyStatus' },
            summary: { nullable: true, type: 'string' },
            technologies: {
              items: { $ref: '#/components/schemas/PolicyTechnology' },
              type: 'array',
            },
            title: { type: 'string' },
            updatedAt: { format: 'date-time', type: 'string' },
          },
          required: [
            'companies',
            'controlNumber',
            'createdAt',
            'documents',
            'effectiveDate',
            'id',
            'jurisdictions',
            'sources',
            'status',
            'summary',
            'technologies',
            'title',
            'updatedAt',
          ],
          type: 'object',
        },
        PolicyCompany: {
          additionalProperties: false,
          properties: {
            company: { $ref: '#/components/schemas/Company' },
            companyId: { format: 'uuid', type: 'string' },
            createdAt: { format: 'date-time', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            policyId: { format: 'uuid', type: 'string' },
          },
          required: ['company', 'companyId', 'createdAt', 'id', 'policyId'],
          type: 'object',
        },
        PolicyRevisionTimelineItem: {
          additionalProperties: false,
          properties: {
            changeSummary: { nullable: true, type: 'string' },
            date: { format: 'date-time', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            newStatus: {
              nullable: true,
              oneOf: [{ $ref: '#/components/schemas/PolicyStatus' }],
            },
            previousStatus: {
              nullable: true,
              oneOf: [{ $ref: '#/components/schemas/PolicyStatus' }],
            },
            type: { enum: ['revision'], type: 'string' },
          },
          required: ['changeSummary', 'date', 'id', 'newStatus', 'previousStatus', 'type'],
          type: 'object',
        },
        PolicySource: {
          additionalProperties: false,
          properties: {
            id: { format: 'uuid', type: 'string' },
            policyId: { format: 'uuid', type: 'string' },
            publishedDate: { format: 'date-time', nullable: true, type: 'string' },
            sourceName: { example: 'BIS Federal Register', type: 'string' },
            sourceUrl: { nullable: true, type: 'string' },
          },
          required: ['id', 'policyId', 'publishedDate', 'sourceName', 'sourceUrl'],
          type: 'object',
        },
        PolicyStatus: {
          enum: ['ACTIVE', 'RESCINDED', 'CONTESTED', 'SUPERSEDED', 'DRAFT'],
          type: 'string',
        },
        PolicyTechnology: {
          additionalProperties: false,
          properties: {
            createdAt: { format: 'date-time', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            policyId: { format: 'uuid', type: 'string' },
            technology: { $ref: '#/components/schemas/Technology' },
            technologyId: { format: 'uuid', type: 'string' },
          },
          required: ['createdAt', 'id', 'policyId', 'technology', 'technologyId'],
          type: 'object',
        },
        RefreshAccessTokenResponse: {
          additionalProperties: false,
          properties: {
            accessToken: { type: 'string' },
          },
          required: ['accessToken'],
          type: 'object',
        },
        RefreshRequest: {
          additionalProperties: false,
          properties: {
            refreshToken: { minLength: 1, type: 'string' },
          },
          required: ['refreshToken'],
          type: 'object',
        },
        RegisterRequest: {
          additionalProperties: false,
          properties: {
            email: { format: 'email', type: 'string' },
            password: { minLength: 8, type: 'string', writeOnly: true },
            role: { $ref: '#/components/schemas/Role' },
          },
          required: ['email', 'password'],
          type: 'object',
        },
        RestrictionType: {
          additionalProperties: false,
          properties: {
            description: { nullable: true, type: 'string' },
            id: { format: 'uuid', type: 'string' },
            name: { example: 'Foreign Direct Product Rule', type: 'string' },
          },
          required: ['description', 'id', 'name'],
          type: 'object',
        },
        Role: {
          enum: ['ADMIN', 'DEVELOPER'],
          type: 'string',
        },
        SourceSummary: {
          additionalProperties: false,
          properties: {
            sourceName: { example: 'Federal Register', type: 'string' },
          },
          required: ['sourceName'],
          type: 'object',
        },
        Technology: {
          additionalProperties: false,
          properties: {
            aliases: {
              items: { type: 'string' },
              type: 'array',
            },
            category: { $ref: '#/components/schemas/TechnologyCategory' },
            categoryId: { format: 'uuid', type: 'string' },
            description: { nullable: true, type: 'string' },
            id: { format: 'uuid', type: 'string' },
            name: { example: 'AI accelerators', type: 'string' },
          },
          required: ['aliases', 'category', 'categoryId', 'description', 'id', 'name'],
          type: 'object',
        },
        TechnologyCategory: {
          additionalProperties: false,
          properties: {
            _count: {
              additionalProperties: false,
              properties: {
                technologies: { type: 'integer' },
              },
              required: ['technologies'],
              type: 'object',
            },
            aliases: {
              items: { type: 'string' },
              type: 'array',
            },
            id: { format: 'uuid', type: 'string' },
            isActiveInV1: { type: 'boolean' },
            name: { example: 'Artificial Intelligence', type: 'string' },
          },
          required: ['_count', 'aliases', 'id', 'isActiveInV1', 'name'],
          type: 'object',
        },
        TimelineEvent: {
          additionalProperties: false,
          properties: {
            description: { nullable: true, type: 'string' },
            eventDate: { format: 'date-time', type: 'string' },
            eventType: { example: 'Legal Challenge', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            policy: { $ref: '#/components/schemas/TimelinePolicySummary' },
            policyId: { format: 'uuid', nullable: true, type: 'string' },
            sourceName: { nullable: true, type: 'string' },
            sourceUrl: { nullable: true, type: 'string' },
          },
          required: [
            'description',
            'eventDate',
            'eventType',
            'id',
            'policy',
            'policyId',
            'sourceName',
            'sourceUrl',
          ],
          type: 'object',
        },
        TimelineEventTimelineItem: {
          additionalProperties: false,
          properties: {
            date: { format: 'date-time', type: 'string' },
            description: { nullable: true, type: 'string' },
            eventType: { type: 'string' },
            id: { format: 'uuid', type: 'string' },
            sourceName: { nullable: true, type: 'string' },
            sourceUrl: { nullable: true, type: 'string' },
            type: { enum: ['event'], type: 'string' },
          },
          required: ['date', 'description', 'eventType', 'id', 'sourceName', 'sourceUrl', 'type'],
          type: 'object',
        },
        TimelinePolicySummary: {
          additionalProperties: false,
          properties: {
            controlNumber: { nullable: true, type: 'string' },
            id: { format: 'uuid', type: 'string' },
            status: { $ref: '#/components/schemas/PolicyStatus' },
            title: { type: 'string' },
          },
          required: ['controlNumber', 'id', 'status', 'title'],
          type: 'object',
        },
        TokenRequest: {
          additionalProperties: false,
          properties: {
            email: { format: 'email', type: 'string' },
            label: {
              maxLength: 80,
              minLength: 1,
              type: 'string',
            },
            password: { minLength: 1, type: 'string', writeOnly: true },
          },
          required: ['email', 'password'],
          type: 'object',
        },
        User: {
          additionalProperties: false,
          properties: {
            createdAt: { format: 'date-time', type: 'string' },
            email: { format: 'email', type: 'string' },
            id: { format: 'uuid', type: 'string' },
            role: { $ref: '#/components/schemas/Role' },
          },
          required: ['createdAt', 'email', 'id', 'role'],
          type: 'object',
        },
        UserProfile: {
          allOf: [
            { $ref: '#/components/schemas/User' },
            {
              additionalProperties: false,
              properties: {
                apiKeys: {
                  items: { $ref: '#/components/schemas/ApiKeySummary' },
                  type: 'array',
                },
              },
              required: ['apiKeys'],
              type: 'object',
            },
          ],
        },
        ValidationErrorResponse: {
          additionalProperties: false,
          properties: {
            error: {
              additionalProperties: false,
              properties: {
                code: { enum: ['VALIDATION_ERROR'], type: 'string' },
                details: {
                  items: {
                    additionalProperties: true,
                    type: 'object',
                  },
                  type: 'array',
                },
                message: { type: 'string' },
              },
              required: ['code', 'details', 'message'],
              type: 'object',
            },
          },
          required: ['error'],
          type: 'object',
        },
      },
      securitySchemes: {
        apiKeyAuth: {
          in: 'header',
          name: 'x-api-key',
          type: 'apiKey',
        },
        bearerAuth: {
          bearerFormat: 'JWT',
          scheme: 'bearer',
          type: 'http',
        },
      },
    },
    info: {
      description:
        'Searchable export-control intelligence API for semiconductor and AI policy data.',
      title: 'Diffusion Node API',
      version: '1.0.0',
    },
    openapi: '3.0.3',
    paths: {
      '/auth/refresh': {
        post: {
          description: 'Accepts a valid refresh token and returns a newly signed access token.',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshRequest' },
              },
            },
            required: true,
          },
          responses: {
            200: okJson('Access token refreshed.', {
              additionalProperties: false,
              properties: {
                data: { $ref: '#/components/schemas/RefreshAccessTokenResponse' },
              },
              required: ['data'],
              type: 'object',
            }),
            400: validationErrorResponse,
            401: unauthorizedResponse,
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [],
          summary: 'Refresh an access token',
          tags: ['Auth'],
        },
      },
      '/auth/register': {
        post: {
          description:
            'Creates a user account and stores only a bcrypt password hash. The password is never returned.',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
            required: true,
          },
          responses: {
            201: okJson('User registered.', {
              additionalProperties: false,
              properties: {
                data: { $ref: '#/components/schemas/User' },
              },
              required: ['data'],
              type: 'object',
            }),
            400: validationErrorResponse,
            409: conflictResponse,
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [],
          summary: 'Register a Diffusion Node user',
          tags: ['Auth'],
        },
      },
      '/auth/token': {
        post: {
          description:
            'Verifies email/password credentials, returns JWT credentials, and creates one raw API key. Store the API key immediately because it is not returned again.',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenRequest' },
              },
            },
            required: true,
          },
          responses: {
            200: okJson('JWT credentials and API key issued.', {
              additionalProperties: false,
              properties: {
                data: { $ref: '#/components/schemas/AuthTokenResponse' },
              },
              required: ['data'],
              type: 'object',
            }),
            400: validationErrorResponse,
            401: unauthorizedResponse,
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [],
          summary: 'Issue JWT credentials',
          tags: ['Auth'],
        },
      },
      '/api-keys': {
        post: {
          description:
            'Creates a new API key for the authenticated user. The raw key is returned only once and is stored server-side as a hash.',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiKeyCreateRequest' },
              },
            },
            required: true,
          },
          responses: {
            201: okJson('API key created.', {
              additionalProperties: false,
              properties: {
                data: { $ref: '#/components/schemas/ApiKeyCredential' },
              },
              required: ['data'],
              type: 'object',
            }),
            400: validationErrorResponse,
            401: unauthorizedResponse,
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [{ bearerAuth: [] }],
          summary: 'Create an API key',
          tags: ['API Keys'],
        },
      },
      '/api-keys/{id}/revoke': {
        post: {
          description:
            'Revokes one active API key owned by the authenticated user. Revoked keys can no longer be used for API-key authentication.',
          parameters: [{ $ref: '#/components/parameters/ApiKeyId' }],
          responses: {
            200: okJson('API key revoked.', {
              additionalProperties: false,
              properties: {
                data: { $ref: '#/components/schemas/ApiKeySummary' },
              },
              required: ['data'],
              type: 'object',
            }),
            400: validationErrorResponse,
            401: unauthorizedResponse,
            404: notFoundResponse,
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [{ bearerAuth: [] }],
          summary: 'Revoke an API key',
          tags: ['API Keys'],
        },
      },
      '/categories': {
        get: {
          description:
            'Returns every technology category, including categories that are reserved for future expansion through the isActiveInV1 flag.',
          responses: {
            200: okJson('Technology categories returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: { $ref: '#/components/schemas/TechnologyCategory' },
                  type: 'array',
                },
              },
              required: ['data'],
              type: 'object',
            }),
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [],
          summary: 'List technology categories',
          tags: ['Reference Data'],
        },
      },
      '/companies': {
        get: {
          description:
            'Lists companies with cursor pagination. Results can be narrowed by headquarters country and entity-list status.',
          parameters: [
            { $ref: '#/components/parameters/Cursor' },
            { $ref: '#/components/parameters/Limit' },
            {
              description: 'Country name or ISO code matched against the headquarters country.',
              in: 'query',
              name: 'country',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
            {
              description: 'Entity-list status text to match.',
              in: 'query',
              name: 'entityListStatus',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
          ],
          responses: {
            200: okJson('Companies returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: { $ref: '#/components/schemas/Company' },
                  type: 'array',
                },
                pageInfo: { $ref: '#/components/schemas/PageInfo' },
              },
              required: ['data', 'pageInfo'],
              type: 'object',
            }),
            ...paginatedResponses,
          },
          security: [],
          summary: 'List companies',
          tags: ['Reference Data'],
        },
      },
      '/countries': {
        get: {
          description:
            'Lists countries with cursor pagination and a computed restriction summary derived from policy jurisdictions.',
          parameters: [
            { $ref: '#/components/parameters/Cursor' },
            { $ref: '#/components/parameters/Limit' },
          ],
          responses: {
            200: okJson('Countries returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: { $ref: '#/components/schemas/CountryWithRestrictionSummary' },
                  type: 'array',
                },
                pageInfo: { $ref: '#/components/schemas/PageInfo' },
              },
              required: ['data', 'pageInfo'],
              type: 'object',
            }),
            ...paginatedResponses,
          },
          security: [],
          summary: 'List countries',
          tags: ['Reference Data'],
        },
      },
      '/docs': {
        get: {
          description: 'Serves the Swagger UI for this OpenAPI document.',
          responses: {
            200: {
              content: {
                'text/html': {
                  schema: { type: 'string' },
                },
              },
              description: 'Swagger UI HTML returned.',
            },
          },
          security: [],
          servers: [{ url: '/' }],
          summary: 'Open Swagger UI',
          tags: ['System'],
        },
      },
      '/health': {
        get: {
          description: 'Returns a lightweight process health response.',
          responses: {
            200: okJson('Service is healthy.', {
              $ref: '#/components/schemas/HealthResponse',
            }),
          },
          security: [],
          servers: [{ url: '/' }],
          summary: 'Health check',
          tags: ['System'],
        },
      },
      '/me': {
        get: {
          description:
            'Returns the authenticated user profile and active API keys. Requires an Authorization header with a bearer access token.',
          responses: {
            200: okJson('Authenticated user profile returned.', {
              additionalProperties: false,
              properties: {
                data: { $ref: '#/components/schemas/UserProfile' },
              },
              required: ['data'],
              type: 'object',
            }),
            401: unauthorizedResponse,
            404: notFoundResponse,
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [{ bearerAuth: [] }],
          summary: 'Get authenticated user profile',
          tags: ['User'],
        },
      },
      '/policies': {
        get: {
          description:
            'Lists policies with cursor pagination and composable advanced search across policy text, company, country, technology, year, source, and restriction type relations.',
          parameters: [
            { $ref: '#/components/parameters/Cursor' },
            { $ref: '#/components/parameters/Limit' },
            {
              description:
                'Broad text search over title, summary, control number, sources, jurisdictions, technologies, and companies.',
              in: 'query',
              name: 'q',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
            {
              description: 'Policy title text to match.',
              in: 'query',
              name: 'title',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
            {
              description:
                'Company name, entity-list status, or headquarters country text to match.',
              in: 'query',
              name: 'company',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
            {
              description: 'Country name or ISO code to match through policy jurisdictions.',
              in: 'query',
              name: 'country',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
            {
              description: 'Technology name, description, or category text to match.',
              in: 'query',
              name: 'technology',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
            {
              description: 'Effective-date year.',
              in: 'query',
              name: 'year',
              required: false,
              schema: { maximum: 2200, minimum: 1900, type: 'integer' },
            },
            {
              description: 'Policy source name to match.',
              in: 'query',
              name: 'source',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
            {
              description: 'Restriction type name to match.',
              in: 'query',
              name: 'restriction',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
          ],
          responses: {
            200: okJson('Policies returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: { $ref: '#/components/schemas/Policy' },
                  type: 'array',
                },
                pageInfo: { $ref: '#/components/schemas/PageInfo' },
              },
              required: ['data', 'pageInfo'],
              type: 'object',
            }),
            ...paginatedResponses,
          },
          security: [],
          summary: 'List and search policies',
          tags: ['Policies'],
        },
      },
      '/policies/{id}': {
        get: {
          description:
            'Fetches one policy with sources, documents, jurisdictions, technologies, companies, revisions, and timeline events.',
          parameters: [{ $ref: '#/components/parameters/PolicyId' }],
          responses: {
            200: okJson('Policy returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  allOf: [
                    { $ref: '#/components/schemas/Policy' },
                    {
                      additionalProperties: false,
                      properties: {
                        revisions: {
                          items: { $ref: '#/components/schemas/PolicyRevisionTimelineItem' },
                          type: 'array',
                        },
                        timelineEvents: {
                          items: { $ref: '#/components/schemas/TimelineEvent' },
                          type: 'array',
                        },
                      },
                      required: ['revisions', 'timelineEvents'],
                      type: 'object',
                    },
                  ],
                },
              },
              required: ['data'],
              type: 'object',
            }),
            400: validationErrorResponse,
            404: notFoundResponse,
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [],
          summary: 'Get policy detail',
          tags: ['Policies'],
        },
      },
      '/policies/{id}/timeline': {
        get: {
          description:
            'Returns the ordered timeline for one policy by combining PolicyRevision records and sourced TimelineEvent records.',
          parameters: [{ $ref: '#/components/parameters/PolicyId' }],
          responses: {
            200: okJson('Policy timeline returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: {
                    oneOf: [
                      { $ref: '#/components/schemas/PolicyRevisionTimelineItem' },
                      { $ref: '#/components/schemas/TimelineEventTimelineItem' },
                    ],
                  },
                  type: 'array',
                },
              },
              required: ['data'],
              type: 'object',
            }),
            400: validationErrorResponse,
            404: notFoundResponse,
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [],
          summary: 'Get policy timeline',
          tags: ['Policies'],
        },
      },
      '/restrictions': {
        get: {
          description: 'Lists policy restriction types in alphabetical order.',
          responses: {
            200: okJson('Restriction types returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: { $ref: '#/components/schemas/RestrictionType' },
                  type: 'array',
                },
              },
              required: ['data'],
              type: 'object',
            }),
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [],
          summary: 'List restriction types',
          tags: ['Reference Data'],
        },
      },
      '/sources': {
        get: {
          description: 'Lists distinct policy source names represented in the curated dataset.',
          responses: {
            200: okJson('Policy source names returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: { $ref: '#/components/schemas/SourceSummary' },
                  type: 'array',
                },
              },
              required: ['data'],
              type: 'object',
            }),
            429: rateLimitResponse,
            500: internalErrorResponse,
          },
          security: [],
          summary: 'List policy sources',
          tags: ['Reference Data'],
        },
      },
      '/technologies': {
        get: {
          description:
            'Lists technologies with cursor pagination. Results can be narrowed by technology category name.',
          parameters: [
            { $ref: '#/components/parameters/Cursor' },
            { $ref: '#/components/parameters/Limit' },
            {
              description: 'Technology category name to match.',
              in: 'query',
              name: 'category',
              required: false,
              schema: { minLength: 1, type: 'string' },
            },
          ],
          responses: {
            200: okJson('Technologies returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: { $ref: '#/components/schemas/Technology' },
                  type: 'array',
                },
                pageInfo: { $ref: '#/components/schemas/PageInfo' },
              },
              required: ['data', 'pageInfo'],
              type: 'object',
            }),
            ...paginatedResponses,
          },
          security: [],
          summary: 'List technologies',
          tags: ['Reference Data'],
        },
      },
      '/timeline': {
        get: {
          description:
            'Returns a global feed of timeline events across all policies, ordered by event date descending.',
          parameters: [
            { $ref: '#/components/parameters/Cursor' },
            { $ref: '#/components/parameters/Limit' },
          ],
          responses: {
            200: okJson('Timeline events returned.', {
              additionalProperties: false,
              properties: {
                data: {
                  items: { $ref: '#/components/schemas/TimelineEvent' },
                  type: 'array',
                },
                pageInfo: { $ref: '#/components/schemas/PageInfo' },
              },
              required: ['data', 'pageInfo'],
              type: 'object',
            }),
            ...paginatedResponses,
          },
          security: [],
          summary: 'List global timeline events',
          tags: ['Timeline'],
        },
      },
    },
    servers: [{ url: '/api/v1' }],
    tags: [
      { name: 'System' },
      { name: 'Auth' },
      { name: 'API Keys' },
      { name: 'Policies' },
      { name: 'Timeline' },
      { name: 'Reference Data' },
      { name: 'User' },
    ],
  },
});
