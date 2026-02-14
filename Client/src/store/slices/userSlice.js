import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../API/axiosClient';

export const getInfo = createAsyncThunk(
   'user/info',
   async (_, { rejectWithValue }) => {
      try {
         const response = await axiosClient.post('/user/info');
         return response.data;
      } catch (error) {
         return rejectWithValue(error);
      }
   }
);

export const updateUser  = createAsyncThunk(
   'user/update',
   async (userInfo, { rejectWithValue }) => {
      try {
         await axiosClient.patch('/user/update', userInfo);
         return null;
      } catch (error) {
         return rejectWithValue({
            message: error.response?.data?.message || ' failed',
            status: error.response?.status || 500,
         });
      }
   }
);

const userSlice = createSlice({
   name: 'user',
   initialState: {
      user: null,
      loading: false,
      error: null,
   },

   reducers: {},

   extraReducers: (builder) => {
      builder

         .addCase(getInfo.pending, state => {
            state.loading = true;
            state.error = null;
         })
         .addCase(getInfo.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
         })
         .addCase(getInfo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Something went wrong';
            state.user = null;
         })

         // Login User Cases
         .addCase(updateUser.pending, state => {
            state.loading = true;
            state.error = null;
         })
         .addCase(updateUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
         })
         .addCase(updateUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.response?.data || 'Something went wrong';
            state.user = null;
         });
   },
});

export default userSlice.reducer;
