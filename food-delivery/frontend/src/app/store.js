import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/cartSlice";
import authReducer from "../features/auth/authSlice";
import networkReducer from "../features/network/networkSlice";
import productReducer from "../features/products//productsSlice";
import orderReducer from "../features/orders/orderSlice";

export const store = configureStore ({
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        network: networkReducer,
        products: productReducer,
        orders: orderReducer,
    },
});