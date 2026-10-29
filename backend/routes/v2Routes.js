const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const service = require('../services/v2Service');

const router = express.Router();

function requireCustomer(req, res, next) {
  if (req.user?.role !== 'customer') return res.status(403).json({ message: 'Customer access required.' });
  return next();
}

router.get('/products',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim().isLength({ max: 100 }),
    query('category').optional().isIn(['Clothes', 'Shoes', 'Bags', 'Jewellery', 'Cosmetics', 'Household Equipment']),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.listProducts(req.query));
    } catch (error) {
      next(error);
    }
  },
);

router.get('/products/suggestions',
  [query('q').trim().isLength({ min: 2, max: 100 })],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.getSuggestions(req.query.q));
    } catch (error) {
      next(error);
    }
  },
);

router.get('/products/:id',
  [param('id').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.getProduct(req.params.id));
    } catch (error) {
      next(error);
    }
  },
);

router.post('/products/:id/views',
  authenticateToken,
  requireCustomer,
  [param('id').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      res.status(201).json(await service.recordProductView(req.params.id, req.user.id));
    } catch (error) {
      next(error);
    }
  },
);

router.get('/products/:id/reviews',
  authenticateToken,
  requireCustomer,
  [param('id').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.getReviews(req.params.id, req.user.id));
    } catch (error) {
      next(error);
    }
  },
);

router.post('/products/:id/reviews',
  authenticateToken,
  requireCustomer,
  [
    param('id').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('title').trim().isLength({ min: 2, max: 120 }),
    body('comment').trim().isLength({ min: 5, max: 2000 }),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      res.status(201).json(await service.createReview(req.user.id, req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  },
);

router.get('/reviews/me', authenticateToken, requireCustomer, async (req, res, next) => {
  try {
    res.json(await service.listMyReviews(req.user.id));
  } catch (error) {
    next(error);
  }
});

router.get('/wishlist', authenticateToken, requireCustomer, async (req, res, next) => {
  try {
    res.json(await service.listWishlist(req.user.id));
  } catch (error) {
    next(error);
  }
});

router.post('/wishlist',
  authenticateToken,
  requireCustomer,
  [body('productId').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      res.status(201).json(await service.addWishlistItem(req.user.id, req.body.productId));
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/wishlist/:productId',
  authenticateToken,
  requireCustomer,
  [param('productId').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.removeWishlistItem(req.user.id, req.params.productId));
    } catch (error) {
      next(error);
    }
  },
);

router.get('/notifications', authenticateToken, async (req, res, next) => {
  try {
    res.json(await service.listNotifications(req.user.id));
  } catch (error) {
    next(error);
  }
});

router.patch('/notifications/read-all', authenticateToken, async (req, res, next) => {
  try {
    res.json(await service.markAllNotificationsRead(req.user.id));
  } catch (error) {
    next(error);
  }
});

router.patch('/notifications/:id/read',
  authenticateToken,
  [param('id').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.markNotificationRead(req.user.id, req.params.id));
    } catch (error) {
      next(error);
    }
  },
);

router.get('/admin/analytics', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    res.json(await service.getAnalytics());
  } catch (error) {
    next(error);
  }
});

router.get('/admin/reviews',
  authenticateToken,
  requireAdmin,
  [query('status').optional().isIn(['all', 'pending', 'approved'])],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.listAdminReviews(req.query.status));
    } catch (error) {
      next(error);
    }
  },
);

router.patch('/admin/reviews/:id/approve',
  authenticateToken,
  requireAdmin,
  [param('id').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.approveReview(req.params.id));
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/admin/reviews/:id',
  authenticateToken,
  requireAdmin,
  [param('id').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      res.json(await service.deleteReview(req.params.id));
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
