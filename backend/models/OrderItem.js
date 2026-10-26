const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
  productId: { type: DataTypes.UUID, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_price' },
}, { tableName: 'order_items' });

module.exports = OrderItem;
