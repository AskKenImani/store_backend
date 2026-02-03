const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// INIT PAY
router.post("/pay", authMiddleware, paymentController.payWithPaystack);

// FRONTEND VERIFY (optional UX)
router.post("/verify", paymentController.verifyPayment);

// PAYSTACK WEBHOOK (NO AUTH)
router.post("/webhook", paymentController.paystackWebhook);

module.exports = router;
