import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../slices/authSlice'; 
// Create a Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer, 
  },
});
