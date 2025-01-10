import { apiSlice } from "../api/apiSlice";


export const courseApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createCourse: builder.mutation({
            query:( data ) => (
                {
                    url: "http://localhost:8000/api/v1/create-course",
                    method: "POST",
                    body:data ,
                    credentials:"include" as const,
                   
                }
            ),
        }),
        getAllCourses:builder.query({
            query:() => ({
                url:"http://localhost:8000/api/v1/get-admin-courses",
                method: "GET",
                credentials: "include" as const
            })
        }),
        deleteCourse: builder.mutation({
            query:(id)=>({
                url:`http://localhost:8000/api/v1/delete-course/${id}`,
                method:"DELETE",
                credentials:"include" as const
            })
        }),
        editCourse: builder.mutation({
            query:({id, data})=>({
                url:`http://localhost:8000/api/v1/edit-course/${id}`,
                body:data,
                method:"PUT",
                credentials:"include" as const
            })
        }),
        getUsersAllCourses:builder.query({
            query:() => ({
                url:"http://localhost:8000/api/v1/get-courses",
                method: "GET",
                credentials: "include" as const
            })
        }),
        getCourseDetails:builder.query({
            query:(id) => ({
                url:`http://localhost:8000/api/v1/get-course/${id}`,
                method: "GET",
                credentials: "include" as const
            })
        }),
        getCourseContent: builder.query({
            query: (id) => ({
              url: `http://localhost:8000/api/v1/get-course-content/${id}`,
              method: "GET",
              credentials: "include" as const,
            }),
          }),
          addNewQuestion: builder.mutation({
            query: ({ question, courseId, contentId }) => ({
              url: "http://localhost:8000/api/v1/add-question",
              body: {
                question,
                courseId,
                contentId,
              },
              method: "PUT",
              credentials: "include" as const,
            }),
          }),
          addAnswerInQuestion: builder.mutation({
            query: ({ answer, courseId, contentId, questionId }) => ({
              url: "http://localhost:8000/api/v1/add-answer",
              body: {
                answer,
                courseId,
                contentId,
                questionId,
              },
              method: "PUT",
              credentials: "include" as const,
            }),
          }),
          addReviewInCourse: builder.mutation({
            query: ({ review, rating, courseId }: any) => ({
              url: `http://localhost:8000/api/v1/add-review/${courseId}`,
              body: {
                review,
                rating,
              },
              method: "PUT",
              credentials: "include" as const,
            }),
          }),
          addReplyInReview: builder.mutation({
            query: ({ comment, courseId, reviewId }: any) => ({
              url: `http://localhost:8000/api/v1/add-replay`,
              body: {
                comment, courseId, reviewId
              },
              method: "PUT",
              credentials: "include" as const,
            }),

            
          }),
          getStreamVideoToken: builder.query({
            query: () => ({
              url: `http://localhost:8000/api/v1/getStreamToken`,
              method: "GET",
              credentials: "include" as const,
            }),
          }),
       
    
    }),
});

export const {useCreateCourseMutation,
     useDeleteCourseMutation,
     useGetAllCoursesQuery,
     useEditCourseMutation,
     useGetUsersAllCoursesQuery,
     useGetCourseDetailsQuery,
     useGetCourseContentQuery,
     useAddNewQuestionMutation,
     useAddAnswerInQuestionMutation,
     useAddReviewInCourseMutation,
     useAddReplyInReviewMutation,
     useGetStreamVideoTokenQuery,
    } = courseApi;