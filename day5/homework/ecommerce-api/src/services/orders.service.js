/**
 * Orders Service
 */

"use strict";

const Order = require("../models/Order");
const Product = require("../models/Product");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createOrder(customerId, data) {
  const { items, shippingAddress, note } = data;

  const products = await Promise.all(
    items.map((item) => Product.findById(item.productId))
  );

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const item = items[index];

    if (!product) {
      throw createHttpError(400, `Product ${item.productId} not found`);
    }

    if (product.stock < item.quantity) {
      throw createHttpError(400, `Insufficient stock for ${product.name}`);
    }
  }

  const orderItems = items.map((item, index) => ({
    product: products[index]._id,
    quantity: item.quantity,
    priceAtOrder: products[index].price,
    productName: products[index].name,
  }));

  const order = await Order.create({
    customer: customerId,
    items: orderItems,
    shippingAddress,
    note,
  });

  await Promise.all(
    items.map((item, index) =>
      Product.findByIdAndUpdate(products[index]._id, {
        $inc: { stock: -item.quantity },
      })
    )
  );

  await order.populate("items.product", "name price images");
  await order.populate("customer", "firstName lastName email");

  return order;
}

async function getMyOrders(customerId, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const query = { customer: customerId };

  const [data, total] = await Promise.all([
    Order.find(query)
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getOrderById(id, requesterId, requesterRole) {
  const order = await Order.findById(id)
    .populate("items.product", "name price images")
    .populate("customer", "firstName lastName email");

  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  const ownerId = order.customer._id.toString();

  if (requesterRole !== "admin" && ownerId !== requesterId.toString()) {
    throw createHttpError(403, "You don't have permission to view this order");
  }

  return order;
}

async function cancelOrder(id, customerId, reason) {
  const order = await Order.findById(id);

  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  if (order.customer.toString() !== customerId.toString()) {
    throw createHttpError(403, "You don't have permission to cancel this order");
  }

  if (order.status !== "pending") {
    throw createHttpError(400, "Only pending orders can be cancelled");
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  await order.save();

  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    )
  );

  return order;
}

async function getAllOrders(filters = {}, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.customerId) {
    query.customer = filters.customerId;
  }

  if (filters.fromDate || filters.toDate) {
    query.createdAt = {};

    if (filters.fromDate) {
      query.createdAt.$gte = new Date(filters.fromDate);
    }

    if (filters.toDate) {
      query.createdAt.$lte = new Date(filters.toDate);
    }
  }

  const [data, total] = await Promise.all([
    Order.find(query)
      .populate("customer", "firstName lastName email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
};
