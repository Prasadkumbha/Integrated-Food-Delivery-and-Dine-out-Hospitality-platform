import API from "./axios";

export const getRestaurants = async (params = {}) => {
    const response = await API.get("/restaurants", { params });
    return response.data;
};

export const getRestaurantById = async (id) => {
    const response = await API.get(`/restaurants/${id}`);
    return response.data;
};