import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../api/axios";

export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async(_, thunkAPI) => {
        try{
            const response = await api.get("/products");
            return response.data;
        }catch(error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch products"
            );
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const productSlice = createSlice ({
    name: "Products",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder 
        .addCase(fetchProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
        })
        .addCase(fetchProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default productSlice.reducer;