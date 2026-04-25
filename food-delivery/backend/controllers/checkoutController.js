const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Initiate checkout — validate cart and create pending order
// @route   POST /api/checkout/initiate
// @access  Private (customer only)
const initiateCheckout = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    if (!restaurant.isOpen) {
      return res.status(400).json({ message: 'Restaurant is currently closed' });
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
      if (menuItem.restaurant.toString() !== restaurantId) {
        return res.status(400).json({
          message: `${menuItem.name} does not belong to this restaurant`,
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });

      totalAmount += menuItem.price * item.quantity;
    }

    // Check minimum order
    if (totalAmount < restaurant.minimumOrder) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${restaurant.minimumOrder}`,
      });
    }

    // Create order with Pending status
    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    // Generate mock payment session
    const paymentSession = {
      orderId: order._id,
      amount: totalAmount,
      currency: 'INR',
      sessionId: `mock_session_${Date.now()}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
    };

    res.status(201).json({
      message: 'Checkout initiated successfully',
      paymentSession,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process mock payment — simulate success/failure
// @route   POST /api/checkout/pay
// @access  Private (customer only)
const processPayment = async (req, res) => {
  try {
    const { orderId, sessionId, simulateFailure = false } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure this order belongs to the customer
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Make sure order is still pending
    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: 'Order has already been processed',
      });
    }

    // Simulate payment failure if requested
    if (simulateFailure) {
      order.paymentStatus = 'Failed';
      order.status = 'Cancelled';
      await order.save();

      return res.status(400).json({
        message: 'Payment failed. Order cancelled.',
        order,
      });
    }

    // Simulate successful payment
    order.paymentStatus = 'Paid';
    order.status = 'Accepted';
    await order.save();

    // Emit real-time socket event
    const io = req.app.get('io');
    if (io) {
      io.emitOrderStatusUpdate(
        order._id.toString(),
        order.customer.toString(),
        'Accepted'
      );
    }

    res.status(200).json({
      message: 'Payment successful! Order confirmed.',
      transactionId: `mock_txn_${Date.now()}`,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get checkout summary before payment
// @route   POST /api/checkout/summary
// @access  Private (customer only)
const getCheckoutSummary = async (req, res) => {
  try {
    const { restaurantId, items } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    let totalAmount = 0;
    const summaryItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) continue;

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      summaryItems.push({
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        itemTotal,
      });
    }

    const deliveryFee = totalAmount >= 500 ? 0 : 40; // free delivery above 500
    const taxes = Math.round(totalAmount * 0.05); // 5% tax
    const grandTotal = totalAmount + deliveryFee + taxes;

    res.status(200).json({
      message: 'Checkout summary',
      summary: {
        restaurant: {
          name: restaurant.name,
          address: restaurant.address,
        },
        items: summaryItems,
        breakdown: {
          subtotal: totalAmount,
          deliveryFee,
          taxes,
          grandTotal,
        },
        minimumOrder: restaurant.minimumOrder,
        meetsMinimum: totalAmount >= restaurant.minimumOrder,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initiateCheckout,
  processPayment,
  getCheckoutSummary,
};