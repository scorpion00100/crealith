import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crealith API',
      version: '1.0.0',
      description: 'API documentation for Crealith e-commerce platform',
      contact: {
        name: 'Crealith Support',
        email: 'support@crealith.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.crealith.com' 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for external services',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            role: {
              type: 'string',
              enum: ['BUYER', 'SELLER', 'ADMIN'],
              description: 'User role',
            },
            isActive: {
              type: 'boolean',
              description: 'User account status',
            },
            emailVerified: {
              type: 'boolean',
              description: 'Email verification status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique product identifier',
            },
            name: {
              type: 'string',
              description: 'Product name',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Product price in EUR',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'Category identifier',
            },
            sellerId: {
              type: 'string',
              format: 'uuid',
              description: 'Seller identifier',
            },
            stock: {
              type: 'integer',
              description: 'Available stock quantity',
            },
            isActive: {
              type: 'boolean',
              description: 'Product availability status',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              description: 'Product image URLs',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Product creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique order identifier',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Customer identifier',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
              description: 'Order status',
            },
            totalAmount: {
              type: 'number',
              format: 'float',
              description: 'Total order amount in EUR',
            },
            shippingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' },
              },
              description: 'Shipping address',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
              description: 'Order items',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
            },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique order item identifier',
            },
            orderId: {
              type: 'string',
              format: 'uuid',
              description: 'Order identifier',
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product identifier',
            },
            quantity: {
              type: 'integer',
              description: 'Item quantity',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Item price at time of purchase',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique category identifier',
            },
            name: {
              type: 'string',
              description: 'Category name',
            },
            description: {
              type: 'string',
              description: 'Category description',
            },
            isActive: {
              type: 'boolean',
              description: 'Category status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Category creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
            },
            correlationId: {
              type: 'string',
              description: 'Error correlation ID',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page',
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Unauthorized',
                code: 'UNAUTHORIZED',
                timestamp: '2025-01-04T10:00:00Z',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Forbidden',
                code: 'FORBIDDEN',
                timestamp: '2025-01-04T10:00:00Z',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Not Found',
                code: 'NOT_FOUND',
                timestamp: '2025-01-04T10:00:00Z',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: {
                  field: 'email',
                  message: 'Invalid email format',
                },
                timestamp: '2025-01-04T10:00:00Z',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
                timestamp: '2025-01-04T10:00:00Z',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/docs/*.ts',
    './src/app.ts',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Configuration Swagger UI
  const swaggerUiOptions = {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2563eb; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
    `,
    customSiteTitle: 'Crealith API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  };

  // Route pour la documentation Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  // Route pour le JSON de la spécification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at /api-docs');
};

export default specs;
