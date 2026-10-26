const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'total_amount', validate: { min: 0 } },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Packing', 'Shipped', 'Delivered'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('mobile_money', 'card', 'cash_on_delivery'),
    allowNull: false,
    field: 'payment_method',
  },
  shippingAddress: { type: DataTypes.JSONB, allowNull: false, field: 'shipping_address' },
}, { tableName: 'orders', indexes: [{ fields: ['user_id', 'created_at'] }] });

module.exports = Order;
