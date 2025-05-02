// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import suggestedUsersReducer from "./suggestedUsersSlice";
import chatReducer from "./chatSlice";
import cardReducer from "./cardSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        suggestedUsers: suggestedUsersReducer,
        chat: chatReducer,
        card: cardReducer,
    },
});

export default store;
