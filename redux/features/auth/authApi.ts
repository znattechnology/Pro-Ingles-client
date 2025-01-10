import { register } from "module";
import { apiSlice } from "../api/apiSlice";
import { userLoggedIn, userRegistration } from "./authSlice";
import { url } from "inspector";

type RegistrationResponse = {
    message: string;
    activationToken: string;
};

type RegistrationData = {};

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<RegistrationResponse,RegistrationData>({
            query:(data)=>({
                url:"http://localhost:8000/api/v1/registration",
                method: "POST",
                body: data,
                credentials: "include" as const,
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}){
                try {
                    const result = await queryFulfilled;
                    dispatch(
                        userRegistration({
                            token: result.data.activationToken,
                        })
                    )
                } catch (error:any) {
                    console.log(error);
                }
            }
        }),
        activation : builder.mutation({
            query:({
                activation_token, activation_code
            })=>({
                url:"http://localhost:8000/api/v1/activate-user",
                method: "POST",
                body:{
                    activation_code,
                    activation_token
                },
            }),
            
        }),
        login: builder.mutation({
            query:({email,password})=>({
                url:"http://localhost:8000/api/v1/login",
                method: "POST",
                body:{
                    email,
                    password
                },
                credentials: "include" as const,
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}){
                try {
                    const result = await queryFulfilled;
                    dispatch(
                        userLoggedIn({
                            accessToken: result.data.activationToken,
                            user: result.data.user,
                        })
                    )
                } catch (error:any) {
                    console.log(error);
                }
            }
        }),
        logOut: builder.query({
            query:()=>({
                url:"http://localhost:8000/api/v1/logout",
                method: "GET",
            
                credentials: "include" as const,
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}){
                try {
                    
                    dispatch(
                        userLoggedIn({
                            accessToken: "",
                            user: "",
                        })
                    )
                } catch (error:any) {
                    console.log(error);
                }
            }
        })

      
    }),
    

});

export const {useRegisterMutation, useActivationMutation, useLoginMutation,useLogOutQuery} = authApi;