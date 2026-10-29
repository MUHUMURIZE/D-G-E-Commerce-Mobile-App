const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const RevokedToken = require('./RevokedToken');
const PasswordResetToken = require('./PasswordResetToken');
const Review = require('./Review');
const WishlistItem = require('./WishlistItem');
const Notification = require('./Notification');
const ProductView = require('./ProductView');

User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'RESTRICT' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(PasswordResetToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(WishlistItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
WishlistItem.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(WishlistItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(ProductView, { foreignKey: 'productId', onDelete: 'CASCADE' });
ProductView.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(ProductView, { foreignKey: 'userId', onDelete: 'SET NULL' });
ProductView.belongsTo(User, { foreignKey: 'userId' });

Order.addHook('afterCreate', async (order, options) => {
  await Notification.create({
    userId: order.userId,
    title: 'Order created',
    description: `Your order ${order.id.slice(-8).toUpperCase()} has been received.`,
    type: 'order_created',
    entityId: order.id,
  }, { transaction: options.transaction });
});

Order.addHook('beforeUpdate', (order, options) => {
  options.v2StatusBefore = order.previous('status');
});

Order.addHook('afterUpdate', async (order, options) => {
  if (order.status === options.v2StatusBefore) return;
  await Notification.create({
    userId: order.userId,
    title: `Order ${order.status.toLowerCase()}`,
    description: `Your order ${order.id.slice(-8).toUpperCase()} is now ${order.status.toLowerCase()}.`,
    type: `order_${order.status.toLowerCase()}`,
    entityId: order.id,
  }, { transaction: options.transaction });
});

async function notifyProductRestocked(product, options = {}) {
  const wishlist = await WishlistItem.findAll({
    where: { productId: product.id },
    attributes: ['userId'],
    transaction: options.transaction,
  });
  if (wishlist.length) {
    await Notification.bulkCreate(wishlist.map(({ userId }) => ({
      userId,
      title: 'Product restocked',
      description: `${product.name} is back in stock.`,
      type: 'product_restocked',
      entityId: product.id,
    })), { transaction: options.transaction });
  }
}

Product.addHook('beforeUpdate', (product, options) => {
  options.v2StockBefore = Number(product.previous('stock'));
});

Product.addHook('afterUpdate', async (product, options) => {
  if (Number(product.stock) <= options.v2StockBefore) return;
  await notifyProductRestocked(product, options);
});

module.exports = {
  sequelize,
  User,
  Product,
  CartItem,
  Order,
  OrderItem,
  RevokedToken,
  PasswordResetToken,
  Review,
  WishlistItem,
  Notification,
  ProductView,
  notifyProductRestocked,
};
