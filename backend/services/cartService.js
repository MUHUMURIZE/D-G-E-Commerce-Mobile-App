const { CartItem, Product } = require("../models");
const { toCustomerProduct } = require("./productService");

async function getCart(userId) {
  const items = await CartItem.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        attributes: [
          "id",
          "name",
          "category",
          "description",
          "price",
          "stock",
          "imageUrl",
          "rating",
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: toCustomerProduct(item.Product),
  }));
}

async function addOrUpdateCartItem(userId, item) {
  const product = await Product.findByPk(item.productId);
  if (!product) {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  if (item.quantity <= 0) {
    const error = new Error("Quantity must be greater than zero.");
    error.statusCode = 400;
    throw error;
  }

  if (item.quantity > product.stock) {
    const error = new Error(`Only ${product.stock} items available in stock.`);
    error.statusCode = 400;
    throw error;
  }

  const [cartItem] = await CartItem.findOrCreate({
    where: { userId, productId: item.productId },
    defaults: { quantity: item.quantity },
  });

  if (cartItem.quantity !== item.quantity) {
    await cartItem.update({ quantity: item.quantity });
  }

  return { message: "Cart updated successfully." };
}

async function updateCartItem(userId, cartItemId, quantity) {
  const cartItem = await CartItem.findOne({
    where: { id: cartItemId, userId },
  });
  if (!cartItem) {
    const error = new Error("Cart item not found.");
    error.statusCode = 404;
    throw error;
  }

  if (quantity <= 0) {
    await cartItem.destroy();
    return { message: "Cart item removed." };
  }

  const product = await Product.findByPk(cartItem.productId);
  if (quantity > product.stock) {
    const error = new Error(`Only ${product.stock} items available in stock.`);
    error.statusCode = 400;
    throw error;
  }

  await cartItem.update({ quantity });
  return { message: "Cart item updated." };
}

async function removeCartItem(userId, cartItemId) {
  const result = await CartItem.destroy({ where: { id: cartItemId, userId } });
  if (!result) {
    const error = new Error("Cart item not found.");
    error.statusCode = 404;
    throw error;
  }
  return { message: "Cart item removed." };
}

async function clearCart(userId) {
  await CartItem.destroy({ where: { userId } });
  return { message: "Cart cleared." };
}

module.exports = {
  getCart,
  addOrUpdateCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
