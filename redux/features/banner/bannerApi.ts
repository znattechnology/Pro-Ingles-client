




import { apiSlice } from "../api/apiSlice";

export const bannerApi = apiSlice.injectEndpoints({
    endpoints:(builder) => ({
        getBanner: builder.query({
            query:(type) =>({
                url:`http://localhost:8000/api/v1/get-banner`,
                method:"GET",
                credentials: "include" as const
            })
        }),
        createOrUpdateBanner: builder.mutation({
            query:({image, title, subTitle}) =>({
                url:"http://localhost:8000/api/v1/create-or-update-banner",
                method:"PUT",
                body: { image, title, subTitle },
                credentials: "include" as const
            })
        }),

    })
});



export const {useGetBannerQuery, useCreateOrUpdateBannerMutation} = bannerApi;
