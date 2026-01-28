const axios = require("axios");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

// INIT PAYMENT
const payWithPaystack = async (req, res) => {
  try {
    const { amount, orderId, email } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount, // ✅ already in kobo
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

    const { authorization_url, reference } = response.data.data;

    // save payment
    await Payment.create({
      user: order.user,
      order: order._id,
      reference,
      paymentStatus: "pending",
    });

    res.json({ paymentUrl: authorization_url });
  } catch (err) {
    console.error("Paystack init error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// VERIFY PAYMENT
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = verifyRes.data.data;

    if (paystackData.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const orderId = paystackData.metadata.orderId;

    // update payment
    const payment = await Payment.findOneAndUpdate(
      { reference },
      { paymentStatus: "completed" },
      { new: true }
    );

    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    // update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "completed" },
      { new: true }
    );

    res.json({
      message: "Payment verified successfully",
      order,
      payment,
    });
  } catch (err) {
    console.error("Verify error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

module.exports = { payWithPaystack, verifyPayment };
