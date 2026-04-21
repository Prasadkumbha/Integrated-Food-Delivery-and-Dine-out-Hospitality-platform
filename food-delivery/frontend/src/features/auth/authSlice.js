import { createSlice } from "@reduxjs/toolkit";

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

    const initialState = {
        user: user || null,
        token: token || null,
        isAuthenticated: !!token,
    };

    const authSlice = createSlice({
        name: "auth",
        initialState,
        reducers: {
            setCredentials: (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            },
            logoutUser: (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            },
        },
    });

    export const { setCredentials, logoutUser } =
    authSlice.actions;
    export default authSlice.reducer;
