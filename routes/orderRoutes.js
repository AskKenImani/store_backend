const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Order = require('../models/Order');

const router = express.Router();

router.post('/', authMiddleware, orderController.createOrder);


router.get('/my', authMiddleware, async (req, res) => {
  try {
    
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Failed to fetch your orders', error: err.message });
  }
});


router.get('/', authMiddleware, roleMiddleware('admin'), orderController.getOrders);
// If your orderController.getOrders does NOT return all orders,
// we can replace this with direct logic using Order.find()

module.exports = router;
