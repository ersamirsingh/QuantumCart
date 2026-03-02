import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../API/axiosClient";


export const getProducts = createAsyncThunk(
   "product/getProduct",
   async (_, { rejectWithValue }) => {
      try {
         const res = await axiosClient.get('/product');
         console.log(res.data)
         return res.data;
      } catch (err) {
         return rejectWithValue(
            err.response?.data?.message || "Failed to fetch product"
         );
      }
   }
);


export const fetchProductById = createAsyncThunk(
   'product/fetchProductById',
   async (productId, { rejectWithValue }) => {
      try {
         const res = await axiosClient.get( `/product/${productId}`);
         return res.data;
      } catch (err) {
         return rejectWithValue(err.response?.data?.message || "Failed to fetch product")
      }
   }
)


const productSlice = createSlice({
   name: "product",
   initialState: {
      loading: false,
      products: {},
   },
   reducers: {},

   extraReducers: (builder) => {
      builder
      .addCase(getProducts.pending, (state) => {
         state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
         state.loading = false;
         state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload;
      })

      .addCase(fetchProductById.pending, (state) => {
         state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
         state.loading = false;
         state.products = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload;
      })
   },
});


export default productSlice.reducer;