const { Op } = require("sequelize");
const { sequelize, Order, OrderItem, Product } = require("../models");

async function createOrder(userId, payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) {
    const error = new Error("At least one item is required to place an order.");
    error.statusCode = 400;
    throw error;
  }

  const productIds = [
    ...new Set(items.map((item) => item.productId || item.product?.id)),
  ];
  return sequelize.transaction(async (transaction) => {
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const productMap = new Map(products.map((product) => [product.id, product]));
    const requestedByProduct = new Map();

    for (const item of items) {
      const productId = item.productId || item.product?.id;
      const product = productMap.get(productId);
      if (!product) {
        const error = new Error("One or more products are no longer available.");
        error.statusCode = 400;
        throw error;
      }

      const quantity = Number(item.quantity || 0);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error(
          "Each cart item must have a quantity greater than zero.",
        );
        error.statusCode = 400;
        throw error;
      }

      requestedByProduct.set(
        productId,
        (requestedByProduct.get(productId) || 0) + quantity,
      );
    }

    for (const [productId, quantity] of requestedByProduct) {
      const product = productMap.get(productId);
      if (quantity > product.stock) {
        const error = new Error(
          `Only ${product.stock} items available in stock.`,
        );
        error.statusCode = 400;
        throw error;
      }
    }

    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId || item.product?.id);
      const quantity = Number(item.quantity);
      const unitPrice = Number(product.price);
      totalAmount += unitPrice * quantity;
      return {
        productId: product.id,
        quantity,
        unitPrice,
      };
    });

    for (const [productId, quantity] of requestedByProduct) {
      const product = productMap.get(productId);
      await product.update({ stock: product.stock - quantity }, { transaction });
    }

    const order = await Order.create({
      userId,
      totalAmount,
      status: "Pending",
      paymentMethod: payload.paymentMethod || "mobile_money",
      shippingAddress: payload.address || payload.shippingAddress || {},
    }, { transaction });

    await Promise.all(
      orderItems.map((item) => OrderItem.create({ ...item, orderId: order.id }, { transaction })),
    );

    return order;
  });
}

async function listOrders(userId) {
  return Order.findAll({
    where: { userId },
    include: [{ model: OrderItem, as: "items" }],
    order: [["created_at", "DESC"]],
  });
}

async function getOrderById(userId, orderId) {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: [{ model: OrderItem, as: "items" }],
  });

  if (!order) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  return order;
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
};
