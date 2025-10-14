import { apiSlice } from "../api/apiSlice";

export const layoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBannerData: builder.query({
      query: (type) => ({
        url: `http://localhost:8000/api/v1/get-layout/${type}`,
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    editLayout: builder.mutation({
      query: ({ type, image, title, subTitle, faq, categories , partners, about, companyContact,description,vision,mission}) => ({
        url: "http://localhost:8000/api/v1/edit-layout/",
        method: "PUT",
        body: { type, image, title, subTitle, faq, categories, partners ,about, companyContact, description,vision,mission},
        credentials: "include" as const,
      }),
    }),
    createBanner: builder.mutation({
      query: ({ image, title, subTitle }) => ({
        url: "http://localhost:8000/api/v1/create-layout",
        method: "POST",
        body: { image, title, subTitle },
        credentials: "include" as const,
      }),
    }),
  }),
});

export const { useGetBannerDataQuery, useEditLayoutMutation, useCreateBannerMutation } = layoutApi;
