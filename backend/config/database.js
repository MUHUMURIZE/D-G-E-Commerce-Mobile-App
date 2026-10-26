const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? (message) => console.info(message) : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: env.nodeEnv === 'production' ? { ssl: { require: true, rejectUnauthorized: true } } : {},
  define: {
    underscored: true,
  },
});

module.exports = sequelize;
