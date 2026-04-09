const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true, // snapshot of name at time of order
  },
  price: {
    type: Number,
    required: true, // snapshot of price at time of order
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    courier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // assigned after order is accepted
    },
    items: [orderItemSchema], // embedded array of ordered items

    totalAmount: {
      type: Number,
      required: true,
    },

    // Order status — matches project doc transitions
    status: {
      type: String,
      enum: [
        'Pending',       // order placed, waiting for restaurant
        'Accepted',      // restaurant accepted
        'Preparing',     // kitchen is preparing
        'Ready',         // ready for pickup by courier
        'In Transit',    // courier picked up, on the way
        'Delivered',     // successfully delivered
        'Cancelled',     // cancelled by customer or restaurant
      ],
      default: 'Pending',
    },

    // Payment info
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      default: 'Online',
    },

    // Delivery address snapshot at time of order
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },

    // For real-time courier GPS tracking (Week 3+)
    courierLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    // Gamified review system (Week 3)
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      loyaltyPoints: { type: Number, default: 0 },
      submittedAt: { type: Date },
    },

    estimatedDeliveryTime: {
      type: Number, // in minutes
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);