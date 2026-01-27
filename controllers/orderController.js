const Order = require("../models/Order");
const Payment = require("../models/Payment");

// Create order
const createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    const order = await Order.create({
      user: req.user._id,
      products,
      totalAmount,
      paymentStatus: "pending",
    });

    res.status(201).json({ order });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// User orders
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("products.product");

  res.json({ orders });
};

// Admin: all orders
const getOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email role")
    .populate("products.product")
    .sort({ createdAt: -1 });

  res.json({ orders });
};

// Resolve order after 1 hour
const resolveOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.paymentStatus !== "pending") {
    return res.status(400).json({ message: "Order already resolved" });
  }

  const oneHour = 60 * 60 * 1000;
  if (Date.now() - order.createdAt.getTime() < oneHour) {
    return res.status(400).json({
      message: "Order must be pending for at least 1 hour",
    });
  }

  const payment = await Payment.findOne({
    order: order._id,
    paymentStatus: "completed",
  });

  order.paymentStatus = payment ? "completed" : "failed";
  await order.save();

  res.json({ status: order.paymentStatus });
};

// Admin: delete order
const deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  await Payment.deleteMany({ order: req.params.id });
  res.json({ message: "Order deleted" });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  resolveOrder,
  deleteOrder,
};
