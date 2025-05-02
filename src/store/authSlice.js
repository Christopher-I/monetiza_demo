import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

// Thunk for checking authentication
export const checkAuthentication = createAsyncThunk(
    "auth/checkAuthentication",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${baseUrl}/api/auth/check-auth`, {
                withCredentials: true,
            });
            return response.data; // Assuming the server returns `{ success: true, user: {...} }`
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to authenticate");
        }
    }
);

// export const updateLoading = createAsyncThunk(
//     "auth/loading",
//     async (state, { rejectWithValue }) => {
//         try {
//             return;
//         } catch (error) {
//             return rejectWithValue("Failed to update loading");
//         }
//     }
// );

// Thunk for signing in
export const signin = createAsyncThunk(
    "auth/signin",
    async (formData, { rejectWithValue }) => {
        console.log("form Data", formData)
        try {
            const response = await axios.post(`${baseUrl}/api/auth/signin${formData.code ? "-otp": ""}`, formData, {
                withCredentials: true,
            });
            if (response.data.success) {
                console.log(response.data)
                if (response.data?.message === "an OTP has been sent to you") {
                    throw ({messaged: {...response.data, messaged: "otp required"}});
                }
                return response.data; // Assuming the server returns `{ success: true, user: {...}, token: "..." }`
            } else {
                return rejectWithValue(response.data.message || "Sign-in failed");
            }
        } catch (error) {
            console.log(error, "error")
            return rejectWithValue(error.response?.data?.message || JSON.stringify(error.messaged) || "Sign-in error");
        }
    }
);

// Thunk for getting Logged in user
export const getLoggedUser = createAsyncThunk(
    "auth/getuser",
    async (formData, { rejectWithValue }) => {
        console.log("form Data", formData)
        try {
            const response = await axios.post(`${baseUrl}/api/auth/`, formData, {
                withCredentials: true,
            });
            if (response.data.success) {
                console.log(response.data)
                return response.data;
            } else {
                return rejectWithValue(response.data.message || "get user failed");
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || "get user error");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isAuthenticated: null,
        user: null,
        unRead: false,
        token: null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
        },
        addUnread: (state, action) => {
            state.unRead = action.payload;
        },
        loading: (state, action) => {
            state.loading = true;
        },
        notLoading: (state, action) => {
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Check Authentication
            .addCase(checkAuthentication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuthentication.fulfilled, (state, action) => {
                state.isAuthenticated = action.payload.success;
                state.user = action.payload.user || null;
                state.loading = false;
            })
            .addCase(checkAuthentication.rejected, (state, action) => {
                state.isAuthenticated = false;
                state.error = action.payload || "Authentication failed";
                state.loading = false;
            })
            // Sign-in
            .addCase(signin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signin.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user || null;
                state.token = action.payload.token || null;
                state.loading = false;

                console.log("User stored in Redux:", state.user); // Debugging Log

            })
            .addCase(signin.rejected, (state, action) => {
                state.isAuthenticated = false;
                state.error = action.payload || "Sign-in failed";
                state.loading = false;
            });
    },
});

export const { logout, addUnread, loading, notLoading } = authSlice.actions;
export default authSlice.reducer;
