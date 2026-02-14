import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sellerReducer from './slices/sellerSlice'
import userReducer from './slices/userSlice'


export const store = configureStore({

  reducer: {
    auth: authReducer,
    seller: sellerReducer,
    user:userReducer
  }

});

