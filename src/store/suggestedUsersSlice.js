// store/slices/suggestedUsersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

// Async thunk to fetch suggested users
export const fetchSuggestedUsers = createAsyncThunk(
  'suggestedUsers/fetchSuggestedUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/api/auth/suggested-users`, {
        withCredentials: true,
      }); // Replace with your API endpoint
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const suggestedUsersSlice = createSlice({
  name: 'suggestedUsers',
  initialState: {
    users: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestedUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default suggestedUsersSlice.reducer;
