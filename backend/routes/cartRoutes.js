const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { getCart, addOrUpdateCartItem, updateCartItem, removeCartItem, clearCart } = require('../services/cartService');

const router = express.Router();

/**
 * @openapi
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the authenticated customer's cart
 *     responses:
 *       200:
 *         description: Cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       401:
 *         description: Authentication required
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const items = await getCart(req.user.id);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: Add or replace a product in the authenticated customer's cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemRequest'
 *     responses:
 *       200:
 *         description: Cart updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid quantity
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 */
router.post('/',
  authenticateToken,
  [
    body('productId').notEmpty().withMessage('Product ID is required.'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const response = await addOrUpdateCartItem(req.user.id, req.body);
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/cart/{id}:
 *   put:
 *     tags: [Cart]
 *     summary: Update a cart item's quantity
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
 *             $ref: '#/components/schemas/CartItemQuantityRequest'
 *     responses:
 *       200:
 *         description: Cart item updated or removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid quantity
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart item not found
 */
router.put('/:id',
  authenticateToken,
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.')],
  validateRequest,
  async (req, res, next) => {
    try {
      const response = await updateCartItem(req.user.id, req.params.id, Number(req.body.quantity));
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/cart/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove a cart item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cart item removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart item not found
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const response = await removeCartItem(req.user.id, req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear the authenticated customer's cart
 *     responses:
 *       200:
 *         description: Cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Authentication required
 */
router.delete('/', authenticateToken, async (req, res, next) => {
  try {
    const response = await clearCart(req.user.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
