const express = require('express');
const router = express.Router();
const {
  submitReview,
  getRestaurantReviews,
  getMyLoyaltyPoints,
} = require('../controllers/reviewController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Private
router.post(
  '/:orderId',
  protect,
  authorizeRoles('customer'),
  submitReview
);
router.get(
  '/my/points',
  protect,
  authorizeRoles('customer'),
  getMyLoyaltyPoints
);

module.exports = router;