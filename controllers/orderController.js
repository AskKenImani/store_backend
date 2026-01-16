const Order = require('../models/Order');

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

module.exports = { createOrder, getOrders };
