
import { apiSlice } from "../api/apiSlice";

export const learningApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getCoursesQuiz: builder.query({
            query: () => ({
                url: "http://localhost:8000/api/v1/get-courses-quiz",
                method: "GET",
                credentials: "include" as const
            })
        }),
        
        getUserProgress: builder.query({
            query: () => ({
                url: "http://localhost:8000/api/v1/user-progress",
                method: "GET",
                credentials: "include" as const
            })
        }),

        // Novo endpoint para buscar curso pelo ID
        getCourseQuizById: builder.query({
            query: (courseId) => ({
               
                url: `http://localhost:8000/api/v1/get-course-byId/${courseId}`, // Passa o ID como parte da URL
                method: "GET",
                credentials: "include" as const
            })
        }),

        upsertUserProgress: builder.mutation({
            query: (courseId) => ({
              url: "http://localhost:8000/api/v1/upsert-user-progress",
              method: "POST",
              body: { courseId },  // Envia o courseId no corpo da requisição
              credentials: "include" as const
            })
          }),
               // Novo endpoint para buscar unidades
        getUnits: builder.query({
            query: () => ({
                url: "http://localhost:8000/api/v1/get-units",
                method: "GET",
                credentials: "include" as const
            })
        }),
    
    }),
});

export const {
    useGetCoursesQuizQuery,
    useGetUserProgressQuery,
    useUpsertUserProgressMutation,
    useGetCourseQuizByIdQuery, // Exporta o hook para o novo endpoint
    useGetUnitsQuery // Hook para o novo endpoint
    
} = learningApi;







// import { apiSlice } from "../api/apiSlice";


// export const learningApi = apiSlice.injectEndpoints({
//     endpoints: (builder) => ({

//         getCoursesQuiz:builder.query({
//             query:() => ({
//                 url:"http://localhost:8000/api/v1/get-courses-quiz",
//                 method: "GET",
//                 credentials: "include" as const
//             })
//         }),
//         getUserProgress:builder.query({
//             query:(id) => ({
//                 url:"http://localhost:8000/api/v1/user-progress",
//                 method: "GET",
//                 credentials: "include" as const
//             })
//         }),
     
    
//     }),
// });

// export const {
     
//      useGetCoursesQuizQuery,
//      useGetUserProgressQuery,
  
   
//     } = learningApi;