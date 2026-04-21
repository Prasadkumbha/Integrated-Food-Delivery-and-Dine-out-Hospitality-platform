import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
};

const cartSlice = createSlice ({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.playload;
            const existingItem = state.items.find((i) => i.id === item.id);

            if(existingItem) {
                existingItem.quantity += 1;

            }else {
                state.items.push({ ...item, quantity: 1 });
            }
        },

        remoceFromCart: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },

        increaseQty: (state, action) => {
            const item = state.items.find((i) => i.id === action.payload);
            if(item) item.quantity += 1;
        },

        decreaseQty: (state, action) => {
            const item = state.items.find((i) => i.id === action.payload);
            if(item && item.quantity > 1) {
                item.quantity -= 1;
            }
        },

        clearCart: (state) => {
            state.items = [];
            state.subtotal = 0;
            state.discount = 0;
            state.tax = 0;
            state.total = 0;
        },

        calculateTotals: (state) => {{
            const subtotal = state.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            const discount = subtotal > 1000 ? subtotal * 0.1 : 0;
            const tax = (subtotal - discount) * 0.05;
            const total = subtotal - discount + tax;

            state.subtotal = subtotal;
            state.discount = discount;
            state.tax = tax;
            state.total = total;
        }
    },
    }
});

export const {
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    calculateTotals,

} = cartSlice.actions;

export default cartSlice.reducer;