import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

// Thunk for checking authentication
export const refetchCards = createAsyncThunk(
    "card/refetch",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${baseUrl}/api/saveCard/view/saveCard`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            return response.data.savedCards; // Assuming the server returns `{ success: true, savedCards: {...} }`
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to authenticate");
        }
    }
);



const cardSlice = createSlice({
    name: "card",
    initialState: {
        cards: []
    },
    extraReducers: (builder) => {
        builder
            .addCase(refetchCards.fulfilled, (state, action) => {
                console.log(action, "action")
                state.cards = action.payload;
            })
            .addCase(refetchCards.rejected, (state, action) => {
                state.cards = [];
                console.log(action, "rejected")
            })
    },
});

export default cardSlice.reducer;
