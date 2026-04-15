import { Link } from "react-router-dom";

function RestaurantCard ({ restaurant }) {
    return (
        <div className="restaurant-card">
            <img src= {restaurant.imageUrl || "https://via.placeholder.com/300x180"}
            alt={restaurant.name}
            className="restaurant-card-image"
            />
            <div className="restaurant-card-body">
                <h3>{restaurant.name}</h3>
                <p><strong>Cuisine:</strong>
                {restaurant.cuisineType?.join(", ") || "N/A"}
                </p>
                <p><strong>Rating:</strong>
                {restaurant.rating ?? 0} / 5
                </p>
                <p><strong>Status:</strong>
                {restaurant.isOpen ? "Open" : "Closed"}
                </p>
                <p><strong>Min Order:</strong>
                ₹{restaurant.minimumOrder ?? 0}</p>
                <Link to={`/restaurants/${restaurant._id}`} className="view-btn">
                
                View Details</Link>
            </div>
        </div>
    );
}
export default RestaurantCard;