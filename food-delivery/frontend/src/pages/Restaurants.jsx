import { useEffect, useState } from "react";
import { getRestaurants } from "../api/restaurantApi";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import SearchFilters from "../components/restaurant/SearchFilters";
import "../styles/restaurants.css";



function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchRestaurants = async (filters = {}) => {
    try {
      setLoading(true);
      setMessage("");

      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "")
      );

      const data = await getRestaurants(cleanedFilters);

      const restaurantList = Array.isArray(data) ? data : data.restaurants || [];
      setRestaurants(restaurantList);

      if (restaurantList.length === 0) {
        setMessage("No restaurants found");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="restaurants-page">
      <h1>Nearby Restaurants</h1>

      <SearchFilters onSearch={fetchRestaurants} />

      {loading && <p>Loading restaurants...</p>}
      {message && <p className="message">{message}</p>}

      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}

export default Restaurants;