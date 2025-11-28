const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/pay', authMiddleware, paymentController.payWithPaystack);
router.post('/verify', authMiddleware, paymentController.verifyPayment);

module.exports = router;
