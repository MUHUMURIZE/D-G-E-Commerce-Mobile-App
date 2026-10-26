const { sequelize, Product } = require('../models');
const { buildCatalog } = require('./catalog');

async function seed() {
  await sequelize.authenticate();
  const products = buildCatalog();
  for (const product of products) {
    await Product.findOrCreate({ where: { name: product.name }, defaults: product });
  }
  console.info(`Catalog seed complete: ${products.length} products across 6 categories.`);
}

seed()
  .catch((error) => {
    console.error('Catalog seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => sequelize.close());
