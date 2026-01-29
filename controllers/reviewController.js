const Review = require("../models/Review");
const Order = require("../models/Order");

// CREATE REVIEW
exports.createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  const hasBought = await Order.findOne({
    user: req.user._id,
    paymentStatus: "completed",
    "products.product": productId,
  });

  if (!hasBought) {
    return res
      .status(403)
      .json({ message: "You must purchase this product to review it" });
  }

  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (alreadyReviewed) {
    return res.status(400).json({ message: "Already reviewed" });
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    comment,
  });

  res.status(201).json(review);
};

// GET PRODUCT REVIEWS
exports.getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate(
    "user",
    "name"
  );

  res.json(reviews);
};
