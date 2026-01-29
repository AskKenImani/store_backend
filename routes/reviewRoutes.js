const express = require("express");
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, reviewController.createReview);
router.get("/:id", reviewController.getProductReviews);

module.exports = router;
