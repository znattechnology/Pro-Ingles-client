import { apiSlice } from "../api/apiSlice";

export const companyContactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCompanyContacts: builder.query({
      query: () => ({
        url: `http://localhost:8000/api/v1/get-contacts`,
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    createCompanyContact: builder.mutation({
      query: (contactData) => ({
        url: "http://localhost:8000/api/v1/create-contact",
        method: "POST",
        body: contactData,
        credentials: "include" as const,
      }),
    }),
    updateCompanyContact: builder.mutation({
      query: ({ id, contactData }) => ({
        url: `http://localhost:8000/api/v1/update-contact/${id}`,
        method: "PUT",
        body: contactData,
        credentials: "include" as const,
      }),
    }),
    deleteCompanyContact: builder.mutation({
      query: (id) => ({
        url: `http://localhost:8000/api/v1/delete-contact/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
    }),
  }),
});

// Exportando os hooks gerados
export const {
  useGetAllCompanyContactsQuery,
  useCreateCompanyContactMutation,
  useUpdateCompanyContactMutation,
  useDeleteCompanyContactMutation,
} = companyContactApi;
