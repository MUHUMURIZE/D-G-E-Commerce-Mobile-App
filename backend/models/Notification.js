const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  title: { type: DataTypes.STRING(180), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING(32), allowNull: false },
  entityId: { type: DataTypes.UUID, allowNull: true, field: 'entity_id' },
  readAt: { type: DataTypes.DATE, allowNull: true, field: 'read_at' },
}, {
  tableName: 'notifications',
  indexes: [{ fields: ['user_id', 'read_at', 'created_at'] }],
});

module.exports = Notification;
