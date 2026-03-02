import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../API/axiosClient';



export const registerSeller = createAsyncThunk(
   'seller/register',
   async (sellerData, { rejectWithValue }) => {
      try {
         const response = await axiosClient.post('/seller/register', sellerData);
         return response.data;
      } catch (err) {;
         return rejectWithValue({
            message: err.response?.data?.message || 'Register failed',
            status: err.response?.status || 500,
         });
      }
   }
);



export const removeSeller = createAsyncThunk(
   'seller/remove',
   async (_, { rejectWithValue }) => {
      try {
         await axiosClient.post('/seller/remove');
      } catch (err) {
         return rejectWithValue({
            message: err.response?.data?.message || 'Remove failed',
            status: err.response?.status || 500,
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


         .addCase(registerSeller.pending, (state) => {
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
         })


         .addCase(removeSeller.pending, (state) => {
            state.loading = true;
            state.error = null;
         })

         .addCase(removeSeller.fulfilled, (state) => {
            state.loading = false;
            state.seller = null;
         })

         .addCase(removeSeller.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Something went wrong';
         });
   },
});

export default sellerSlice.reducer;
