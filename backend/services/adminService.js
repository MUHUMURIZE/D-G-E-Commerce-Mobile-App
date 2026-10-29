const { Op } = require("sequelize");
const { CartItem, Order, OrderItem, Product, User, notifyProductRestocked } = require("../models");
const {
  createProduct,
  updateProduct,
  deleteProduct: removeProduct,
} = require("./productService");

const orderStatuses = [
  "Pending",
  "Confirmed",
  "Packing",
  "Shipped",
  "Delivered",
];

const userAttributes = [
  "id",
  "fullName",
  "email",
  "phone",
  "role",
  "created_at",
  "updated_at",
];

async function getDashboard() {
  const [totalUsers, totalProducts, totalOrders, revenue, lowStockProducts, outOfStockProducts] = await Promise.all([
    User.count(),
    Product.count(),
    Order.count(),
    Order.sum("totalAmount"),
    Product.count({ where: { stock: { [Op.gt]: 0, [Op.lte]: 5 } } }),
    Product.count({ where: { stock: 0 } }),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: Number(revenue || 0),
    lowStockProducts,
    outOfStockProducts,
  };
}

async function listAdminProducts() {
  return Product.findAll({ order: [["created_at", "DESC"], ["name", "ASC"]] });
}

async function getAdminProductById(productId) {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw createError(404, "Product not found.");
  }
  return product;
}

async function listLowStockProducts() {
  return Product.findAll({
    where: { stock: { [Op.gt]: 0, [Op.lte]: 5 } },
    order: [["stock", "ASC"], ["name", "ASC"]],
  });
}

async function listOutOfStockProducts() {
  return Product.findAll({
    where: { stock: 0 },
    order: [["name", "ASC"]],
  });
}

async function restockProduct(productId, quantity) {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw createError(404, "Product not found.");
  }

  await product.increment("stock", { by: quantity });
  await product.reload();
  await notifyProductRestocked(product);
  return product;
}

async function deleteAdminProduct(productId) {
  if (await OrderItem.count({ where: { productId } })) {
    throw createError(409, "This product cannot be deleted because it appears in an order.");
  }
  await CartItem.destroy({ where: { productId } });
  return removeProduct(productId);
}

async function listUsers() {
  return User.findAll({
    attributes: userAttributes,
    order: [["created_at", "DESC"]],
  });
}

async function getUserById(userId) {
  const user = await User.findByPk(userId, {
    attributes: userAttributes,
  });

  if (!user) {
    throw createError(404, "User not found.");
  }

  return user;
}

async function updateUserRole(userId, role) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw createError(404, "User not found.");
  }

  await user.update({ role });

  return user;
}

async function deleteUser(userId, actingAdminId) {
  if (userId === actingAdminId) {
    throw createError(403, "You cannot delete your own admin account.");
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw createError(404, "User not found.");
  }

  if (await Order.count({ where: { userId } })) {
    throw createError(
      409,
      "This user cannot be deleted because they have orders.",
    );
  }

  try {
    await user.destroy();
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw createError(
        409,
        "This user cannot be deleted because they have associated records.",
      );
    }

    throw error;
  }

  return {
    message: "User deleted successfully.",
  };
}

async function listAllOrders() {
  return Order.findAll({
    include: [
      {
        model: OrderItem,
        as: "items",
      },
      {
        model: User,
        attributes: ["id", "fullName", "email", "phone"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

async function getAdminOrderById(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        as: "items",
      },
      {
        model: User,
        attributes: ["id", "fullName", "email", "phone"],
      },
    ],
  });

  if (!order) {
    throw createError(404, "Order not found.");
  }

  return order;
}

async function updateOrderStatus(orderId, status) {
  if (!orderStatuses.includes(status)) {
    throw createError(400, "Invalid order status.");
  }

  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        as: "items",
      },
      {
        model: User,
        attributes: ["id", "fullName", "email", "phone"],
      },
    ],
  });

  if (!order) {
    throw createError(404, "Order not found.");
  }

  await order.update({ status });

  return order;
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  orderStatuses,
  getDashboard,
  listAdminProducts,
  getAdminProductById,
  listLowStockProducts,
  listOutOfStockProducts,
  createProduct,
  updateProduct,
  deleteAdminProduct,
  restockProduct,
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  listAllOrders,
  getAdminOrderById,
  updateOrderStatus,
};
