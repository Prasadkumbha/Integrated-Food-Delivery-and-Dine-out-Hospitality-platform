import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartRestaurant,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    totalItems,
  } = useCart();

  // Delivery fee and tax calculation
  const deliveryFee = totalAmount >= 500 ? 0 : 40;
  const taxes = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + deliveryFee + taxes;

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
        <span className='text-8xl mb-4'>🛒</span>
        <h2 className='text-2xl font-bold text-gray-700 mb-2'>
          Your cart is empty
        </h2>
        <p className='text-gray-500 mb-6'>
          Add items from a restaurant to get started
        </p>
        <button
          onClick={() => navigate('/restaurants')}
          className='bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600'
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold text-gray-800 mb-2'>🛒 Your Cart</h1>

      {/* Restaurant Info */}
      <div className='bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6'>
        <p className='text-sm text-gray-500'>Ordering from</p>
        <p className='font-bold text-orange-600 text-lg'>
          {cartRestaurant?.name}
        </p>
      </div>

      {/* Cart Items */}
      <div className='bg-white rounded-xl shadow mb-6'>
        {cartItems.map((item, index) => (
          <div
            key={item._id}
            className={`p-4 flex justify-between items-center ${
              index !== cartItems.length - 1
                ? 'border-b border-gray-100'
                : ''
            }`}
          >
            {/* Item Info */}
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span
                  className={`w-4 h-4 border-2 rounded-sm text-xs flex items-center justify-center ${
                    item.isVeg
                      ? 'border-green-500 text-green-500'
                      : 'border-red-500 text-red-500'
                  }`}
                >
                  ●
                </span>
                <h3 className='font-semibold text-gray-800'>{item.name}</h3>
              </div>
              <p className='text-orange-500 font-bold mt-1'>
                ₹{item.price} × {item.quantity} ={' '}
                <span className='text-gray-800'>
                  ₹{item.price * item.quantity}
                </span>
              </p>
            </div>

            {/* Quantity Controls */}
            <div className='flex items-center gap-2'>
              <button
                onClick={() => decreaseQuantity(item._id)}
                className='w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-bold hover:bg-orange-200'
              >
                −
              </button>
              <span className='w-6 text-center font-semibold'>
                {item.quantity}
              </span>
              <button
                onClick={() => increaseQuantity(item._id)}
                className='w-8 h-8 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600'
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item._id)}
                className='ml-2 text-red-400 hover:text-red-600 text-lg'
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className='bg-white rounded-xl shadow p-4 mb-6'>
        <h2 className='font-bold text-gray-800 mb-3'>Bill Summary</h2>
        <div className='flex flex-col gap-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-gray-500'>
              Subtotal ({totalItems} items)
            </span>
            <span>₹{totalAmount}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Delivery Fee</span>
            <span className={deliveryFee === 0 ? 'text-green-500' : ''}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </span>
          </div>
          {deliveryFee === 0 && (
            <p className='text-green-500 text-xs'>
              🎉 You saved ₹40 on delivery!
            </p>
          )}
          <div className='flex justify-between'>
            <span className='text-gray-500'>Taxes (5%)</span>
            <span>₹{taxes}</span>
          </div>
          <div className='flex justify-between font-bold text-base border-t pt-2 mt-1'>
            <span>Grand Total</span>
            <span className='text-orange-500'>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col gap-3'>
        <button
          onClick={() => navigate('/checkout')}
          className='bg-orange-500 text-white p-4 rounded-xl font-bold text-lg hover:bg-orange-600'
        >
          Proceed to Checkout → ₹{grandTotal}
        </button>
        <button
          onClick={() => navigate(`/restaurants/${cartRestaurant?._id}`)}
          className='bg-gray-100 text-gray-700 p-3 rounded-xl font-semibold hover:bg-gray-200'
        >
          + Add More Items
        </button>
        <button
          onClick={() => {
            if (window.confirm('Clear entire cart?')) clearCart();
          }}
          className='text-red-500 text-sm text-center hover:underline'
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

export default CartPage;