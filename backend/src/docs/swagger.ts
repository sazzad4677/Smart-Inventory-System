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
                  id: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
              accessToken: { type: 'string' },
            },
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          category_id: { type: 'string' },
          price: { type: 'number' },
          stock_quantity: { type: 'number' },
          min_threshold: { type: 'number' },
          status: { type: 'string' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          customer_name: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'string' },
                quantity: { type: 'number' },
                price_at_purchase: { type: 'number' },
              },
            },
          },
          total_price: { type: 'number' },
          status: { type: 'string' },
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
          401: { description: 'Unauthorized' },
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
  },
};
