// store/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

// Async thunk to fetch messages
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ receiverId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/api/message/all/${receiverId}`, {
        withCredentials: true,
      }); // Replace with your API endpoint
      console.log(response.data)
      return response.data.messages;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllConversations = createAsyncThunk(
  'chat/fetchAllConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/api/message/all-recent-message`, {
        withCredentials: true,
      }); // Replace with your API endpoint
      console.log(response.data)
      return response.data.messages;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);



// Async thunk to send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ receiverId, message }
    , { rejectWithValue }) => {
    console.log(receiverId)
    try {
      const response = await axios.post(
        `${baseUrl}/api/message/send/${receiverId}`,
        { receiverId, textMessage: message },
        { withCredentials: true }
      ); // Replace with your API endpoint
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    activeChat: null,
    loading: false,
    convLoading: "idle",
    error: null,
    conversations: [], // Initialize as an empty array
  },
  reducers: {
    setActiveChat(state, action) {
      state.activeChat = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(fetchAllConversations.pending, (state) => {
        state.convLoading = "loading";
      })
      .addCase(fetchAllConversations.rejected, (state, action) => {
        state.convLoading = "failed";
        state.error = action.payload;
      })
      .addCase(fetchAllConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.convLoading = "success";
      });
  },
});

export const { setActiveChat } = chatSlice.actions;

export default chatSlice.reducer;
