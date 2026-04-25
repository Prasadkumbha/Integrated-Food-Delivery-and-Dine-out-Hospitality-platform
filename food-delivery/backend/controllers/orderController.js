const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurants = require('../models/Restaurant');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (customer only)
const placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

    // Validate restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item not found: ${item.menuItemId}`,
        });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      // Snapshot name and price at time of order
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });

      totalAmount += menuItem.price * item.quantity;
    }

    // Check minimum order amount
    if (totalAmount < restaurant.minimumOrder) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${restaurant.minimumOrder}`,
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my orders (customer)
// @route   GET /api/orders/my
// @access  Private (customer only)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders fetched successfully',
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name address phone')
      .populate('customer', 'name email phone')
      .populate('courier', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow customer, restaurant owner, or courier to view
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get incoming orders (restaurant owner)
// @route   GET /api/orders/restaurant
// @access  Private (restaurant_owner only)
const getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Restaurant orders fetched successfully',
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (restaurant_owner, courier, admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'Pending',
      'Accepted',
      'Preparing',
      'Ready',
      'In Transit',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    const updated = await order.save();

    // 🔥 Emit real-time socket event
    const io = req.app.get('io');
    if (io) {
      io.emitOrderStatusUpdate(
        order._id.toString(),
        order.customer.toString(),
        status
      );
    }

    res.status(200).json({
      message: `Order status updated to ${status}`,
      order: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (customer)
// @route   PUT /api/orders/:id/cancel
// @access  Private (customer only)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only customer can cancel their own order
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only cancel if still pending
    if (!['Pending', 'Accepted'].includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled once it is ${order.status}`,
      });
    }

    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder,
};