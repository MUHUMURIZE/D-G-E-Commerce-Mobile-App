const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  productId: { type: DataTypes.UUID, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
}, {
  tableName: 'cart_items',
  indexes: [{ unique: true, fields: ['user_id', 'product_id'] }],
});

module.exports = CartItem;
