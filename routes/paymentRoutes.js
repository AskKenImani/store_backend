const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/pay", authMiddleware, paymentController.payWithPaystack);

// ❌ no auth here — Paystack redirect/webhook safe
router.post("/verify", paymentController.verifyPayment);

module.exports = router;
