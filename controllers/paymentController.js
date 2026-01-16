const axios = require('axios');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const payWithPaystack = async (req, res) => {
  const { amount, orderId, email } = req.body;

  try {
    console.log("Paystack init payload:", { amount, orderId, email });

    const order = await Order.findById(orderId);
    if (!order) {
      console.log("Order not found:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    const { data } = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata: {
          orderId: order._id.toString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Paystack response:", data);

    const payment = new Payment({
      user: order.user,
      order: order._id,
      paymentMethod: "Paystack",
      paymentStatus: "pending",
    });

    await payment.save();

    res.status(200).json({
      paymentUrl: data.data.authorization_url,
    });

  } catch (err) {
    console.error("Paystack init error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Error initializing payment",
      error: err.response?.data || err.message,
    });
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
