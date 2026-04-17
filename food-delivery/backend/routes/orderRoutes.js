const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Customer routes
router.post('/', protect, authorizeRoles('customer'), placeOrder);
router.get('/my', protect, authorizeRoles('customer'), getMyOrders);
router.put('/:id/cancel', protect, authorizeRoles('customer'), cancelOrder);

// Restaurant owner routes
router.get('/restaurant', protect, authorizeRoles('restaurant_owner'), getRestaurantOrders);

// Status update — restaurant_owner, courier, admin
router.put(
  '/:id/status',
  protect,
  authorizeRoles('restaurant_owner', 'courier', 'admin'),
  updateOrderStatus
);

// Get single order — any authenticated user
router.get('/:id', protect, getOrderById);

module.exports = router;