const axios = require('axios');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const payWithPaystack = async (req, res) => {
  const { amount, orderId, email } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const paymentUrl = `https://api.paystack.co/transaction/initialize`;
    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };

    const paymentData = {
      email,
      amount: amount * 100, // Paystack expects amount in kobo (100 kobo = 1 Naira)
      order_id: orderId,
    };

    const { data } = await axios.post(paymentUrl, paymentData, { headers });

    // Store payment information in the database
    const payment = new Payment({
      user: order.user,
      order: order._id,
      paymentMethod: 'Paystack',
      paymentStatus: 'pending',
    });

    await payment.save();
    
    res.status(200).json({ message: 'Payment initialized', paymentUrl: data.data.authorization_url });
  } catch (err) {
    res.status(500).json({ message: 'Error initializing payment', error: err.message });
  }
};

const verifyPayment = async (req, res) => {
  const { reference } = req.body;

  try {
    const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    };

    const { data } = await axios.get(verifyUrl, { headers });

    if (data.status === 'success') {
      const payment = await Payment.findOneAndUpdate(
        { order: data.data.order_id },
        { paymentStatus: 'completed' },
        { new: true }
      );

      res.status(200).json({ message: 'Payment successful', payment });
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error verifying payment', error: err.message });
  }
};

module.exports = { payWithPaystack, verifyPayment };
