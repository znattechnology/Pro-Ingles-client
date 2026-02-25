import {createApi} from "@reduxjs/toolkit/query/react";
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
        'QuizSummary',
        // User settings tags
        'NotificationSettings'
    ],
    endpoints: (builder)=> ({
        // Base API slice - endpoints moved to specific domain APIs
    }),
});

// Hooks exported from domain-specific API slices