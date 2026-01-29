const express = require("express");
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/* USER */
router.post("/", authMiddleware, reviewController.createReview);
router.get("/:id", reviewController.getProductReviews);
router.get(
  "/can-review/:productId",
  authMiddleware,
  reviewController.canReview
);

/* ADMIN */
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
