const express = require('express');
const fs = require('node:fs/promises');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { uploadProductImage } = require('../middleware/productImageUpload');
const {
  orderStatuses,
  getDashboard,
  listAdminProducts,
  getAdminProductById,
  listLowStockProducts,
  listOutOfStockProducts,
  createProduct,
  updateProduct,
  deleteAdminProduct,
  restockProduct,
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  listAllOrders,
  getAdminOrderById,
  updateOrderStatus,
} = require('../services/adminService');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

function productFields({ optional = false, optionalStock = false } = {}) {
  const applyOptional = (validator, shouldBeOptional = optional) =>
    shouldBeOptional ? validator.optional() : validator;

  return [
    applyOptional(body('name').trim().isLength({ min: 2 }).withMessage('Product name is required.')),
    applyOptional(
      body('category')
        .isIn(['Clothes', 'Shoes', 'Bags', 'Jewellery', 'Cosmetics', 'Household Equipment'])
        .withMessage('A valid product category is required.'),
    ),
    applyOptional(body('description').trim().isLength({ min: 10 }).withMessage('Description is required.')),
    applyOptional(body('price').isFloat({ min: 0 }).withMessage('Price must be greater than or equal to zero.')),
    applyOptional(
      body('stock').isInt({ min: 0 }).withMessage('Stock must be zero or greater.'),
      optional || optionalStock,
    ),
    applyOptional(body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between zero and five.')),
  ];
}

function validateProductUpload(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const response = {
    message: 'Validation failed.',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  };
  if (!req.file) {
    return res.status(400).json(response);
  }

  return fs.unlink(req.file.path)
    .then(() => res.status(400).json(response))
    .catch(next);
}

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     tags: [Admin]
 *     summary: List all products with exact inventory
 *     responses:
 *       200:
 *         description: Admin product inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminProduct'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/products', async (req, res, next) => {
  try {
    res.json(await listAdminProducts());
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/products/low-stock:
 *   get:
 *     tags: [Admin]
 *     summary: List products with 1 to 5 units remaining
 *     responses:
 *       200:
 *         description: Low-stock inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminProduct'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/products/low-stock', async (req, res, next) => {
  try {
    res.json(await listLowStockProducts());
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/products/out-of-stock:
 *   get:
 *     tags: [Admin]
 *     summary: List products with no units available
 *     responses:
 *       200:
 *         description: Out-of-stock inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminProduct'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/products/out-of-stock', async (req, res, next) => {
  try {
    res.json(await listOutOfStockProducts());
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/products:
 *   post:
 *     tags: [Admin]
 *     summary: Create a product with an uploaded image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/AdminProductUploadRequest'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProduct'
 *       400:
 *         description: Invalid product details or image
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post('/products',
  uploadProductImage,
  ...productFields({ optionalStock: true }),
  validateProductUpload,
  async (req, res, next) => {
    if (!req.file) {
      const error = new Error('A product image upload is required.');
      error.statusCode = 400;
      return next(error);
    }
    try {
      const product = await createProduct({
        ...req.body,
        imageUrl: `/uploads/products/${req.file.filename}`,
      });
      return res.status(201).json(product);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get product details and exact inventory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProduct'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.get('/products/:id',
  [param('id').isUUID().withMessage('A valid product ID is required.')],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await getAdminProductById(req.params.id));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update product details or upload a replacement image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/AdminProductUpdateRequest'
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProduct'
 *       400:
 *         description: Invalid product details or image
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.put('/products/:id',
  uploadProductImage,
  [
    param('id').isUUID().withMessage('A valid product ID is required.'),
    ...productFields({ optional: true }),
  ],
  validateProductUpload,
  async (req, res, next) => {
    try {
      const product = await updateProduct(req.params.id, {
        ...req.body,
        imageUrl: req.file ? `/uploads/products/${req.file.filename}` : undefined,
      });
      res.json(product);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product is part of an order
 */
router.delete('/products/:id',
  [param('id').isUUID().withMessage('A valid product ID is required.')],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await deleteAdminProduct(req.params.id));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/products/{id}/restock:
 *   put:
 *     tags: [Admin]
 *     summary: Increase product inventory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestockRequest'
 *     responses:
 *       200:
 *         description: Product inventory updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProduct'
 *       400:
 *         description: Invalid restock quantity or product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.put('/products/:id/restock',
  [
    param('id').isUUID().withMessage('A valid product ID is required.'),
    body('quantity').isInt({ min: 1 }).withMessage('Restock quantity must be at least one.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await restockProduct(req.params.id, Number(req.body.quantity)));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard totals
 *     responses:
 *       200:
 *         description: Current database totals
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminDashboard'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    res.json(await getDashboard());
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users
 *     responses:
 *       200:
 *         description: Users without password hashes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/users', async (req, res, next) => {
  try {
    res.json(await listUsers());
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User without password hash
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.get('/users/:id',
  [param('id').isUUID().withMessage('A valid user ID is required.')],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await getUserById(req.params.id));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   put:
 *     tags: [Admin]
 *     summary: Change a user's role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRoleUpdateRequest'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUser'
 *       400:
 *         description: Invalid role or user ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put('/users/:id/role',
  [
    param('id').isUUID().withMessage('A valid user ID is required.'),
    body('role').isIn(['customer', 'admin']).withMessage('Role must be customer or admin.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await updateUserRole(req.params.id, req.body.role));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required or attempted self-deletion
 *       404:
 *         description: User not found
 *       409:
 *         description: User has associated orders
 */
router.delete('/users/:id',
  [param('id').isUUID().withMessage('A valid user ID is required.')],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await deleteUser(req.params.id, req.user.id));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: List all orders
 *     responses:
 *       200:
 *         description: All orders, including customer details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminOrder'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/orders', async (req, res, next) => {
  try {
    res.json(await listAllOrders());
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/orders/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get any order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order with customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOrder'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id',
  [param('id').isUUID().withMessage('A valid order ID is required.')],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await getAdminOrderById(req.params.id));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/admin/orders/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update an order's status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: Updated order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOrder'
 *       400:
 *         description: Invalid status or order ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/status',
  [
    param('id').isUUID().withMessage('A valid order ID is required.'),
    body('status').isIn(orderStatuses).withMessage('Invalid order status.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await updateOrderStatus(req.params.id, req.body.status));
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
