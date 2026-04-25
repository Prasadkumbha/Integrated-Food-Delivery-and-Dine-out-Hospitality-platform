import { useEffect, useState } from 'react';
import useSocket from '../hooks/useSocket';
import API from '../api/axios';

const STATUS_STEPS = [
  { key: 'Pending', label: '🕐 Pending', desc: 'Waiting for restaurant' },
  { key: 'Accepted', label: '✅ Accepted', desc: 'Restaurant confirmed' },
  { key: 'Preparing', label: '👨‍🍳 Preparing', desc: 'Kitchen is cooking' },
  { key: 'Ready', label: '📦 Ready', desc: 'Ready for pickup' },
  { key: 'In Transit', label: '🛵 In Transit', desc: 'On the way!' },
  { key: 'Delivered', label: '🎉 Delivered', desc: 'Enjoy your meal!' },
];

const OrderTracker = ({ orderId }) => {
  const { socket, joinOrderRoom, leaveOrderRoom, isConnected } = useSocket();
  const [currentStatus, setCurrentStatus] = useState('Pending');
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial order status
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        setCurrentStatus(data.order.status);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  // Join order room and listen for real-time updates
  useEffect(() => {
    if (!socket || !orderId) return;

    joinOrderRoom(orderId);

    // Listen for status updates
    socket.on('orderStatusUpdated', (data) => {
      if (data.orderId === orderId) {
        setCurrentStatus(data.status);
        setUpdates((prev) => [
          {
            status: data.status,
            time: new Date(data.updatedAt).toLocaleTimeString(),
          },
          ...prev,
        ]);
      }
    });

    return () => {
      leaveOrderRoom(orderId);
      socket.off('orderStatusUpdated');
    };
  }, [socket, orderId]);

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === currentStatus
  );

  if (loading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <p className='text-gray-500'>Loading order status...</p>
      </div>
    );
  }

  return (
    <div className='max-w-lg mx-auto p-6'>
      {/* Connection Status */}
      <div className='flex items-center gap-2 mb-4'>
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className='text-sm text-gray-500'>
          {isConnected ? 'Live tracking active' : 'Connecting...'}
        </span>
      </div>

      {/* Order ID */}
      <div className='bg-gray-100 rounded p-3 mb-6'>
        <p className='text-sm text-gray-500'>Order ID</p>
        <p className='font-mono text-sm font-bold'>{orderId}</p>
      </div>

      {/* Status Steps */}
      <div className='mb-6'>
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className='flex items-start gap-4 mb-4'>
              {/* Circle indicator */}
              <div className='flex flex-col items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
                      isCurrent
                        ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                >
                  {isCompleted && !isCurrent ? '✓' : index + 1}
                </div>
                {/* Connector line */}
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`w-0.5 h-6 mt-1 ${
                      index < currentStepIndex
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Step info */}
              <div className='pt-1'>
                <p
                  className={`font-semibold ${
                    isCurrent
                      ? 'text-orange-500'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className='text-sm text-gray-500'>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Updates Log */}
      {updates.length > 0 && (
        <div className='bg-blue-50 rounded p-4'>
          <p className='font-semibold text-blue-700 mb-2'>
            🔔 Live Updates
          </p>
          {updates.map((update, index) => (
            <div
              key={index}
              className='flex justify-between text-sm text-blue-600 mb-1'
            >
              <span>{update.status}</span>
              <span>{update.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracker;