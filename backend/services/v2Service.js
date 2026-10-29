const { Op, fn, col } = require('sequelize');
const {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Review,
  WishlistItem,
  Notification,
  ProductView,
} = require('../models');
const { toCustomerProduct } = require('./productService');

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function reviewSummaries(productIds) {
  const rows = await Review.findAll({
    attributes: ['productId', [fn('AVG', col('rating')), 'averageRating'], [fn('COUNT', col('id')), 'reviewCount']],
    where: { productId: { [Op.in]: productIds }, status: 'approved' },
    group: ['productId'],
    raw: true,
  });
  return new Map(rows.map((row) => [row.productId, {
    rating: Number(Number(row.averageRating).toFixed(1)),
    reviewCount: Number(row.reviewCount),
  }]));
}

function withRating(product, summaries) {
  const summary = summaries.get(product.id);
  return {
    ...toCustomerProduct(product),
    rating: summary?.rating ?? Number(product.rating),
    reviewCount: summary?.reviewCount ?? 0,
  };
}

async function getProduct(productId) {
  const product = await Product.findByPk(productId);
  if (!product) throw createError(404, 'Product not found.');
  const summaries = await reviewSummaries([product.id]);
  return withRating(product, summaries);
}

async function listProducts({ search, category, minPrice, maxPrice, page = 1, limit = 100 }) {
  const where = {};
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 100));
  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { name: { [Op.iLike]: term } },
      sequelize.where(sequelize.cast(col('category'), 'text'), { [Op.iLike]: term }),
      { description: { [Op.iLike]: term } },
    ];
  }
  if (category) where.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price[Op.gte] = Number(minPrice);
    if (maxPrice !== undefined) where.price[Op.lte] = Number(maxPrice);
  }
  const result = await Product.findAndCountAll({
    where,
    order: [['created_at', 'DESC'], ['name', 'ASC']],
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  });
  const summaries = await reviewSummaries(result.rows.map((product) => product.id));
  return {
    items: result.rows.map((product) => withRating(product, summaries)),
    page: safePage,
    pages: Math.max(1, Math.ceil(result.count / safeLimit)),
    total: result.count,
  };
}

async function getSuggestions(query) {
  if (!query?.trim()) return [];
  const term = `%${query.trim()}%`;
  const products = await Product.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        sequelize.where(sequelize.cast(col('category'), 'text'), { [Op.iLike]: term }),
        { description: { [Op.iLike]: term } },
      ],
    },
    attributes: ['id', 'name', 'category'],
    order: [['name', 'ASC']],
    limit: 6,
  });
  return products.map(({ id, name, category }) => ({ id, name, category }));
}

async function getReviews(productId, userId) {
  const reviews = await Review.findAll({
    where: { productId, status: 'approved' },
    include: [{ model: User, attributes: ['id', 'fullName'] }],
    order: [['created_at', 'DESC']],
  });
  let canReview = false;
  let currentReview = null;
  if (userId) {
    currentReview = await Review.findOne({ where: { productId, userId } });
    const purchase = await OrderItem.findOne({
      where: { productId },
      include: [{ model: Order, required: true, where: { userId }, attributes: [] }],
    });
    canReview = Boolean(purchase && !currentReview);
  }
  return { items: reviews, canReview, currentReview };
}

async function createReview(userId, productId, input) {
  const product = await Product.findByPk(productId);
  if (!product) throw createError(404, 'Product not found.');
  const purchase = await OrderItem.findOne({
    where: { productId },
    include: [{ model: Order, required: true, where: { userId }, attributes: [] }],
  });
  if (!purchase) throw createError(403, 'You can review products included in your orders only.');
  const existing = await Review.findOne({ where: { productId, userId } });
  if (existing) throw createError(409, 'You have already reviewed this product.');
  try {
    return await Review.create({
      userId,
      productId,
      rating: Number(input.rating),
      title: input.title.trim(),
      comment: input.comment.trim(),
      status: 'pending',
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createError(409, 'You have already reviewed this product.');
    }
    throw error;
  }
}

async function listMyReviews(userId) {
  return Review.findAll({
    where: { userId },
    include: [{ model: Product, attributes: ['id', 'name', 'imageUrl'] }],
    order: [['created_at', 'DESC']],
    limit: 20,
  });
}

async function listAdminReviews(status) {
  const where = status && status !== 'all' ? { status } : {};
  return Review.findAll({
    where,
    include: [
      { model: User, attributes: ['id', 'fullName', 'email'] },
      { model: Product, attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  });
}

async function approveReview(reviewId) {
  return sequelize.transaction(async (transaction) => {
    const review = await Review.findByPk(reviewId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!review) throw createError(404, 'Review not found.');
    if (review.status !== 'approved') {
      await review.update({ status: 'approved' }, { transaction });
      await Notification.create({
        userId: review.userId,
        title: 'Review approved',
        description: `Your review of this product is now visible.`,
        type: 'review_approved',
        entityId: review.productId,
      }, { transaction });
    }
    return review;
  });
}

async function deleteReview(reviewId) {
  const review = await Review.findByPk(reviewId);
  if (!review) throw createError(404, 'Review not found.');
  await review.destroy();
  return { message: 'Review removed.' };
}

async function listWishlist(userId) {
  return WishlistItem.findAll({
    where: { userId },
    include: [{ model: Product }],
    order: [['created_at', 'DESC']],
  });
}

async function addWishlistItem(userId, productId) {
  const product = await Product.findByPk(productId);
  if (!product) throw createError(404, 'Product not found.');
  const [item] = await WishlistItem.findOrCreate({ where: { userId, productId } });
  return item.reload({ include: [{ model: Product }] });
}

async function removeWishlistItem(userId, productId) {
  await WishlistItem.destroy({ where: { userId, productId } });
  return { message: 'Wishlist item removed.' };
}

async function listNotifications(userId) {
  return Notification.findAll({ where: { userId }, order: [['created_at', 'DESC']] });
}

async function markNotificationRead(userId, notificationId) {
  const notification = await Notification.findOne({ where: { id: notificationId, userId } });
  if (!notification) throw createError(404, 'Notification not found.');
  if (!notification.readAt) await notification.update({ readAt: new Date() });
  return notification;
}

async function markAllNotificationsRead(userId) {
  await Notification.update({ readAt: new Date() }, { where: { userId, readAt: null } });
  return { message: 'Notifications marked as read.' };
}

async function recordProductView(productId, userId) {
  if (!(await Product.findByPk(productId, { attributes: ['id'] }))) throw createError(404, 'Product not found.');
  await ProductView.create({ productId, userId });
  return { message: 'Product view recorded.' };
}

async function getAnalytics() {
  const topSellingRows = await OrderItem.findAll({
    attributes: ['productId', [fn('SUM', col('quantity')), 'unitsSold']],
    include: [{ model: Product, attributes: ['id', 'name', 'stock'] }],
    group: ['productId', 'Product.id'],
    order: [[fn('SUM', col('quantity')), 'DESC']],
    limit: 5,
  });
  const views = await ProductView.findAll({
    attributes: ['productId', [fn('COUNT', col('id')), 'views']],
    group: ['productId'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    limit: 5,
    raw: true,
  });
  const reviewCounts = await Review.findAll({
    attributes: ['productId', [fn('COUNT', col('id')), 'reviewCount']],
    where: { status: 'approved' },
    group: ['productId'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    limit: 5,
    raw: true,
  });
  const ids = [...new Set([...views, ...reviewCounts].map((row) => row.productId))];
  const products = await Product.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id', 'name'] });
  const productNames = new Map(products.map((product) => [product.id, product.name]));
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setUTCDate(1);
  sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5);
  const monthlyOrders = await Order.findAll({
    where: { created_at: { [Op.gte]: sixMonthsAgo } },
    attributes: ['created_at', 'totalAmount'],
    raw: true,
  });
  const months = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(Date.UTC(sixMonthsAgo.getUTCFullYear(), sixMonthsAgo.getUTCMonth() + index, 1));
    const key = month.toISOString().slice(0, 7);
    return { month: key, orders: 0, revenue: 0 };
  });
  const byMonth = new Map(months.map((month) => [month.month, month]));
  for (const order of monthlyOrders) {
    const month = byMonth.get(new Date(order.created_at).toISOString().slice(0, 7));
    if (month) {
      month.orders += 1;
      month.revenue += Number(order.totalAmount);
    }
  }
  const lowestStock = await Product.findAll({ order: [['stock', 'ASC'], ['name', 'ASC']], limit: 5 });
  return {
    topSellingProducts: topSellingRows.map((row) => ({
      id: row.Product.id, name: row.Product.name, stock: row.Product.stock, unitsSold: Number(row.get('unitsSold')),
    })),
    mostViewedProducts: views.map((row) => ({ id: row.productId, name: productNames.get(row.productId) || '', views: Number(row.views) })),
    mostReviewedProducts: reviewCounts.map((row) => ({ id: row.productId, name: productNames.get(row.productId) || '', reviewCount: Number(row.reviewCount) })),
    lowestStockProducts: lowestStock.map(({ id, name, stock }) => ({ id, name, stock })),
    monthlyOrders: months.map(({ month, orders }) => ({ month, orders })),
    monthlyRevenue: months.map(({ month, revenue }) => ({ month, revenue })),
  };
}

module.exports = {
  listProducts,
  getProduct,
  getSuggestions,
  getReviews,
  createReview,
  listMyReviews,
  listAdminReviews,
  approveReview,
  deleteReview,
  listWishlist,
  addWishlistItem,
  removeWishlistItem,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  recordProductView,
  getAnalytics,
};
