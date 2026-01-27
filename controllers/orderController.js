const Order = require('../models/Order');
console.log('Order model:', Order);

const Payment = require("../models/Payment");

const createOrder = async (req, res) => {
  const { products, totalAmount } = req.body;
  const userId = req.user._id; // from authMiddleware

  try {
    const order = new Order({
      user: userId,
      products,
      totalAmount,
      paymentStatus: 'pending',
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};


const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('products');
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// Resolve pending order
const resolveOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Order already resolved" });
    }

    // check if older than 1 hour
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - new Date(order.createdAt).getTime() < oneHour) {
      return res.status(400).json({
        message: "Order must be pending for at least 1 hour",
      });
    }

    // check payment
    const payment = await Payment.findOne({
      order: order._id,
      paymentStatus: "completed",
    });

    order.paymentStatus = payment ? "success" : "failed";
    await order.save();

    res.json({
      message: "Order resolved",
      status: order.paymentStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getOrders, resolveOrder, deleteOrder, };