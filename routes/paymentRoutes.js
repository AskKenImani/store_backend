const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/pay", authMiddleware, paymentController.payWithPaystack);

// No auth here — frontend success page + webhook safe
router.post("/verify", paymentController.verifyPayment);

module.exports = router;
