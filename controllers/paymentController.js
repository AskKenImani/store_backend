const axios = require("axios");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

/**
 * ===============================
 * INIT PAYMENT
 * ===============================
 */
exports.payWithPaystack = async (req, res) => {
  try {
    const { amount, orderId, email } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus === "completed") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const amountInKobo = Math.round(Number(amount));

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

/**
 * ===============================
 * VERIFY (OPTIONAL – FRONTEND)
 * ===============================
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ message: "Missing reference" });

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

    await Payment.findOneAndUpdate(
      { reference },
      { paymentStatus: "completed" }
    );

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "completed" },
      { new: true }
    );

    res.json({ success: true, order });
  } catch (err) {
    console.error("Verify error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

/**
 * ===============================
 * PAYSTACK WEBHOOK (SOURCE OF TRUTH)
 * ===============================
 */
exports.paystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const orderId = metadata?.orderId;

      await Payment.findOneAndUpdate(
        { reference },
        { paymentStatus: "completed" }
      );

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "completed",
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(500);
  }
};
