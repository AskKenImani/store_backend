const axios = require("axios");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

// INIT PAYMENT
const payWithPaystack = async (req, res) => {
  try {
    const { amount, orderId, email } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "completed") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // 🔐 Convert to kobo (Paystack requirement)
    const amountInKobo = Math.round(Number(amount) * 100);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amountInKobo,
        callback_url: `${process.env.FRONTEND_URL}/payment-success`,
        metadata: {
          orderId: order._id.toString(),
          userId: order.user.toString(),
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

    // Save or update payment
    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        user: order.user,
        order: order._id,
        reference,
        paymentStatus: "pending",
      },
      { upsert: true, new: true }
    );

    res.json({ paymentUrl: authorization_url });
  } catch (err) {
    console.error("Paystack init error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// VERIFY PAYMENT (called from frontend success page)
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: "Missing reference" });
    }

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = verifyRes.data.data;

    if (data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const orderId = data.metadata.orderId;

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { reference },
      { paymentStatus: "completed" },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "completed" },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (err) {
    console.error("Verify error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

module.exports = { payWithPaystack, verifyPayment };
