const express = require("express");
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/* ================= PUBLIC ================= */

// ⭐ HOMEPAGE REVIEWS
router.get("/recent", reviewController.getRecentReviews);

// PRODUCT REVIEWS
router.get("/:id", reviewController.getProductReviews);

/* ================= USER ================= */

router.get(
  "/can-review/:productId",
  authMiddleware,
  reviewController.canReview
);

router.post("/", authMiddleware, reviewController.createReview);

/* ================= ADMIN ================= */

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  reviewController.getAllReviews
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  reviewController.deleteReview
);

module.exports = router;
