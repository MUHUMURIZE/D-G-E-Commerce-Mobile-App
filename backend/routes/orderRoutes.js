const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { createOrder, listOrders, getOrderById } = require('../services/orderService');
const { orderStatuses, updateOrderStatus } = require('../services/adminService');

const router = express.Router();

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order for the authenticated customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreateRequest'
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order details
 *       401:
 *         description: Authentication required
 */
router.post('/',
  authenticateToken,
  [
    body('items').isArray({ min: 1 }).withMessage('Order items are required.'),
    body('address').isObject().withMessage('Shipping address is required.'),
    body('paymentMethod').optional().isIn(['mobile_money', 'card', 'cash_on_delivery']).withMessage('Unsupported payment method.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const order = await createOrder(req.user.id, req.body);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders belonging to the authenticated customer
 *     responses:
 *       200:
 *         description: Customer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Authentication required
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const orders = await listOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get one order belonging to the authenticated customer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Customer order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const order = await getOrderById(req.user.id, req.params.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update an order status (legacy route; use the admin route)
 *     deprecated: true
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
 *         description: Invalid order status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
router.put('/:id/status',
  authenticateToken,
  requireAdmin,
  [
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
