const { Op } = require('sequelize');
const { Product } = require('../models');

function getAvailabilityStatus(stock) {
  const available = Number(stock);
  if (available === 0) return 'Out Of Stock';
  if (available <= 5) return `Only ${available} Left`;
  return 'In Stock';
}

function toCustomerProduct(product) {
  const { stock, ...customerProduct } = product.toJSON();
  return {
    ...customerProduct,
    price: Number(customerProduct.price),
    rating: Number(customerProduct.rating),
    availabilityStatus: getAvailabilityStatus(Number(stock)),
  };
}

async function listProducts({ search, category, minPrice, maxPrice, page = 1, limit = 12 }) {
  const where = {};
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Number(limit) : 12;

  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }

  if (category) {
    where.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price[Op.gte] = Number(minPrice);
    if (maxPrice !== undefined) where.price[Op.lte] = Number(maxPrice);
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    order: [['created_at', 'DESC'], ['name', 'ASC']],
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  });

  return {
    items: rows.map(toCustomerProduct),
    page: safePage,
    pages: Math.max(1, Math.ceil(count / safeLimit)),
    total: count,
  };
}

async function getProductById(id) {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }
  return product;
}

async function createProduct(data) {
  const product = await Product.create({
    name: data.name,
    category: data.category,
    description: data.description,
    price: Number(data.price),
    stock: Number(data.stock ?? 0),
    imageUrl: data.imageUrl,
    rating: Number(data.rating ?? 0),
  });
  return product;
}

async function updateProduct(id, data) {
  const product = await getProductById(id);
  await product.update({
    name: data.name ?? product.name,
    category: data.category ?? product.category,
    description: data.description ?? product.description,
    price: data.price !== undefined ? Number(data.price) : product.price,
    stock: data.stock !== undefined ? Number(data.stock) : product.stock,
    imageUrl: data.imageUrl ?? product.imageUrl,
    rating: data.rating !== undefined ? Number(data.rating) : product.rating,
  });
  return product;
}

async function deleteProduct(id) {
  const product = await getProductById(id);
  await product.destroy();
  return { message: 'Product deleted successfully.' };
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAvailabilityStatus,
  toCustomerProduct,
};
