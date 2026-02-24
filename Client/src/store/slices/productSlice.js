import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../API/axiosClient";


const getProduct = createAsyncThunk(
   "product/getProduct",
   async (productId, { rejectWithValue }) => {
      try {
         const res = await axiosClient.get();
         return res.data.data;
      } catch (err) {
         return rejectWithValue(
            err.response?.data?.message || "Failed to fetch product"
         );
      }
   }
);


const productSlice = createSlice({
   name: "product",
   initialState: {
      loading: false,
      products: {},
   },
   reducers: {},
   extraReducers: (builder) => {
      builder
      .addCase(getProduct.pending, (state) => {
         state.loading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
         state.loading = false;
         state.products = action.payload;
      })
      .addCase(getProduct.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload;
      });
   },
});

export default productSlice.reducer;