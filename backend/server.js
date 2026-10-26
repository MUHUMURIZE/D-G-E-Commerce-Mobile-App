const app = require('./app');
const sequelize = require('./config/database');
const env = require('./config/env');
const { sequelize: db } = require('./models');

async function startServer() {
  try {
    await db.authenticate();
    await db.sync({ alter: false, force: false });
    app.listen(env.port, () => {
      console.info(`D&G e-commerce API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start D&G e-commerce API:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
