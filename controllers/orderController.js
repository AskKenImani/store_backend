const Order = require('../models/Order');

const createOrder = async (req, res) => {
  const { user, products, totalAmount } = req.body;

  try {
    const order = new Order({
      user,
      products,
      totalAmount,
      paymentStatus: 'pending',
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
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

module.exports = { createOrder, getOrders };
