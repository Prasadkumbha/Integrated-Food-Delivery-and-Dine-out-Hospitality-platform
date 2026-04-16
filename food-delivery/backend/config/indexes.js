const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');

    // ─── User Indexes ─────────────────────────────────────────────
    await User.collection.createIndex(
      { email: 1 },
      { unique: true, name: 'email_unique' }
    );
    await User.collection.createIndex(
      { role: 1 },
      { name: 'user_role' }
    );

    // ─── Restaurant Indexes ───────────────────────────────────────
    // 2dsphere index for geospatial queries
    await Restaurant.collection.createIndex(
      { location: '2dsphere' },
      { name: 'restaurant_location_2dsphere' }
    );
    await Restaurant.collection.createIndex(
      { owner: 1 },
      { name: 'restaurant_owner' }
    );
    await Restaurant.collection.createIndex(
      { isOpen: 1, isApproved: 1 },
      { name: 'restaurant_status' }
    );
    await Restaurant.collection.createIndex(
      { cuisineType: 1 },
      { name: 'restaurant_cuisine' }
    );
    await Restaurant.collection.createIndex(
      { rating: -1 },
      { name: 'restaurant_rating' }
    );

    // ─── MenuItem Indexes ─────────────────────────────────────────
    await MenuItem.collection.createIndex(
      { restaurant: 1 },
      { name: 'menuitem_restaurant' }
    );
    await MenuItem.collection.createIndex(
      { restaurant: 1, isAvailable: 1 },
      { name: 'menuitem_restaurant_available' }
    );
    await MenuItem.collection.createIndex(
      { category: 1 },
      { name: 'menuitem_category' }
    );

    // ─── Order Indexes ────────────────────────────────────────────
    await Order.collection.createIndex(
      { customer: 1 },
      { name: 'order_customer' }
    );
    await Order.collection.createIndex(
      { restaurant: 1 },
      { name: 'order_restaurant' }
    );
    await Order.collection.createIndex(
      { status: 1 },
      { name: 'order_status' }
    );
    await Order.collection.createIndex(
      { createdAt: -1 },
      { name: 'order_created_at' }
    );
    await Order.collection.createIndex(
      { restaurant: 1, status: 1 },
      { name: 'order_restaurant_status' }
    );
    await Order.collection.createIndex(
      { restaurant: 1, paymentStatus: 1 },
      { name: 'order_restaurant_payment' }
    );
    await Order.collection.createIndex(
      { customer: 1, createdAt: -1 },
      { name: 'order_customer_date' }
    );

    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Index creation error:', error.message);
  }
};

module.exports = createIndexes;