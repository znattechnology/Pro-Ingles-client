'use client';
import {configureStore} from "@reduxjs/toolkit";
import { apiSlice } from "./features/api/apiSlice";
import authSlice from "./features/auth/authSlice";
import { adminApi } from "./features/admin/adminApi";
import laboratorySlice from "./features/laboratory/laboratorySlice";
// Import practiceApiSlice to ensure endpoints are registered
import "./features/api/practiceApiSlice";
// Import laboratoryApiSlice to ensure endpoints are registered
import "./features/laboratory/laboratoryApiSlice";

export const store = configureStore({
    reducer:{
        [apiSlice.reducerPath]: apiSlice.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        auth: authSlice,
        laboratory: laboratorySlice
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