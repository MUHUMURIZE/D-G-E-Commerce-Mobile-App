const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  productId: { type: DataTypes.UUID, allowNull: false, field: 'product_id' },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  title: { type: DataTypes.STRING(120), allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.STRING(16),
    allowNull: false,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'approved']] },
  },
}, {
  tableName: 'reviews',
  indexes: [
    { unique: true, fields: ['user_id', 'product_id'] },
    { fields: ['product_id', 'status', 'created_at'] },
  ],
});

module.exports = Review;
