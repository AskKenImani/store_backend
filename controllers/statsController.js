const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Review");

exports.getHomeStats = async (req, res) => {
  try {
    // 1️⃣ Total registered users
    const totalUsers = await User.countDocuments();

    // 2️⃣ Total products sold (completed orders only)
    const soldAgg = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$products.quantity" },
        },
      },
    ]);

    const totalProductsSold = soldAgg[0]?.totalSold || 0;

    // 3️⃣ Review satisfaction percentage
    const totalReviews = await Review.countDocuments();

    const positiveReviews = await Review.countDocuments({
      rating: { $gte: 4 },
    });

    const reviewPercent =
      totalReviews === 0
        ? 0
        : Math.round((positiveReviews / totalReviews) * 100);

    res.json({
      totalUsers,
      totalProductsSold,
      reviewPercent,
      totalReviews,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
};
