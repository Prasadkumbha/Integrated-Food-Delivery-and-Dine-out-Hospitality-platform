const Restaurant = require('../models/Restaurant');

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private (restaurant_owner only)
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      cuisineType,
      phone,
      address,
      longitude,
      latitude,
      deliveryRadius,
      minimumOrder,
    } = req.body;

    const restaurant = await Restaurant.create({
      owner: req.user._id,
      name,
      description,
      cuisineType,
      phone,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      deliveryRadius,
      minimumOrder,
    });

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my restaurant (owner)
// @route   GET /api/restaurants/my/profile
// @access  Private (restaurant_owner only)
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.status(200).json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update my restaurant
// @route   PUT /api/restaurants/my/profile
// @access  Private (restaurant_owner only)
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const {
      name,
      description,
      cuisineType,
      phone,
      address,
      longitude,
      latitude,
      deliveryRadius,
      minimumOrder,
      isOpen,
    } = req.body;

    if (name) restaurant.name = name;
    if (description) restaurant.description = description;
    if (cuisineType) restaurant.cuisineType = cuisineType;
    if (phone) restaurant.phone = phone;
    if (address) restaurant.address = address;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;
    if (deliveryRadius) restaurant.deliveryRadius = deliveryRadius;
    if (minimumOrder) restaurant.minimumOrder = minimumOrder;
    if (longitude && latitude) {
      restaurant.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    const updated = await restaurant.save();
    res.status(200).json({
      message: 'Restaurant updated successfully',
      restaurant: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      'owner',
      'name email phone'
    );
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.status(200).json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby restaurants using $geoNear
// @route   GET /api/restaurants/nearby
// @access  Public
const getNearbyRestaurants = async (req, res) => {
  try {
    const {
      longitude,
      latitude,
      maxDistance = 5000,
      cuisine,
      minRating,
      page = 1,
      limit = 10,
    } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        message: 'Please provide longitude and latitude',
      });
    }

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'distance',
          maxDistance: parseFloat(maxDistance),
          spherical: true,
          query: { isOpen: true },
        },
      },
    ];

    if (cuisine) {
      pipeline.push({
        $match: {
          cuisineType: {
            $in: [new RegExp(cuisine, 'i')], // case insensitive
          },
        },
      });
    }

    if (minRating) {
      pipeline.push({
        $match: {
          rating: { $gte: parseFloat(minRating) },
        },
      });
    }

    pipeline.push({
      $sort: {
        distance: 1,
        rating: -1,
      },
    });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    pipeline.push({
      $project: {
        name: 1,
        description: 1,
        cuisineType: 1,
        address: 1,
        rating: 1,
        totalReviews: 1,
        isOpen: 1,
        minimumOrder: 1,
        deliveryRadius: 1,
        imageUrl: 1,
        distance: 1,
      },
    });

    const restaurants = await Restaurant.aggregate(pipeline);

    res.status(200).json({
      message: 'Nearby restaurants fetched successfully',
      count: restaurants.length,
      page: parseInt(page),
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a restaurant (admin only)
// @route   PUT /api/restaurants/:id/approve
// @access  Private (admin only)
const approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.status(200).json({
      message: 'Restaurant approved successfully',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  getRestaurantById,
  getNearbyRestaurants,
  approveRestaurant,
};