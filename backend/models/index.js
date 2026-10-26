const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const RevokedToken = require('./RevokedToken');
const PasswordResetToken = require('./PasswordResetToken');

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

module.exports = {
  sequelize,
  User,
  Product,
  CartItem,
  Order,
  OrderItem,
  RevokedToken,
  PasswordResetToken,
};
