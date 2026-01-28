const Order = require("../models/Order");
const Payment = require("../models/Payment");

// ✅ CREATE ORDER (Checkout entry point)
const createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const order = await Order.create({
      user: req.user._id,
      products,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// ✅ USER ORDERS
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("products.product")
    .sort({ createdAt: -1 });

  res.json({ orders });
};

// ✅ ADMIN: ALL ORDERS
const getOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email role")
    .populate("products.product")
    .sort({ createdAt: -1 });

  res.json({ orders });
};

// ✅ ADMIN: RESOLVE ORDER AFTER 1 HOUR
const resolveOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

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

// ✅ ADMIN: DELETE ORDER
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
