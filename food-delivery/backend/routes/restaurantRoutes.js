const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  getRestaurantById,
  getNearbyRestaurants,
  approveRestaurant,
} = require('../controllers/restaurantController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');


router.get('/nearby', getNearbyRestaurants);

// Public
router.get('/:id', getRestaurantById);

// Private — restaurant_owner only
router.post('/', protect, authorizeRoles('restaurant_owner'), createRestaurant);
router.get('/my/profile', protect, authorizeRoles('restaurant_owner'), getMyRestaurant);
router.put('/my/profile', protect, authorizeRoles('restaurant_owner'), updateRestaurant);
router.put('/:id/approve', protect, authorizeRoles('admin'), approveRestaurant);

module.exports = router;