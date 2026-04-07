import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import sellerReducer from './slices/seller.slice'
import userReducer from './slices/user.slice'
import cartReducer from './slices/cart.slice'
import orderReducer from './slices/order.slice'
import productReducer from './slices/product.slice'

export const store = configureStore({

  reducer: {
    auth: authReducer,
    seller: sellerReducer,
    user: userReducer,
    cart: cartReducer,
    orders: orderReducer,
    products: productReducer
  }

});

