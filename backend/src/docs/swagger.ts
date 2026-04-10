export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Inventory System API',
    version: '1.0.0',
    description: 'API documentation for the Smart Inventory System backend.',
  },
  servers: [
    {
      url: '/api',
      description: 'Main API route',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide the JWT access token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message description' },
        },
      },
      UnauthorizedError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Unauthorized: Invalid or expired token' },
        },
      },
      ForbiddenError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Forbidden: Insufficient permissions' },
        },
      },
      NotFoundError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Resource not found' },
        },
      },
      ConflictError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Conflict: Request could not be completed' },
          errorDetails: { type: 'string', example: 'Product is linked to active orders' },
        },
      },
      UserAuth: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                  email: { type: 'string', example: 'admin@demo.com' },
                  role: { type: 'string', example: 'ADMIN' },
                },
              },
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          name: { type: 'string', example: 'Electronics' },
          description: { type: 'string', example: 'Gadgets and hardware' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          name: { type: 'string', example: 'MacBook Pro M3' },
          category_id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          price: { type: 'number', example: 1999.99 },
          stock_quantity: { type: 'number', example: 45 },
          min_threshold: { type: 'number', example: 10 },
          status: { type: 'string', example: 'Active' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          order_id: { type: 'string', example: 'ORD0001' },
          customer_name: { type: 'string', example: 'Jane Smith' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                quantity: { type: 'number', example: 2 },
                unit_price: { type: 'number', example: 999.99 },
              },
            },
          },
          total_price: { type: 'number', example: 1999.98 },
          status: { type: 'string', example: 'Pending' },
          created_at: { type: 'string', format: 'date-time', example: '2024-03-20T10:00:00Z' },
        },
      },
      HealthStatus: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          message: { type: 'string', example: 'Server is running' },
          uptime: { type: 'number', example: 412.5, description: 'Process uptime in seconds' },
          memory: {
            type: 'object',
            properties: {
              rss: { type: 'number', example: 87326720 },
              heapTotal: { type: 'number', example: 45875200 },
              heapUsed: { type: 'number', example: 38123456 },
              external: { type: 'number', example: 2345678 },
            },
          },
          dbState: {
            type: 'string',
            enum: ['connected', 'disconnected', 'connecting', 'disconnecting'],
            example: 'connected',
          },
          redisState: { type: 'string', enum: ['connected', 'disconnected'], example: 'connected' },
        },
      },
      ClientEvent: {
        type: 'object',
        required: ['eventName', 'url', 'createdAt'],
        properties: {
          eventName: { type: 'string', example: 'PAGE_VIEW' },
          url: { type: 'string', example: 'http://localhost:3000/dashboard' },
          properties: {
            type: 'object',
            additionalProperties: true,
            example: { pathname: '/dashboard' },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AnalyticsMetrics: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              api: {
                type: 'object',
                properties: {
                  totalRequestsLog: {
                    type: 'integer',
                    example: 120,
                    description: 'Total API requests logged in last 30 days',
                  },
                  slowRequests: {
                    type: 'integer',
                    example: 3,
                    description: 'Requests that took longer than 500ms',
                  },
                  averageResponseTimeMs: {
                    type: 'integer',
                    example: 43,
                    description: 'Average response time across all logged requests',
                  },
                },
              },
              client: {
                type: 'object',
                properties: {
                  totalEventsLog: {
                    type: 'integer',
                    example: 87,
                    description: 'Total client-side events tracked',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Categories', description: 'Category management endpoints' },
    { name: 'Products', description: 'Product management endpoints' },
    { name: 'Orders', description: 'Order management endpoints' },
    { name: 'Dashboard', description: 'Dashboard stats and information' },
    { name: 'Restock Queue', description: 'Restock queue endpoints' },
    { name: 'Activity Logs', description: 'Activity logging endpoints' },
    {
      name: 'Health',
      description: 'System health and uptime monitoring — PUBLIC, no auth required',
    },
    { name: 'Analytics', description: 'Server-side metrics and client-side event tracking' },
  ],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  role: { type: 'string', example: 'MANAGER' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserAuth' } } },
          },
          400: { description: 'Bad Request' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserAuth' } } },
          },
          401: { $ref: '#/components/schemas/UnauthorizedError' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        responses: {
          200: { description: 'Success' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user',
        responses: {
          200: { description: 'Success' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Success' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get all categories',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a new category',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string' }, description: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
        },
      },
    },
    '/categories/{id}': {
      put: {
        tags: ['Categories'],
        summary: 'Update a category',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' }, description: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete a category',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Deleted' },
        },
      },
    },

    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'category_id', 'price', 'stock_quantity', 'min_threshold'],
                properties: {
                  name: { type: 'string' },
                  category_id: { type: 'string' },
                  price: { type: 'number' },
                  stock_quantity: { type: 'number' },
                  min_threshold: { type: 'number' },
                  status: { type: 'string', example: 'IN_STOCK' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Success' },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update a product',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  stock_quantity: { type: 'number' },
                  min_threshold: { type: 'number' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Deleted' },
        },
      },
    },
    '/products/bulk': {
      delete: {
        tags: ['Products'],
        summary: 'Bulk delete products',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ids: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Bulk items deleted' },
        },
      },
    },

    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get all orders',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Success' },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create an order',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer_name', 'items'],
                properties: {
                  customer_name: { type: 'string' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        product_id: { type: 'string' },
                        quantity: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/schemas/UnauthorizedError' },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Success' },
        },
      },
      put: {
        tags: ['Orders'],
        summary: 'Update order status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { status: { type: 'string', example: 'FULFILLED' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated' },
        },
      },
    },

    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard statistics and metrics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/activities': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get latest dashboard activities',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },

    '/restock-queue': {
      get: {
        tags: ['Restock Queue'],
        summary: 'Get all queued restock items',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/restock-queue/resolve/{id}': {
      put: {
        tags: ['Restock Queue'],
        summary: 'Resolve a restock action',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { resolved_quantity: { type: 'number' } } },
            },
          },
        },
        responses: { 200: { description: 'Success' } },
      },
    },

    '/activity-logs': {
      get: {
        tags: ['Activity Logs'],
        summary: 'Get recent activity logs',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/activity-logs/{id}/undo': {
      post: {
        tags: ['Activity Logs'],
        summary: 'Undo a specific activity (e.g., restore product)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Action undone successfully' },
          400: { description: 'Action cannot be undone' },
          404: { description: 'Activity log or original resource not found' },
        },
      },
    },
    '/activity-logs/{id}/redo': {
      post: {
        tags: ['Activity Logs'],
        summary: 'Redo a specific activity (e.g., delete product again)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Action redone successfully' },
          400: { description: 'Action cannot be redone' },
          404: { description: 'Activity log or original resource not found' },
        },
      },
    },

    // ── Health Check ──────────────────────────────────────────────────────────
    // Note: /health is on the root server, NOT under /api, but we document it
    // here so it appears in the same Swagger UI alongside other routes.
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'System health check',
        description:
          '**PUBLIC — no authentication required.**\n\n' +
          'Returns current server uptime, memory usage, and live connection state for MongoDB and Redis.\n\n' +
          '> ℹ️ This endpoint sits at the root (`GET /health`), **not** under `/api`. ' +
          'Call it directly: `http://localhost:5000/health`',
        servers: [{ url: '/', description: 'Root server (not /api)' }],
        responses: {
          200: {
            description: 'All systems operational',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthStatus' },
              },
            },
          },
        },
      },
    },

    // ── Analytics ─────────────────────────────────────────────────────────────
    '/analytics/events': {
      post: {
        tags: ['Analytics'],
        summary: 'Track client-side events (batch)',
        description:
          '**PUBLIC — no authentication required.**\n\n' +
          'Accepts a batch of client-side analytics events (page views, feature usage, etc.) ' +
          'and persists them to the `clientevents` MongoDB collection.\n\n' +
          'The frontend `AnalyticsProvider` calls this automatically every 10 seconds ' +
          'or on page unload via `navigator.sendBeacon`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['events'],
                properties: {
                  events: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ClientEvent' },
                    example: [
                      {
                        eventName: 'PAGE_VIEW',
                        url: 'http://localhost:3000/dashboard',
                        properties: { pathname: '/dashboard' },
                        createdAt: '2026-04-08T10:00:00.000Z',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Events tracked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Events tracked successfully' },
                  },
                },
              },
            },
          },
          400: { description: 'Bad Request — malformed event payload' },
        },
      },
    },

    '/analytics/metrics': {
      get: {
        tags: ['Analytics'],
        summary: 'Get aggregated server & client analytics',
        description:
          '**PROTECTED — admin or manager only.**\n\n' +
          'Returns aggregated analytics data:\n' +
          '- **API metrics:** total requests logged, slow request count (>500ms), average response time\n' +
          '- **Client metrics:** total client-side events tracked\n\n' +
          'Data is sourced from the `apimetrics` collection (30-day TTL) and the `clientevents` collection.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Aggregated analytics data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AnalyticsMetrics' },
              },
            },
          },
          401: { description: 'Unauthorized — not logged in or invalid token' },
          403: { description: 'Forbidden — insufficient role (admin or manager required)' },
        },
      },
    },
  },
};
