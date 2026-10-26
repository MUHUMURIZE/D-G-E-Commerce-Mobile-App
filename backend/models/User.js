const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fullName: { type: DataTypes.STRING(120), allowNull: false, field: 'full_name' },
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  phone: { type: DataTypes.STRING(32), allowNull: true },
  role: { type: DataTypes.ENUM('customer', 'admin'), allowNull: false, defaultValue: 'customer' },
}, { tableName: 'users', indexes: [{ unique: true, fields: ['email'] }] });

module.exports = User;
