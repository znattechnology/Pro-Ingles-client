import { apiSlice } from "../api/apiSlice";


export const analyticsApi = apiSlice.injectEndpoints({
    endpoints:(builder) => ({
        getCoursesAnalytics: builder.query({
            query: () => ({
                url:"http://localhost:8000/api/v1/get-courses-analytics",
                method: "GET",
                credentials: "include" as const
            }),
        }),
        getOrdersAnalytics: builder.query({
            query: () => ({
                url:"http://localhost:8000/api/v1/get-orders-analytics",
                method: "GET",
                credentials: "include" as const
            }),
        }),

        getUsersAnalytics: builder.query({
            query: () => ({
                url:"http://localhost:8000/api/v1/get-uesrs-analytics",
                method: "GET",
                credentials: "include" as const
            }),
        }),
    })
})

export const {useGetCoursesAnalyticsQuery, useGetOrdersAnalyticsQuery, useGetUsersAnalyticsQuery} = analyticsApi;