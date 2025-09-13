import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";

const DJANGO_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

export const apiSlice = createApi({
    reducerPath:"apiSlice",
    baseQuery: fetchBaseQuery({
        baseUrl: DJANGO_BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: [
        'User', 
        'Course', 
        'Auth', 
        'UserProgress', 
        'CourseUnits', 
        'CourseUnitsWithProgress',
        'LessonDetail',
        'LessonPercentage',
        'Leaderboard',
        'Leagues',
        'Competitions',
        'UserPosition',
        'Achievements',
        'AchievementStats',
        'AchievementCategories',
        'AchievementNotifications'
    ],
    endpoints: (builder)=> ({
        loadUser:builder.query({
            query:()=>({
                url:"/users/profile/",
                method: "GET"
            }),
            providesTags: ['User'],
            async onQueryStarted(_, {queryFulfilled, dispatch}){
                try {
                    const result = await queryFulfilled;
                    dispatch(
                        userLoggedIn({
                            accessToken: localStorage.getItem('access_token') || '',
                            refreshToken: localStorage.getItem('refresh_token') || '',
                            user: result.data,
                        })
                    )
                } catch (error:any) {
                    console.log(error);
                }
            }
        })
    }),
});

export const {useLoadUserQuery} = apiSlice;