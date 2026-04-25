const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Add a menu item
// @route   POST /api/menu
// @access  Private (restaurant_owner only)
const addMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isVeg,
      preparationTime,
    } = req.body;

    // Find the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = await MenuItem.create({
      restaurant: restaurant._id,
      name,
      description,
      price,
      category,
      isVeg,
      preparationTime,
    });

    res.status(201).json({
      message: 'Menu item added successfully',
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all menu items of a restaurant
// @route   GET /api/menu/:restaurantId
// @access  Public
const getMenuByRestaurant = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    }).sort({ category: 1 }); // group by category

    res.status(200).json({
      message: 'Menu fetched successfully',
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:itemId
// @access  Private (restaurant_owner only)
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Make sure this item belongs to the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      name,
      description,
      price,
      category,
      isVeg,
      isAvailable,
      preparationTime,
    } = req.body;

    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (price) menuItem.price = price;
    if (category) menuItem.category = category;
    if (isVeg !== undefined) menuItem.isVeg = isVeg;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    if (preparationTime) menuItem.preparationTime = preparationTime;

    const updated = await menuItem.save();
    res.status(200).json({
      message: 'Menu item updated successfully',
      menuItem: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:itemId
// @access  Private (restaurant_owner only)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Make sure this item belongs to the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await menuItem.deleteOne();
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle item availability
// @route   PUT /api/menu/:itemId/toggle
// @access  Private (restaurant_owner only)
const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Toggle availability
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.status(200).json({
      message: `Item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
      isAvailable: menuItem.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMenuItem,
  getMenuByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};