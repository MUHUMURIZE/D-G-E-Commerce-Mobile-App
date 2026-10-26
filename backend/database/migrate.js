const fs = require('node:fs/promises');
const path = require('node:path');
const { sequelize } = require('../models');

async function migrate() {
  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await sequelize.query(schema);
  console.info('Database schema applied.');
}

migrate()
  .catch((error) => {
    console.error('Database migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => sequelize.close());
