import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../API/axiosClient";

export const addToCart = createAsyncThunk(
   "cart/add",
   async (product, { rejectWithValue }) => {
      try {
         const response = await axiosClient.post("/cart/add", product);
         return response.data.cart; // backend should return updated cart
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || "Failed to add product"
         );
      }
   }
);



export const removeFromCart = createAsyncThunk(
   "cart/remove",
   async (product, { rejectWithValue }) => {
      try {
         const response = await axiosClient.post("/cart/remove", product);
         return response.data.cart;
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || "Failed to remove product"
         );
      }
   }
);




const cartSlice = createSlice({
   name: "cart",
   initialState: {
      items: [],
      loading: false,
      error: null,
   },
   reducers: {
      clearCart: (state) => {
         state.items = [];
      },
   },
   extraReducers: (builder) => {
      builder

         .addCase(addToCart.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(addToCart.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
         })
         .addCase(addToCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         .addCase(removeFromCart.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(removeFromCart.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
         })
         .addCase(removeFromCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         });
   },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;