const express = require('express');
const router = express.Router();
const {
  addMenuItem,
  getMenuByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require('../controllers/menuController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public
router.get('/:restaurantId', getMenuByRestaurant);

// Private — restaurant_owner only
router.post('/', protect, authorizeRoles('restaurant_owner'), addMenuItem);
router.put('/:itemId', protect, authorizeRoles('restaurant_owner'), updateMenuItem);
router.delete('/:itemId', protect, authorizeRoles('restaurant_owner'), deleteMenuItem);
router.put('/:itemId/toggle', protect, authorizeRoles('restaurant_owner'), toggleAvailability);

module.exports = router;