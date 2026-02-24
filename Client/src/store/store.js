import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sellerReducer from './slices/sellerSlice'
import userReducer from './slices/userSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'
// import productReducer from './slices/productSlice'

export const store = configureStore({

  reducer: {
    auth: authReducer,
    seller: sellerReducer,
    user: userReducer,
    cart: cartReducer,
    orders: orderReducer,
    // product: productReducer
  }

});

