import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useCart from '../hooks/useCart';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartRestaurant, totalItems } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch restaurant details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [restaurantRes, menuRes] = await Promise.all([
          API.get(`/restaurants/${id}`),
          API.get(`/menu/${id}`),
        ]);

        setRestaurant(restaurantRes.data.restaurant);
        setMenuItems(menuRes.data.menuItems);
      } catch (err) {
        setError('Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Get unique categories
  const categories = [
    'All',
    ...new Set(menuItems.map((item) => item.category)),
  ];

  // Filter by category
  const filteredItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  // Handle add to cart
  const handleAddToCart = (item) => {
    const result = addToCart(item, restaurant);
    if (!result.success) {
      setMessage(result.message);
      setTimeout(() => setMessage(''), 4000);
    } else {
      setMessage(`✅ ${item.name} added to cart!`);
      setTimeout(() => setMessage(''), 2000);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-gray-500'>Loading restaurant...</p>
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
    <div className='max-w-4xl mx-auto p-6'>

      {/* Restaurant Header */}
      <div className='bg-white rounded-xl shadow p-6 mb-6'>
        <div className='bg-orange-100 h-48 rounded-xl flex items-center justify-center mb-4'>
          {restaurant?.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className='h-full w-full object-cover rounded-xl'
            />
          ) : (
            <span className='text-8xl'>🍽️</span>
          )}
        </div>

        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>
              {restaurant?.name}
            </h1>
            <p className='text-gray-500 mt-1'>
              {restaurant?.cuisineType?.join(', ')}
            </p>
            <p className='text-gray-500 text-sm mt-1'>
              📍 {restaurant?.address?.street}, {restaurant?.address?.city}
            </p>
          </div>
          <div className='text-right'>
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                restaurant?.isOpen
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {restaurant?.isOpen ? '🟢 Open' : '🔴 Closed'}
            </span>
            <p className='text-sm text-gray-500 mt-2'>
              ⭐ {restaurant?.rating || 0} ({restaurant?.totalReviews || 0} reviews)
            </p>
            <p className='text-sm text-gray-500 mt-1'>
              Min order: ₹{restaurant?.minimumOrder}
            </p>
          </div>
        </div>

        {restaurant?.description && (
          <p className='text-gray-600 mt-3 text-sm'>
            {restaurant.description}
          </p>
        )}
      </div>

      {/* Cart Banner */}
      {totalItems > 0 && (
        <div
          className='bg-orange-500 text-white p-4 rounded-xl mb-6 flex justify-between items-center cursor-pointer'
          onClick={() => navigate('/cart')}
        >
          <span>🛒 {totalItems} items in cart</span>
          <span className='font-semibold'>View Cart →</span>
        </div>
      )}

      {/* Conflict Message */}
      {message && (
        <div className={`p-4 rounded-xl mb-4 text-center font-medium ${
          message.startsWith('✅')
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Category Filter */}
      <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-4xl mb-4'>🍽️</p>
          <p className='text-gray-500'>No items available in this category</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className='bg-white rounded-xl shadow p-4 flex justify-between items-start border border-gray-100'
            >
              <div className='flex-1'>
                {/* Veg/NonVeg indicator */}
                <div className='flex items-center gap-2 mb-1'>
                  <span
                    className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm text-xs ${
                      item.isVeg
                        ? 'border-green-500 text-green-500'
                        : 'border-red-500 text-red-500'
                    }`}
                  >
                    ●
                  </span>
                  <span className='text-xs text-gray-500'>
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>

                <h3 className='font-semibold text-gray-800'>{item.name}</h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {item.description}
                </p>
                <p className='text-sm text-gray-400 mt-1'>
                  🕐 {item.preparationTime} mins
                </p>
                <p className='text-orange-500 font-bold mt-2'>
                  ₹{item.price}
                </p>
              </div>

              {/* Add Button */}
              <button
                onClick={() => handleAddToCart(item)}
                disabled={!restaurant?.isOpen}
                className='ml-4 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;