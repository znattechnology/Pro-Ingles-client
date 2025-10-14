import { apiSlice } from "../api/apiSlice";



export const userApi = apiSlice.injectEndpoints({
    endpoints:(builder) =>({
        updateAvatar: builder.mutation({
            query:(avatar) => ({
                url:"http://localhost:8000/api/v1/update-user-avatar",
                method:"PUT",
                body:{avatar},
                credentials:"include" as const,
            })
        }),
        editProfile: builder.mutation({
            query:({name}) => ({
                url:"http://localhost:8000/api/v1/update-user-info",
                method:"PUT",
                body:{name},
                credentials:"include" as const,
            })
        }),
        updatePassword: builder.mutation({
            query:({oldPassword, newPassword}) => ({
                url:"http://localhost:8000/api/v1/update-user-password",
                method:"PUT",
                body:{oldPassword,newPassword},
                credentials:"include" as const,
            })
        }),
        getAllUsers: builder.query({
            query:()=>({
                url:"http://localhost:8000/api/v1/get-users",
                method:"GET",
                credentials:"include" as const
            })
        }),
        updateUserRole: builder.mutation({
            query:({email,role})=>({
                url:"http://localhost:8000/api/v1/update-user",
                method:"PUT",
                body:{email, role},
                credentials:"include" as const
            })
        }),
        deleteUser: builder.mutation({
            query:(id)=>({
                url:`http://localhost:8000/api/v1/delete-user/${id}`,
                method:"DELETE",
                credentials:"include" as const
            })
        }),
    })
});

export const {useUpdateAvatarMutation,useEditProfileMutation, useUpdatePasswordMutation ,useGetAllUsersQuery, useUpdateUserRoleMutation , useDeleteUserMutation} = userApi;