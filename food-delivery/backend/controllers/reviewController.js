const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// ─── Loyalty Point Calculator Algorithm ───────────────────────────────────────
const calculateLoyaltyPoints = (review) => {
  let points = 0;
  const { comment, rating } = review;

  if (!comment) return 5; // minimum points for rating only

  const wordCount = comment.trim().split(/\s+/).length;

  // Points based on word count
  if (wordCount >= 50) points += 30;
  else if (wordCount >= 30) points += 20;
  else if (wordCount >= 15) points += 10;
  else points += 5;

  // Points based on keyword density (descriptive food keywords)
  const keywords = [
    'delicious', 'tasty', 'fresh', 'spicy', 'sweet', 'sour',
    'crispy', 'juicy', 'flavourful', 'aromatic', 'bland', 'cold',
    'hot', 'overcooked', 'undercooked', 'amazing', 'terrible',
    'excellent', 'average', 'recommend', 'portion', 'presentation',
    'packaging', 'delivery', 'quick', 'slow', 'friendly', 'rude',
  ];

  const lowerComment = comment.toLowerCase();
  const keywordsFound = keywords.filter((kw) =>
    lowerComment.includes(kw)
  ).length;

  points += keywordsFound * 2; // 2 points per descriptive keyword

  // Bonus points for rating extremes (very happy or very unhappy = honest review)
  if (rating === 5 || rating === 1) points += 5;

  // Cap at 100 points per review
  return Math.min(points, 100);
};

// ─── Sentiment Analyzer ───────────────────────────────────────────────────────
const analyzeSentiment = (comment) => {
  if (!comment) return 'neutral';

  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'delicious', 'tasty',
    'fresh', 'loved', 'fantastic', 'awesome', 'best', 'perfect',
    'recommend', 'wonderful', 'outstanding', 'crispy', 'juicy',
  ];
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'disgusting',
    'cold', 'stale', 'bland', 'overcooked', 'undercooked', 'slow',
    'rude', 'late', 'wrong', 'missing', 'dirty', 'never',
  ];

  const lower = comment.toLowerCase();
  const positiveCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => lower.includes(w)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

// @desc    Submit a review for a delivered order
// @route   POST /api/reviews/:orderId
// @access  Private (customer only)
const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { orderId } = req.params;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5',
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the customer who placed the order can review
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only review delivered orders
    if (order.status !== 'Delivered') {
      return res.status(400).json({
        message: 'You can only review delivered orders',
      });
    }

    // Prevent duplicate reviews
    if (order.review && order.review.rating) {
      return res.status(400).json({
        message: 'You have already reviewed this order',
      });
    }

    // Calculate loyalty points using algorithm
    const loyaltyPoints = calculateLoyaltyPoints({ rating, comment });

    // Analyze sentiment
    const sentiment = analyzeSentiment(comment);

    // Save review inside order document
    order.review = {
      rating,
      comment,
      loyaltyPoints,
      submittedAt: new Date(),
    };

    await order.save();

    // Update restaurant's average rating
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant) {
      const allOrders = await Order.find({
        restaurant: order.restaurant,
        'review.rating': { $exists: true },
      });

      const totalRating = allOrders.reduce(
        (sum, o) => sum + o.review.rating,
        0
      );

      restaurant.rating = parseFloat(
        (totalRating / allOrders.length).toFixed(1)
      );
      restaurant.totalReviews = allOrders.length;
      await restaurant.save();
    }

    res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        rating,
        comment,
        sentiment,
        loyaltyPoints,
        submittedAt: order.review.submittedAt,
      },
      rewardMessage: `🎉 You earned ${loyaltyPoints} loyalty points for this review!`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews of a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
const getRestaurantReviews = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.params.restaurantId,
      'review.rating': { $exists: true },
    })
      .populate('customer', 'name')
      .select('review customer createdAt')
      .sort({ 'review.submittedAt': -1 });

    const reviews = orders.map((order) => ({
      customerName: order.customer?.name || 'Anonymous',
      rating: order.review.rating,
      comment: order.review.comment,
      loyaltyPoints: order.review.loyaltyPoints,
      submittedAt: order.review.submittedAt,
    }));

    res.status(200).json({
      message: 'Reviews fetched successfully',
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my total loyalty points
// @route   GET /api/reviews/my/points
// @access  Private (customer only)
const getMyLoyaltyPoints = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id,
      'review.loyaltyPoints': { $exists: true },
    }).select('review totalAmount createdAt');

    const totalPoints = orders.reduce(
      (sum, order) => sum + (order.review?.loyaltyPoints || 0),
      0
    );

    const reviewHistory = orders.map((order) => ({
      orderId: order._id,
      points: order.review.loyaltyPoints,
      rating: order.review.rating,
      submittedAt: order.review.submittedAt,
    }));

    res.status(200).json({
      message: 'Loyalty points fetched successfully',
      totalPoints,
      reviewHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitReview,
  getRestaurantReviews,
  getMyLoyaltyPoints,
};