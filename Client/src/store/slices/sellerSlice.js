import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../API/axiosClient';

export const registerSeller = createAsyncThunk(
   'seller/register',
   async (sellerData, { rejectWithValue }) => {
      try {
         const response = await axiosClient.post('/seller/register', sellerData);
         return response.data;
      } catch (error) {
         return rejectWithValue(error);
      }
   }
);

export const removeSeller = createAsyncThunk(
   'seller/remove',
   async (_, { rejectWithValue }) => {
      try {
         await axiosClient.post('/seller/remove');
         return null;
      } catch (error) {
         return rejectWithValue({
            message: error.response?.data?.message || ' failed',
            status: error.response?.status || 500,
         });
      }
   }
);

const sellerSlice = createSlice({
   name: 'seller',
   initialState: {
      seller: null,
      loading: false,
      error: null,
   },

   reducers: {},

   extraReducers: (builder) => {
      builder

         .addCase(registerSeller.pending, state => {
            state.loading = true;
            state.error = null;
         })
         .addCase(registerSeller.fulfilled, (state, action) => {
            state.loading = false;
            state.seller = action.payload;
         })
         .addCase(registerSeller.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Something went wrong';
            state.seller = null;
         })

         // Login User Cases
         .addCase(removeSeller.pending, state => {
            state.loading = true;
            state.error = null;
         })
         .addCase(removeSeller.fulfilled, (state, action) => {
            state.loading = false;
            state.seller = action.payload;
         })
         .addCase(removeSeller.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.response?.data || 'Something went wrong';
            state.seller = null;
         });
   },
});

export default sellerSlice.reducer;
