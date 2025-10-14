import { apiSlice } from "../api/apiSlice";

export const learningApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUserProgress: builder.query({
            query: () => ({
                url: "http://localhost:8000/api/v1/user-progress",
                method: "GET",
                credentials: "include" as const,


            }),
        }),
        getCourses: builder.query({
            query: () => ({
                url: "http://localhost:8000/api/courses-quiz",
                method: "GET",
                credentials: "include" as const,
            }),
        }),
        enrollInCourse: builder.mutation({
            query: (courseId) => ({
                url: "http://localhost:8000/api/learning/enroll",
                method: "POST",
                body: { courseId },
                credentials: "include" as const,
            }),
        }),
        completeLesson: builder.mutation({
            query: ({ courseId, lessonId }) => ({

                url: "http://localhost:8000/api/complete-lesson",
                method: "POST",
                body: { courseId, lessonId },
                credentials: "include" as const,
            }),
        }),
        createCourseQuiz: builder.mutation({
            query: (data) => ({
                url: "http://localhost:8000/api/v1/create-course",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useGetUserProgressQuery,
    useGetCoursesQuery,
    useEnrollInCourseMutation,
    useCompleteLessonMutation,
    useCreateCourseQuizMutation
} = learningApi;
