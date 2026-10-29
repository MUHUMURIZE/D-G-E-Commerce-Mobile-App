const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductView = sequelize.define('ProductView', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.UUID, allowNull: false, field: 'product_id' },
  userId: { type: DataTypes.UUID, allowNull: true, field: 'user_id' },
}, {
  tableName: 'product_views',
  indexes: [{ fields: ['product_id', 'created_at'] }],
});

module.exports = ProductView;
