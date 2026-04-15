const Restaurant = require("../models/Restaurants");

// @desc Get all restaurants with search, filter, geospatial query, pagination
// @route GET /api/restaurants
// @access Public
const getRestaurants = async (req, res) => {
  try {
    const {
      search,
      cuisine,
      rating,
      lat,
      lng,
      radius,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const matchStage = {};

    if (search) {
      matchStage.name = { $regex: search, $options: "i" };
    }

    if (cuisine) {
      matchStage.cuisineType = { $in: [cuisine] };
    }

    if (rating) {
      matchStage.rating = { $gte: Number(rating) };
    }

    matchStage.isApproved = true;

    let restaurants;
    let total;

    if (lat && lng) {
      const maxDistance = radius ? Number(radius) : 5000;

      const pipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [Number(lng), Number(lat)],
            },
            distanceField: "distance",
            maxDistance: maxDistance,
            spherical: true,
            query: matchStage,
          },
        },
        { $skip: skip },
        { $limit: pageSize },
      ];

      restaurants = await Restaurant.aggregate(pipeline);

      const countPipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [Number(lng), Number(lat)],
            },
            distanceField: "distance",
            maxDistance: maxDistance,
            spherical: true,
            query: matchStage,
          },
        },
        { $count: "total" },
      ];

      const countResult = await Restaurant.aggregate(countPipeline);
      total = countResult[0]?.total || 0;
    } else {
      restaurants = await Restaurant.find(matchStage)
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 });

      total = await Restaurant.countDocuments(matchStage);
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single restaurant by ID
// @route GET /api/restaurants/:id
// @access Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
};