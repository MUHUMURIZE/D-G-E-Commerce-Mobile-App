const express = require('express');
const { body, query } = require('express-validator');
const { listProducts, getProductById, toCustomerProduct, createProduct, updateProduct, deleteProduct } = require('../services/productService');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products with filters and pagination
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product list
 */
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await listProducts({
        search: req.query.search,
        category: req.query.category,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        page: req.query.page,
        limit: req.query.limit,
      });
      res.json(result.items);
    } catch (error) {
      next(error);
    }
  },
);

router.get('/:id', async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    res.json(toCustomerProduct(product));
  } catch (error) {
    next(error);
  }
});

router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Product name is required.'),
    body('category').notEmpty().withMessage('Category is required.'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description is required.'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be greater than or equal to zero.'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be zero or greater.'),
    body('imageUrl').isURL().withMessage('A valid image URL is required.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const product = await createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },
);

router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Product name is required.'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be greater than or equal to zero.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be zero or greater.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const product = await updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const response = await deleteProduct(req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
