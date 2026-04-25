import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useCart from '../hooks/useCart';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartRestaurant, totalAmount, getOrderPayload, clearCart } =
    useCart();

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=success

  // Bill calculation
  const deliveryFee = totalAmount >= 500 ? 0 : 40;
  const taxes = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + deliveryFee + taxes;

  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1 — validate address
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.pincode
    ) {
      setError('Please fill all address fields');
      return;
    }
    setError('');
    setStep(2);
  };

  // Step 2 — initiate checkout and process payment
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1 — initiate checkout
      const initiateRes = await API.post('/checkout/initiate', {
        restaurantId: cartRestaurant._id,
        items: getOrderPayload(),
        deliveryAddress,
        paymentMethod,
      });

      const { orderId, sessionId } = initiateRes.data.paymentSession;

      // Step 2 — process payment
      const payRes = await API.post('/checkout/pay', {
        orderId,
        sessionId,
        simulateFailure: false,
      });

      // Success
      clearCart();
      setStep(3);

      // Navigate to order tracking after 2 seconds
      setTimeout(() => {
        navigate(`/track/${orderId}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Empty cart check
  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <span className='text-6xl mb-4'>🛒</span>
        <p className='text-gray-500 mb-4'>Your cart is empty</p>
        <button
          onClick={() => navigate('/restaurants')}
          className='bg-orange-500 text-white px-6 py-3 rounded-xl'
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6'>
        🧾 Checkout
      </h1>

      {/* Step Indicator */}
      <div className='flex items-center mb-8'>
        {['Address', 'Payment', 'Confirmed'].map((label, index) => (
          <div key={label} className='flex items-center flex-1'>
            <div className='flex flex-col items-center'>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step > index + 1
                    ? 'bg-green-500 text-white'
                    : step === index + 1
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step > index + 1 ? '✓' : index + 1}
              </div>
              <span className='text-xs mt-1 text-gray-500'>{label}</span>
            </div>
            {index < 2 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Delivery Address */}
      {step === 1 && (
        <form onSubmit={handleAddressSubmit}>
          <div className='bg-white rounded-xl shadow p-6 mb-6'>
            <h2 className='font-bold text-gray-800 mb-4'>
              📍 Delivery Address
            </h2>
            <div className='flex flex-col gap-3'>
              <input
                type='text'
                name='street'
                placeholder='Street Address'
                value={deliveryAddress.street}
                onChange={handleAddressChange}
                className='border p-3 rounded-lg'
                required
              />
              <div className='grid grid-cols-2 gap-3'>
                <input
                  type='text'
                  name='city'
                  placeholder='City'
                  value={deliveryAddress.city}
                  onChange={handleAddressChange}
                  className='border p-3 rounded-lg'
                  required
                />
                <input
                  type='text'
                  name='state'
                  placeholder='State'
                  value={deliveryAddress.state}
                  onChange={handleAddressChange}
                  className='border p-3 rounded-lg'
                  required
                />
              </div>
              <input
                type='text'
                name='pincode'
                placeholder='Pincode'
                value={deliveryAddress.pincode}
                onChange={handleAddressChange}
                className='border p-3 rounded-lg'
                required
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className='bg-white rounded-xl shadow p-6 mb-6'>
            <h2 className='font-bold text-gray-800 mb-4'>
              🍽️ Order Summary
            </h2>
            {cartItems.map((item) => (
              <div
                key={item._id}
                className='flex justify-between text-sm py-2 border-b last:border-0'
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className='font-semibold'>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
            <div className='mt-4 pt-2 flex flex-col gap-1 text-sm'>
              <div className='flex justify-between text-gray-500'>
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className='flex justify-between text-gray-500'>
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-green-500' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className='flex justify-between text-gray-500'>
                <span>Taxes (5%)</span>
                <span>₹{taxes}</span>
              </div>
              <div className='flex justify-between font-bold text-base border-t pt-2 mt-1'>
                <span>Grand Total</span>
                <span className='text-orange-500'>₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {error && (
            <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>
          )}

          <button
            type='submit'
            className='w-full bg-orange-500 text-white p-4 rounded-xl font-bold text-lg hover:bg-orange-600'
          >
            Continue to Payment →
          </button>
        </form>
      )}

      {/* Step 2 — Payment */}
      {step === 2 && (
        <div>
          <div className='bg-white rounded-xl shadow p-6 mb-6'>
            <h2 className='font-bold text-gray-800 mb-4'>
              💳 Payment Method
            </h2>
            <div className='flex flex-col gap-3'>
              {['Online', 'COD'].map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer ${
                    paymentMethod === method
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type='radio'
                    name='payment'
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className='accent-orange-500'
                  />
                  <div>
                    <p className='font-semibold'>
                      {method === 'Online' ? '💳 Online Payment' : '💵 Cash on Delivery'}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {method === 'Online'
                        ? 'Pay securely via mock payment gateway'
                        : 'Pay when your order arrives'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Address Summary */}
          <div className='bg-white rounded-xl shadow p-4 mb-6'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm text-gray-500'>Delivering to</p>
                <p className='font-semibold'>
                  {deliveryAddress.street}, {deliveryAddress.city}
                </p>
                <p className='text-sm text-gray-500'>
                  {deliveryAddress.state} — {deliveryAddress.pincode}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className='text-orange-500 text-sm hover:underline'
              >
                Change
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className='bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6'>
            <div className='flex justify-between font-bold text-lg'>
              <span>Total Amount</span>
              <span className='text-orange-500'>₹{grandTotal}</span>
            </div>
          </div>

          {error && (
            <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className='w-full bg-orange-500 text-white p-4 rounded-xl font-bold text-lg hover:bg-orange-600 disabled:opacity-50'
          >
            {loading ? '⏳ Processing Payment...' : `Pay ₹${grandTotal}`}
          </button>

          <button
            onClick={() => setStep(1)}
            className='w-full mt-3 text-gray-500 text-sm hover:underline'
          >
            ← Back to Address
          </button>
        </div>
      )}

      {/* Step 3 — Success */}
      {step === 3 && (
        <div className='flex flex-col items-center justify-center py-12'>
          <span className='text-8xl mb-4'>🎉</span>
          <h2 className='text-2xl font-bold text-green-600 mb-2'>
            Order Confirmed!
          </h2>
          <p className='text-gray-500 mb-2'>
            Your payment was successful.
          </p>
          <p className='text-gray-400 text-sm'>
            Redirecting to order tracking...
          </p>
          <div className='mt-4 w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;