import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRestaurantById } from "../api/restaurantApi";
import "../styles/restaurantDetails.css";

function RestaurantDetails(){
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const[message, setMessage] = useState("");

    useEffect (() => {
        const fetchRestaurant = async () => {
            try{
                setLoading(true);
                const data = await getRestaurantById(id);
                setRestaurant(data.restaurant || data);
            }catch(error) {
                setMessage(error.response?.data?.message || "Failed to load restaurant");
            }finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    if (loading) return <p>Loading restaurant details...</p>
    if(message) return <p className="message">{message}</p>
    if(!restaurant) return <p>No restaurant found</p>;

    return (
        <div className="restaurant-details-page">
            <img 
            src={restaurant.imageUrl || "https://via.placeholder.com/800x300"}
            alt={restaurant.name}
            className="details-image" 
            />

        <div className="details-content">
            <h1>{restaurant.name}</h1>
            <p><strong>Description: </strong>{restaurant.description || "No description available"}</p>
            <p><strong>Cuisine:</strong>{" "} {restaurant.cuisineType?.join(", ") || "N/A"}</p>
            <p><strong>rating:</strong>{restaurant.rating ?? 0} / 5</p>
            <p><strong>Phone:</strong>{restaurant.phone || "N/A"}</p>
            <p>
                <strong>Address:</strong> {" "} {restaurant.address ? `
                ${restaurant.address.street || ""}, ${restaurant.address.city || ""}, 
                ${restaurant.address.state || ""}, ${restaurant.address.pincode || ""}`
                : "N/A"}
            </p>
            <p><strong>Status: </strong>{restaurant.isOpen ? "Open": "Closed"}</p>
            <p><strong>Minimum Order:</strong>₹{restaurant.minimumOrder ?? 0}</p>
            
        </div>
        </div>
    );
}
export default RestaurantDetails;