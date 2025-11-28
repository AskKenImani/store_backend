const Review = require('../models/Review');

const addReview = async (req, res) => {
  const { user, product, rating, comment } = req.body;

  try {
    const review = new Review({
      user,
      product,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Error adding review', error: err.message });
  }
};

const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ product: productId }).populate('user');
    res.status(200).json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};

module.exports = { addReview, getReviewsByProduct };
