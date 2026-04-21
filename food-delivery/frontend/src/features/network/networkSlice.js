import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    online: navigator.onLine,
};

const networkSice = createSlice({
    name: "network",
    initialState,
    reducers: {
        setOnlineStatus: (state, action) => {
            state.online = action.payload;
        },
    },
});

export const { setOnlineStatus } = networkSice.actions;
export default networkSice;