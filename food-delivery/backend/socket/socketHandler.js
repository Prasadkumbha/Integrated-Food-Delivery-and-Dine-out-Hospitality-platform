const socketHandler = (io) => {
  // Store connected users: { userId: socketId }
  const connectedUsers = {};

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // When user joins, store their socketId against userId
    socket.on('join', (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Join a specific order room for real-time tracking
    socket.on('joinOrderRoom', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined room: order_${orderId}`);
    });

    // Leave order room
    socket.on('leaveOrderRoom', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`Socket ${socket.id} left room: order_${orderId}`);
    });

    // Courier location update — broadcasts to order room
    socket.on('courierLocationUpdate', ({ orderId, coordinates }) => {
      io.to(`order_${orderId}`).emit('courierLocationUpdated', {
        orderId,
        coordinates, // [longitude, latitude]
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove user from connectedUsers
      for (const [userId, socketId] of Object.entries(connectedUsers)) {
        if (socketId === socket.id) {
          delete connectedUsers[userId];
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  // Helper function — emit order status update to specific user
  // This will be called from orderController when status changes
  io.emitOrderStatusUpdate = (orderId, customerId, status) => {
    // Emit to order room (all devices tracking this order)
    io.to(`order_${orderId}`).emit('orderStatusUpdated', {
      orderId,
      status,
      updatedAt: new Date(),
    });

    // Also emit directly to customer if connected
    const customerSocketId = connectedUsers[customerId?.toString()];
    if (customerSocketId) {
      io.to(customerSocketId).emit('orderStatusUpdated', {
        orderId,
        status,
        updatedAt: new Date(),
      });
    }
  };

  return connectedUsers;
};

module.exports = socketHandler;