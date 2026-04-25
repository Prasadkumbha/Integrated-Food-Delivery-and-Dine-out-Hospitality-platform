import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    cuisine: '',
    maxDistance: 10000,
  });

  // Default coordinates — Bareilly, UP
  // In real app, use browser geolocation API
  const [coords, setCoords] = useState({
    longitude: 79.4304,
    latitude: 28.3670,
  });

  // Get user's real location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          });
        },
        () => {
          console.log('Location denied, using default coordinates');
        }
      );
    }
  }, []);

  // Fetch nearby restaurants
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        longitude: coords.longitude,
        latitude: coords.latitude,
        maxDistance: filters.maxDistance,
        ...(filters.cuisine && { cuisine: filters.cuisine }),
      });

      const { data } = await API.get(`/restaurants/nearby?${params}`);
      setRestaurants(data.restaurants);
    } catch (err) {
      setError('Failed to fetch restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [coords, filters]);

  // Render star rating
  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating)) || '⭐';
  };

  // Format distance
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-bold text-gray-800 mb-2'>
        🍽️ Restaurants Near You
      </h1>
      <p className='text-gray-500 mb-6'>
        Showing restaurants within {filters.maxDistance / 1000}km
      </p>

      {/* Filters */}
      <div className='flex gap-4 mb-6 flex-wrap'>
        <input
          type='text'
          placeholder='Filter by cuisine (e.g. Indian)'
          value={filters.cuisine}
          onChange={(e) =>
            setFilters({ ...filters, cuisine: e.target.value })
          }
          className='border p-2 rounded flex-1 min-w-48'
        />
        <select
          value={filters.maxDistance}
          onChange={(e) =>
            setFilters({ ...filters, maxDistance: Number(e.target.value) })
          }
          className='border p-2 rounded'
        >
          <option value={2000}>Within 2km</option>
          <option value={5000}>Within 5km</option>
          <option value={10000}>Within 10km</option>
          <option value={20000}>Within 20km</option>
        </select>
        <button
          onClick={fetchRestaurants}
          className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600'
        >
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className='flex justify-center items-center py-12'>
          <p className='text-gray-500'>🔍 Finding restaurants near you...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='bg-red-100 text-red-600 p-4 rounded mb-4'>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && restaurants.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-4xl mb-4'>🍽️</p>
          <p className='text-gray-500'>
            No restaurants found nearby. Try increasing the distance.
          </p>
        </div>
      )}

      {/* Restaurant Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {restaurants.map((restaurant) => (
          <Link
            to={`/restaurants/${restaurant._id}`}
            key={restaurant._id}
            className='bg-white rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100'
          >
            {/* Restaurant Image */}
            <div className='bg-orange-100 h-40 rounded-t-xl flex items-center justify-center'>
              {restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className='h-full w-full object-cover rounded-t-xl'
                />
              ) : (
                <span className='text-6xl'>🍽️</span>
              )}
            </div>

            {/* Restaurant Info */}
            <div className='p-4'>
              <div className='flex justify-between items-start mb-2'>
                <h2 className='text-lg font-bold text-gray-800'>
                  {restaurant.name}
                </h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    restaurant.isOpen
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
                </span>
              </div>

              <p className='text-sm text-gray-500 mb-2'>
                {restaurant.cuisineType?.join(', ')}
              </p>

              <div className='flex items-center justify-between text-sm'>
                <span>
                  {renderStars(restaurant.rating)} ({restaurant.totalReviews || 0} reviews)
                </span>
                <span className='text-orange-500 font-semibold'>
                  📍 {restaurant.distance
                    ? formatDistance(restaurant.distance)
                    : 'Nearby'}
                </span>
              </div>

              <div className='mt-2 pt-2 border-t flex justify-between text-xs text-gray-500'>
                <span>Min order: ₹{restaurant.minimumOrder}</span>
                <span>
                  Within {restaurant.deliveryRadius / 1000}km delivery
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;