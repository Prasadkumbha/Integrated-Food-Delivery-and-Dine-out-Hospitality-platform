const express = require('express');
const router = express.Router();
const {
  initiateCheckout,
  processPayment,
  getCheckoutSummary,
} = require('../controllers/checkoutController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post(
  '/summary',
  protect,
  authorizeRoles('customer'),
  getCheckoutSummary
);
router.post(
  '/initiate',
  protect,
  authorizeRoles('customer'),
  initiateCheckout
);
router.post(
  '/pay',
  protect,
  authorizeRoles('customer'),
  processPayment
);

module.exports = router;