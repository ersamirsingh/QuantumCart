import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../API/axiosClient";



export const placeOrder = createAsyncThunk(
   "orders/placeOrder",
   async (orderData, { rejectWithValue }) => {
      try {
         const res = await axiosClient.post('/order/create', orderData);
         return res.data;
      } catch (err) {
         return rejectWithValue(
            err.response?.data?.message || "Failed to place order"
         );
      }
   }
);


export const fetchOrders = createAsyncThunk(
   "orders/fetchOrders",
   async (_, { rejectWithValue }) => {
      try {
         const res = await axiosClient.get(`/user/orders`);
         return res.data;
      } catch (err) {
         return rejectWithValue(
            err.response?.data?.message || "Failed to fetch orders"
         );
      }
   }
);


// export const fetchOrderById = createAsyncThunk(
//    "orders/fetchOrderById",
//    async (orderId, { rejectWithValue }) => {
//       try {
//          const res = await axiosClient.get(`${API_BASE}/orders/${orderId}`, {
//             withCredentials: true,
//          });
//          return res.data.data;
//       } catch (err) {
//          return rejectWithValue(
//             err.response?.data?.message || "Failed to fetch order"
//          );
//       }
//    }
// );


export const cancelOrder = createAsyncThunk(
   "orders/cancelOrder",
   async (orderId, { rejectWithValue }) => {
      try {
         const res = await axiosClient.patch(`/order/cancel/${orderId}`);
         return res.data; // { order }
      } catch (err) {
         return rejectWithValue(
            err.response?.data?.message || "Failed to cancel order"
         );
      }
   }
);


export const fetchAddresses = createAsyncThunk(
   "orders/fetchAddresses",
   async (_, { rejectWithValue }) => {
      try {
         const res = await axiosClient.get('/user/get/addresses');
         return res.data.data; 
      } catch (err) {
         return rejectWithValue(
            err.response?.data?.message || "Failed to fetch addresses"
         );
      }
   }
);


export const addAddress = createAsyncThunk(
   "orders/addAddress",
   async (addressData, { rejectWithValue }) => {
      try {
         const res = await axiosClient.post('/user/add/address', addressData);
         return res.data.data;
      } catch (err) {
         return rejectWithValue(
            err.response?.data?.message || "Failed to add address"
         );
      }
   }
);


const ordersSlice = createSlice({
   name: "orders",
   initialState: {
      // Orders list
      orders: [],
      ordersLoading: false,
      ordersError: null,

      // Single order detail
      currentOrder: null,
      orderLoading: false,
      orderError: null,

      // Placing order
      placing: false,
      placeError: null,
      placedOrder: null,   // last successfully placed order

      // Cancel
      cancelling: false,
      cancelError: null,

      // Addresses
      addresses: [],
      addressesLoading: false,
      addressesError: null,
      addingAddress: false,
      addAddressError: null,

      // Success messages
      successMessage: null,
   },

   reducers: {
      clearPlacedOrder(state) { state.placedOrder = null; },
      clearSuccessMessage(state) { state.successMessage = null; },
      clearOrderErrors(state) {
         state.placeError = null;
         state.cancelError = null;
         state.ordersError = null;
         state.orderError = null;
      },
   },

   extraReducers: (builder) => {
      builder
         .addCase(placeOrder.pending, (s) => {
            s.placing = true; s.placeError = null; 
         })
         .addCase(placeOrder.fulfilled, (s, a) => {
            s.placing = false;
            s.placedOrder = a.payload.order ?? a.payload;
            s.successMessage = "Order placed successfully!";
            if (a.payload.order) 
               s.orders.unshift(a.payload.order);
         })
         .addCase(placeOrder.rejected, (s, a) => { 
            s.placing = false; s.placeError = a.payload; 
         })

   
         .addCase(fetchOrders.pending, (s) => { 
            s.ordersLoading = true; 
            s.ordersError = null; 
         })
         .addCase(fetchOrders.fulfilled, (s, a) => {
            s.ordersLoading = false;
            s.orders = a.payload.orders ?? a.payload ?? [];
         })
         .addCase(fetchOrders.rejected, (s, a) => { 
            s.ordersLoading = false; 
            s.ordersError = a.payload; 
         })

      
         // .addCase(fetchOrderById.pending, (s) => { s.orderLoading = true; s.orderError = null; s.currentOrder = null; })
         // .addCase(fetchOrderById.fulfilled, (s, a) => {
         //    s.orderLoading = false;
         //    s.currentOrder = a.payload.order ?? a.payload;
         // })
         // .addCase(fetchOrderById.rejected, (s, a) => { s.orderLoading = false; s.orderError = a.payload; });

         .addCase(cancelOrder.pending, (s) => { 
            s.cancelling = true; 
            s.cancelError = null; 
            s.successMessage = null;
         })
         .addCase(cancelOrder.fulfilled, (s, a) => {
            s.cancelling = false;
            s.successMessage = "Order cancelled successfully";
            const updated = a.payload.order ?? a.payload;
            s.orders = s.orders.map((o) => (o._id === updated._id ? updated : o));
            if (s.currentOrder?._id === updated._id) s.currentOrder = updated;
         })
         .addCase(cancelOrder.rejected, (s, a) => {
            s.cancelling = false; 
            s.cancelError = a.payload; 
         })

         .addCase(fetchAddresses.pending, (s) => { s.addressesLoading = true; })
         .addCase(fetchAddresses.fulfilled, (s, a) => {
            s.addressesLoading = false;
            s.addresses = a.payload.addresses ?? a.payload ?? [];
         })
         .addCase(fetchAddresses.rejected, (s, a) => { 
            s.addressesLoading = false; 
            s.addressesError = a.payload; 
         })

         .addCase(addAddress.pending, (s) => { 
            s.addingAddress = true; 
            s.addAddressError = null; 
         })
         .addCase(addAddress.fulfilled, (s, a) => {
            s.addingAddress = false;
            const addr = a.payload.address ?? a.payload;
            s.addresses.push(addr);
         })
         .addCase(addAddress.rejected, (s, a) => { 
            s.addingAddress = false; 
            s.addAddressError = a.payload; 
         });
   },
});

export const { clearPlacedOrder, clearSuccessMessage, clearOrderErrors } = ordersSlice.actions;
export default ordersSlice.reducer;