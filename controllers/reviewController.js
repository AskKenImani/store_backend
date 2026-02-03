const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

/**
 * ✅ CHECK IF USER CAN REVIEW PRODUCT
 */
exports.canReview = async (req, res) => {
  const productId = req.params.productId;

  const hasBought = await Order.findOne({
    user: req.user._id,
    paymentStatus: "completed",
    "products.product": productId,
  });

  if (!hasBought) {
    return res.json({ canReview: false });
  }

  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  res.json({ canReview: !alreadyReviewed });
};

/**
 * ✅ CREATE REVIEW
 */
exports.createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  // 1. Must have purchased
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

  // 2. Prevent duplicate review
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (alreadyReviewed) {
    return res.status(400).json({ message: "Already reviewed" });
  }

  // 3. Create review
  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    comment,
  });

  // 4. Update product rating
  const reviews = await Review.find({ product: productId });
  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    averageRating: avg,
    numReviews: reviews.length,
  });

  res.status(201).json(review);
};

/**
 * ✅ GET PRODUCT REVIEWS
 */
exports.getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json({ reviews });
};

/**
 * ✅ GET RECENT REVIEWS (FOR HOMEPAGE)
 */
exports.getRecentReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "name")
    .populate("product", "name imageUrl")
    .sort({ createdAt: -1 })
    .limit(8);

  res.json(reviews);
};


/**
 * ✅ ADMIN: GET ALL REVIEWS
 */
exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("product", "name")
    .sort({ createdAt: -1 });

  res.json({ reviews });
};

/**
 * ✅ ADMIN: DELETE REVIEW
 */
exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  await review.deleteOne();

  // Recalculate product rating
  const reviews = await Review.find({ product: review.product });
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await Product.findByIdAndUpdate(review.product, {
    averageRating: avg,
    numReviews: reviews.length,
  });

  res.json({ message: "Review deleted" });
};
