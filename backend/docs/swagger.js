const path = require('node:path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'D&G E-Commerce API',
      version: '1.0.0',
      description: 'Production-ready API for the D&G Rwanda online store.',
    },

    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Message: {
          type: 'object',
          properties: { message: { type: 'string' } },
          required: ['message'],
        },
        ProductSummary: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'string', example: '49.99' },
            availabilityStatus: {
              type: 'string',
              enum: ['In Stock', 'Only 1 Left', 'Only 2 Left', 'Only 3 Left', 'Only 4 Left', 'Only 5 Left', 'Out Of Stock'],
            },
            imageUrl: { type: 'string', example: '/uploads/products/example.jpg' },
            rating: { type: 'string', example: '4.5' },
          },
        },
        AdminProduct: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'string', example: '85000.00', description: 'RWF per product unit' },
            stock: { type: 'integer', minimum: 0 },
            imageUrl: { type: 'string', example: '/uploads/products/example.jpg' },
            rating: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'category', 'description', 'price', 'stock', 'imageUrl'],
        },
        AdminProductUploadRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2 },
            category: { type: 'string', enum: ['Clothes', 'Shoes', 'Bags', 'Jewellery', 'Cosmetics', 'Household Equipment'] },
            description: { type: 'string', minLength: 10 },
            price: { type: 'number', minimum: 0, description: 'RWF per product unit' },
            stock: { type: 'integer', minimum: 0, default: 0 },
            rating: { type: 'number', minimum: 0, maximum: 5 },
            image: { type: 'string', format: 'binary' },
          },
          required: ['name', 'category', 'description', 'price', 'image'],
        },
        AdminProductUpdateRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2 },
            category: { type: 'string', enum: ['Clothes', 'Shoes', 'Bags', 'Jewellery', 'Cosmetics', 'Household Equipment'] },
            description: { type: 'string', minLength: 10 },
            price: { type: 'number', minimum: 0, description: 'RWF per product unit' },
            stock: { type: 'integer', minimum: 0 },
            rating: { type: 'number', minimum: 0, maximum: 5 },
            image: { type: 'string', format: 'binary' },
          },
        },
        RestockRequest: {
          type: 'object',
          properties: { quantity: { type: 'integer', minimum: 1 } },
          required: ['quantity'],
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1 },
            product: { $ref: '#/components/schemas/ProductSummary' },
          },
          required: ['id', 'productId', 'quantity', 'product'],
        },
        CartItemRequest: {
          type: 'object',
          properties: {
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1 },
          },
          required: ['productId', 'quantity'],
        },
        CartItemQuantityRequest: {
          type: 'object',
          properties: { quantity: { type: 'integer', minimum: 1 } },
          required: ['quantity'],
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1 },
            unitPrice: { type: 'string', example: '49.99' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            totalAmount: { type: 'string', example: '99.98' },
            status: {
              type: 'string',
              enum: ['Pending', 'Confirmed', 'Packing', 'Shipped', 'Delivered'],
            },
            paymentMethod: {
              type: 'string',
              enum: ['mobile_money', 'card', 'cash_on_delivery'],
            },
            shippingAddress: { type: 'object', additionalProperties: true },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' },
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        OrderCreateRequest: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', minimum: 1 },
                },
                required: ['productId', 'quantity'],
              },
            },
            address: { type: 'object', additionalProperties: true },
            paymentMethod: {
              type: 'string',
              enum: ['mobile_money', 'card', 'cash_on_delivery'],
            },
          },
          required: ['items', 'address'],
        },
        AdminUser: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['customer', 'admin'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'fullName', 'email', 'role'],
        },
        AdminOrder: {
          allOf: [
            { $ref: '#/components/schemas/Order' },
            {
              type: 'object',
              properties: {
                User: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    fullName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string', nullable: true },
                  },
                },
              },
            },
          ],
        },
        AdminDashboard: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer', minimum: 0 },
            totalProducts: { type: 'integer', minimum: 0 },
            totalOrders: { type: 'integer', minimum: 0 },
            totalRevenue: { type: 'number', minimum: 0 },
            lowStockProducts: { type: 'integer', minimum: 0 },
            outOfStockProducts: { type: 'integer', minimum: 0 },
          },
          required: ['totalUsers', 'totalProducts', 'totalOrders', 'totalRevenue', 'lowStockProducts', 'outOfStockProducts'],
        },
        UserRoleUpdateRequest: {
          type: 'object',
          properties: { role: { type: 'string', enum: ['customer', 'admin'] } },
          required: ['role'],
        },
        OrderStatusUpdateRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['Pending', 'Confirmed', 'Packing', 'Shipped', 'Delivered'],
            },
          },
          required: ['status'],
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [path.resolve(path.dirname(require.resolve('../routes/cartRoutes')), '*.js').replace(/\\/g, '/')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
};
