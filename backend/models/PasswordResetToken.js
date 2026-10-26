const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'token_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  usedAt: { type: DataTypes.DATE, allowNull: true, field: 'used_at' },
}, {
  tableName: 'password_reset_tokens',
  indexes: [{ fields: ['user_id'] }, { fields: ['expires_at'] }],
});

module.exports = PasswordResetToken;
