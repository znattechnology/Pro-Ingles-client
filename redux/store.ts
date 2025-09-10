'use client';
import {configureStore} from "@reduxjs/toolkit";
import { apiSlice } from "./features/api/apiSlice";
import authSlice from "./features/auth/authSlice";
import { adminApi } from "./features/admin/adminApi";

export const store = configureStore({
    reducer:{
        [apiSlice.reducerPath]: apiSlice.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        auth: authSlice
    },
    devTools:false,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(
            apiSlice.middleware,
            adminApi.middleware
        )
});

// call the refresh token function on every page load

const initializeApp = async()=>{
    await store.dispatch(apiSlice.endpoints.loadUser.initiate({}, {forceRefetch: true}));
    // await store.dispatch(apiSlice.endpoints.loadUser.initiate({}, {forceRefetch: true}));
    
};

initializeApp();