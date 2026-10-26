const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RevokedToken = sequelize.define('RevokedToken', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'token_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
}, { tableName: 'revoked_tokens', indexes: [{ fields: ['expires_at'] }] });

module.exports = RevokedToken;
