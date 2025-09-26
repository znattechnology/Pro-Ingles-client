import {createApi} from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "@modules/auth";
import { createBaseQueryWithReauth } from './baseQueryWithReauth';

const DJANGO_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

export const apiSlice = createApi({
    reducerPath:"apiSlice",
    baseQuery: createBaseQueryWithReauth(DJANGO_BASE_URL),
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
        'AchievementNotifications',
        'TeacherLeaderboard',
        'TeacherLeaderboardStats',
        'TeacherCompetitions',
        'CompetitionAnalytics',
        'StudentEngagement',
        // Laboratory/Practice course tags
        'LaboratoryCourses',
        'PracticeCourses',
        'PracticeCourse',
        'PracticeAnalytics',
        'Analytics',
        'StudentProgress',
        // Chapter/Course resource tags
        'ChapterResource',
        'ChapterQuiz',
        'QuizAttempt',
        'QuizSummary'
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