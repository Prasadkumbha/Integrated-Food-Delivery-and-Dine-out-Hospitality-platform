import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-blue-100 text-blue-700',
  Preparing: 'bg-purple-100 text-purple-700',
  Ready: 'bg-indigo-100 text-indigo-700',
  'In Transit': 'bg-orange-100 text-orange-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_ICONS = {
  Pending: '🕐',
  Accepted: '✅',
  Preparing: '👨‍🍳',
  Ready: '📦',
  'In Transit': '🛵',
  Delivered: '🎉',
  Cancelled: '❌',
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/my');
      setOrders(data.orders);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cancel order
  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancellingId(orderId);
      await API.put(`/orders/${orderId}/cancel`);
      // Refresh orders
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-gray-500'>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          📦 My Orders
        </h1>
        <button
          onClick={fetchOrders}
          className='text-orange-500 text-sm hover:underline'
        >
          🔄 Refresh
        </button>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16'>
          <span className='text-8xl mb-4'>📭</span>
          <h2 className='text-xl font-bold text-gray-700 mb-2'>
            No orders yet
          </h2>
          <p className='text-gray-500 mb-6'>
            You haven't placed any orders yet
          </p>
          <button
            onClick={() => navigate('/restaurants')}
            className='bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600'
          >
            Order Now
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className='flex flex-col gap-4'>
        {orders.map((order) => (
          <div
            key={order._id}
            className='bg-white rounded-xl shadow border border-gray-100 overflow-hidden'
          >
            {/* Order Header */}
            <div className='flex justify-between items-center p-4 border-b bg-gray-50'>
              <div>
                <p className='font-bold text-gray-800'>
                  {order.restaurant?.name || 'Restaurant'}
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  STATUS_COLORS[order.status]
                }`}
              >
                {STATUS_ICONS[order.status]} {order.status}
              </span>
            </div>

            {/* Order Items */}
            <div className='p-4 border-b'>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className='flex justify-between text-sm py-1'
                >
                  <span className='text-gray-600'>
                    {item.name} × {item.quantity}
                  </span>
                  <span className='font-semibold'>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className='p-4 flex justify-between items-center'>
              <div>
                <p className='text-sm text-gray-500'>Total Amount</p>
                <p className='font-bold text-orange-500 text-lg'>
                  ₹{order.totalAmount}
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  Payment: {order.paymentStatus}
                </p>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col gap-2'>
                {/* Track button for active orders */}
                {!['Delivered', 'Cancelled'].includes(order.status) && (
                  <button
                    onClick={() => navigate(`/track/${order._id}`)}
                    className='bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600'
                  >
                    🛵 Track Order
                  </button>
                )}

                {/* Review button for delivered orders */}
                {order.status === 'Delivered' && !order.review?.rating && (
                  <button
                    onClick={() => navigate(`/review/${order._id}`)}
                    className='bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600'
                  >
                    ⭐ Write Review
                  </button>
                )}

                {/* Show review if already submitted */}
                {order.review?.rating && (
                  <div className='text-center'>
                    <p className='text-xs text-gray-500'>Your Rating</p>
                    <p className='text-yellow-500 font-bold'>
                      {'⭐'.repeat(order.review.rating)}
                    </p>
                    <p className='text-xs text-green-500'>
                      +{order.review.loyaltyPoints} pts
                    </p>
                  </div>
                )}

                {/* Cancel button */}
                {['Pending', 'Accepted'].includes(order.status) && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    disabled={cancellingId === order._id}
                    className='text-red-500 text-sm hover:underline disabled:opacity-50'
                  >
                    {cancellingId === order._id
                      ? 'Cancelling...'
                      : 'Cancel Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;