import swaggerJsdoc from 'swagger-jsdoc';

export const openApiSpec = swaggerJsdoc({
  apis: ['src/routes/*.ts'],
  definition: {
    components: {
      securitySchemes: {
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
    servers: [{ url: '/api/v1' }],
  },
});
