import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../API/axiosClient";



export const fetchCart = createAsyncThunk(
   "cart/fetchCart",
   async (_, { rejectWithValue }) => {
      try {
         const res = await axiosClient.get("/cart");
         return res.data.data;
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || error.message || "Failed to fetch cart"
         );
      }
   }
);


export const addToCart = createAsyncThunk(
   "cart/addToCart",
   async ({ productId, quantity=1 }, { rejectWithValue }) => {
      try {
         const res = await axiosClient.post("/cart/add", { productId, quantity });
         return res.data.cart;
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || error.message || "Failed to add item to cart"
         );
      }
   }
);


export const removeFromCart = createAsyncThunk(
   "cart/removeFromCart",
   async (productId, { rejectWithValue }) => {
      try {
         const res = await axiosClient.patch(`/cart/remove/${productId}`);
         return res.data.data.items;
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || error.message || "Failed to remove item"
         );
      }
   }
);


export const removeItemCompletely= createAsyncThunk(
   "cart/removeItemCompletely",
   async (productId, { rejectWithValue }) => {
      try {
         const res = await axiosClient.delete(`/cart/delete/${productId}`);
         return res.data.data;
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || error.message || "Failed to remove item"
         );
      }
   }
);


export const clearCart = createAsyncThunk(
   "cart/clearCart",
   async (_, { rejectWithValue }) => {
      try {
         const res = await axiosClient.delete("/cart/clear");
         return res.data.cart;
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || error.message || "Failed to clear cart"
         );
      }
   }
);


const initialState = {
   cart: null,
   loading: false,
   error: null,
   adding: false,
   removing: false,
   clearing: false,
   
   successMessage: null,
};


const cartSlice = createSlice({
   name: "cart",
   initialState,
   reducers: {
      clearError: (state) => {
         state.error = null;
      },
      
      clearSuccessMessage: (state) => {
         state.successMessage = null;
      },
      
      resetCart: (state) => {
         state.cart = null;
         state.loading = false;
         state.error = null;
         state.adding = false;
         state.removing = false;
         state.clearing = false;
         state.successMessage = null;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchCart.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchCart.fulfilled, (state, action) => {
            state.loading = false;
            state.cart = action.payload;
         })
         .addCase(fetchCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         .addCase(addToCart.pending, (state) => {
            state.adding = true;
            state.error = null;
            state.successMessage = null;
         })
         .addCase(addToCart.fulfilled, (state, action) => {
            state.adding = false;
            state.cart = action.payload;
            state.successMessage = "Cart updated successfully";
         })
         .addCase(addToCart.rejected, (state, action) => {
            state.adding = false;
            state.error = action.payload;
         })

         .addCase(removeFromCart.pending, (state) => {
            state.removing = true;
            state.error = null;
            state.successMessage = null;
         })
         .addCase(removeFromCart.fulfilled, (state, action) => {
            state.removing = false;
            state.cart = action.payload;
            state.successMessage = "Item removed from cart";
         })
         .addCase(removeFromCart.rejected, (state, action) => {
            state.removing = false;
            state.error = action.payload;
         })

         .addCase(removeItemCompletely.pending, (state) => {
            state.removing = true;
            state.error = null;
            state.successMessage = null;
         })
         .addCase(removeItemCompletely.fulfilled, (state, action) => {
            state.removing = false;
            state.cart = action.payload;
            state.successMessage = "Item removed from cart";
         })
         .addCase(removeItemCompletely.rejected, (state, action) => {
            state.removing = false;
            state.error = action.payload;
         })

         .addCase(clearCart.pending, (state) => {
            state.clearing = true;
            state.error = null;
            state.successMessage = null;
         })
         .addCase(clearCart.fulfilled, (state, action) => {
            state.clearing = false;
            state.cart = action.payload;
            state.successMessage = "Cart cleared successfully";
         })
         .addCase(clearCart.rejected, (state, action) => {
            state.clearing = false;
            state.error = action.payload;
         });
   },
});

export const { clearError, clearSuccessMessage, resetCart } = cartSlice.actions;
export default cartSlice.reducer;