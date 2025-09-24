/**
 * Laboratory API Slice - Enhanced RTK Query Implementation
 * 
 * Este slice centraliza todas as operações de API do laboratório,
 * fornecendo uma interface unificada para student e teacher dashboards.
 */

import { apiSlice } from "../api/apiSlice";
import { Course, Unit, Lesson, Challenge, ChallengeOption, UserProgress } from "./laboratorySlice";

// Extended types for API responses
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
}

export interface CourseWithUnits extends Course {
  units?: Unit[];
  practice_units?: Unit[];
  total_lessons?: number;
  total_challenges?: number;
  completed_units?: number;
  progress?: number;
}

export interface UnitWithLessons extends Unit {
  lessons: Lesson[];
}

export interface LessonWithChallenges extends Lesson {
  challenges: Challenge[];
}

export interface ChallengeWithOptions extends Challenge {
  options: ChallengeOption[];
}

export interface UnitsWithProgressResponse {
  course: Course;
  units: Unit[];
}

export interface ChallengeProgressRequest {
  challengeId: string;
  selectedOptionId: string;
  timeSpent?: number;
  attempts?: number;
}

export interface CourseCreationData extends Partial<Course> {
  teacher_id?: string;
  teacher_email?: string;
  teacher_name?: string;
  language?: string;
  created_by?: string;
  learningObjectives?: string[];
  targetAudience?: string;
  hearts?: number;
  pointsPerChallenge?: number;
  passingScore?: number;
}

// Teacher-specific types
export interface TeacherCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Draft' | 'Published' | 'Archived';
  units: number;
  lessons: number;
  challenges: number;
  students: number;
  completionRate: number;
  lastUpdated: string;
  createdAt: string;
}

export interface CourseCreationData {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  template: string;
}

export interface CourseUpdateData extends Partial<CourseCreationData> {
  status?: 'Draft' | 'Published' | 'Archived';
}

export interface CourseAnalytics {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalSessions: number;
  averageSessionTime: number;
}

export interface ChallengeProgressResponse {
  success: boolean;
  correct: boolean;
  pointsEarned: number;
  heartsUsed: number;
  explanation?: string;
  nextChallenge?: Challenge;
}

// API slice with enhanced endpoints
export const laboratoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // =============================================
    // STUDENT ENDPOINTS - Learning Flow
    // =============================================
    
    /**
     * Get all laboratory courses for student selection
     */
    getLaboratoryCourses: builder.query<CourseWithUnits[], void>({
      query: () => ({
        url: '/practice/courses/',
        method: 'GET',
        params: {
          include_stats: 'true' // Include statistics for student cards
        }
      }),
      transformResponse: (response: any[]) => {
        return response.map(course => ({
          ...course,
          // Ensure consistent property naming for statistics
          totalUnits: course.units_count || course.practice_units?.length || 0,
          total_lessons: course.lessons_count || course.total_lessons || 0,
          total_challenges: course.challenges_count || course.total_challenges || 0,
        }));
      },
      providesTags: ['LaboratoryCourses'],
    }),
    
    /**
     * Get user's current progress and active course
     */
    getUserProgress: builder.query<UserProgress, void>({
      query: () => ({
        url: '/practice/user-progress/',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        console.log('👤 User progress received:', response);
        return {
          hearts: response.hearts || 5,
          points: response.points || 0,
          user_image_src: response.user_image_src || '/mascot.jpg',
          active_course: response.active_course,
          streak: response.streak || 0,
        };
      },
      providesTags: ['UserProgress'],
    }),
    
    /**
     * Update user progress (set active course)
     */
    updateUserProgress: builder.mutation<UserProgress, { courseId: string }>({
      query: ({ courseId }) => ({
        url: '/practice/user-progress/',
        method: 'PATCH',
        body: { courseId },
      }),
      invalidatesTags: ['UserProgress'],
      // Optimistic update
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          laboratoryApiSlice.util.updateQueryData('getUserProgress', undefined, (draft) => {
            if (draft.active_course) {
              draft.active_course.id = courseId;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    /**
     * Get course units with user progress
     */
    getCourseUnitsWithProgress: builder.query<UnitsWithProgressResponse, string>({
      query: (courseId) => ({
        url: `/practice/courses/${courseId}/units-with-progress/`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        console.log('📖 Units with progress received:', response);
        
        // Handle different response structures
        if (response.units && Array.isArray(response.units)) {
          return {
            course: response.course,
            units: response.units,
          };
        } else if (Array.isArray(response)) {
          // Legacy format - just units array
          return {
            course: null,
            units: response,
          };
        }
        
        return {
          course: null,
          units: [],
        };
      },
      providesTags: (result, error, courseId) => [
        { type: 'CourseUnits', id: courseId },
        'CourseUnits',
      ],
    }),
    
    /**
     * Get lesson details with challenges
     */
    getLessonDetail: builder.query<LessonWithChallenges, string>({
      query: (lessonId) => ({
        url: `/practice/lessons/${lessonId}/`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        console.log('📝 Lesson detail received:', response);
        return {
          ...response,
          challenges: response.challenges || [],
        };
      },
      providesTags: (result, error, lessonId) => [
        { type: 'LessonDetail', id: lessonId },
        'LessonDetail',
      ],
    }),
    
    /**
     * Submit challenge progress
     */
    submitChallengeProgress: builder.mutation<ChallengeProgressResponse, ChallengeProgressRequest>({
      query: ({ challengeId, selectedOptionId }) => ({
        url: '/practice/challenge-progress/',
        method: 'POST',
        body: {
          challenge: challengeId,
          selected_option: selectedOptionId,
        },
      }),
      transformResponse: (response: any) => {
        console.log('✅ Challenge progress submitted:', response);
        return {
          success: response.success || false,
          correct: response.correct || false,
          pointsEarned: response.points_earned || response.pointsEarned || 0,
          heartsUsed: response.hearts_used || response.heartsUsed || 0,
          explanation: response.explanation,
          nextChallenge: response.next_challenge || response.nextChallenge,
        };
      },
      transformErrorResponse: (response: any) => {
        console.error('❌ Challenge submission error:', response);
        return response;
      },
      invalidatesTags: ['UserProgress', 'CourseUnits'],
      // Optimistic update para hearts/points
      async onQueryStarted({ challengeId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Update user progress optimistically
          dispatch(
            laboratoryApiSlice.util.updateQueryData('getUserProgress', undefined, (draft) => {
              draft.points += data.pointsEarned;
              draft.hearts = Math.max(0, draft.hearts - data.heartsUsed);
            })
          );
        } catch {
          // Error handling will be done by the component
        }
      },
    }),
    
    /**
     * Reduce hearts (when wrong answer)
     */
    reduceHearts: builder.mutation<{ hearts: number }, void>({
      query: () => ({
        url: '/practice/reduce-hearts/',
        method: 'POST',
      }),
      invalidatesTags: ['UserProgress'],
      // Optimistic update
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          laboratoryApiSlice.util.updateQueryData('getUserProgress', undefined, (draft) => {
            draft.hearts = Math.max(0, draft.hearts - 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    /**
     * Refill hearts (premium feature)
     */
    refillHearts: builder.mutation<{ hearts: number }, void>({
      query: () => ({
        url: '/practice/refill-hearts/',
        method: 'POST',
      }),
      invalidatesTags: ['UserProgress'],
      // Optimistic update
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          laboratoryApiSlice.util.updateQueryData('getUserProgress', undefined, (draft) => {
            draft.hearts = 5;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    // =============================================
    // TEACHER ENDPOINTS - Management Flow
    // =============================================
    
    /**
     * Get all practice courses for teacher management
     */
    getPracticeCourses: builder.query<CourseWithUnits[], { includeDrafts?: boolean }>({
      query: ({ includeDrafts = true } = {}) => ({
        url: '/practice/courses/',
        method: 'GET',
        params: { 
          ...(includeDrafts ? { include_drafts: 'true' } : {}),
          include_stats: 'true' // Always include statistics for teacher management
        },
      }),
      transformResponse: (response: any[]) => {
        console.log('🎓 Practice courses for teacher with statistics:', response);
        // Ensure consistency with expected fields
        return response.map(course => ({
          ...course,
          totalUnits: course.units_count || course.totalUnits || 0,
          total_lessons: course.lessons_count || course.total_lessons || 0,
          total_challenges: course.challenges_count || course.total_challenges || 0,
        }));
      },
      providesTags: ['PracticeCourses'],
    }),
    
    /**
     * Get specific practice course by ID
     */
    getPracticeCourseById: builder.query<CourseWithUnits, string>({
      query: (courseId) => ({
        url: `/practice/courses/${courseId}/`,
        method: 'GET',
      }),
      providesTags: (result, error, courseId) => [
        { type: 'PracticeCourse', id: courseId },
      ],
    }),
    
    /**
     * Create new practice course
     */
    createPracticeCourse: builder.mutation<Course, CourseCreationData>({
      query: (courseData) => {
        // DEFENSIVE PROGRAMMING: Validate courseData before sending
        const validatedData = {
          // Required fields with validation
          title: (courseData.title || '').trim(),
          description: (courseData.description || '').trim(),
          category: courseData.category || 'General',
          level: courseData.level || 'Beginner',
          
          // Optional fields with defaults
          template: courseData.template || 'general',
          status: courseData.status || 'Draft',
          
          // Teacher information (must be provided by frontend)
          teacher_id: courseData.teacher_id,
          teacher_email: courseData.teacher_email,
          teacher_name: courseData.teacher_name,
          
          // Additional metadata
          course_type: 'practice',
          language: courseData.language || 'pt-BR',
          created_by: courseData.created_by,
          
          // Learning configuration
          learningObjectives: courseData.learningObjectives || [],
          targetAudience: courseData.targetAudience || '',
          hearts: courseData.hearts || 5,
          pointsPerChallenge: courseData.pointsPerChallenge || 10,
          passingScore: courseData.passingScore || 70,
        };
        
        // Log the validated data for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('🛡️ DEFENSIVE - Validated course data before API call:', validatedData);
        }
        
        return {
          url: '/practice/courses/create/',
          method: 'POST',
          body: validatedData,
        };
      },
      invalidatesTags: ['PracticeCourses'],
      transformErrorResponse: (response: any) => {
        // Enhanced error handling
        console.error('❌ Course creation failed:', response);
        const errorMessage = response?.data?.error || response?.error || 'Failed to create course';
        return { message: errorMessage, status: response?.status };
      },
      // Optimistic update para melhor UX
      async onQueryStarted(courseData, { dispatch, queryFulfilled }) {
        try {
          const { data: newCourse } = await queryFulfilled;
          
          // Update the cache to immediately show the new course
          dispatch(
            laboratoryApiSlice.util.updateQueryData('getPracticeCourses', { includeDrafts: true }, (draft) => {
              if (newCourse && draft) {
                draft.unshift(newCourse);
              }
            })
          );
          
          console.log('✅ Course created successfully and cache updated:', newCourse);
        } catch (error) {
          console.error('💥 Failed to create course or update cache:', error);
          // If the request fails, the invalidation will handle refetching
        }
      },
    }),
    
    /**
     * Update practice course
     */
    updatePracticeCourse: builder.mutation<Course, { id: string; data: Partial<Course> }>({
      query: ({ id, data }) => ({
        url: `/practice/courses/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'PracticeCourses',
        { type: 'PracticeCourse', id },
      ],
      // Optimistic update
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          laboratoryApiSlice.util.updateQueryData('getPracticeCourseById', id, (draft) => {
            Object.assign(draft, data);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    /**
     * Delete practice course
     */
    deletePracticeCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/practice/courses/${courseId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PracticeCourses'],
    }),
    
    /**
     * Publish/unpublish course
     */
    toggleCoursePublication: builder.mutation<Course, { courseId: string; publish: boolean }>({
      query: ({ courseId, publish }) => ({
        url: `/practice/courses/${courseId}/`,
        method: 'PATCH',
        body: { 
          status: publish ? 'Published' : 'Draft' 
        },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        'PracticeCourses',
        { type: 'PracticeCourse', id: courseId },
      ],
      // Optimistic update
      async onQueryStarted({ courseId, publish }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          laboratoryApiSlice.util.updateQueryData('getPracticeCourseById', courseId, (draft) => {
            draft.status = publish ? 'Published' : 'Draft';
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    /**
     * Create practice unit
     */
    createPracticeUnit: builder.mutation<Unit, { courseId: string; data: Partial<Unit> }>({
      query: ({ courseId, data }) => ({
        url: '/practice/units/',
        method: 'POST',
        body: {
          ...data,
          course: courseId,
        },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'CourseUnits', id: courseId },
        'CourseUnits',
      ],
    }),
    
    /**
     * Update practice unit
     */
    updatePracticeUnit: builder.mutation<Unit, { unitId: string; data: Partial<Unit> }>({
      query: ({ unitId, data }) => ({
        url: `/practice/units/${unitId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['CourseUnits'],
    }),
    
    /**
     * Create practice lesson
     */
    createPracticeLesson: builder.mutation<Lesson, { unitId: string; data: Partial<Lesson> }>({
      query: ({ unitId, data }) => ({
        url: '/practice/lessons/',
        method: 'POST',
        body: {
          ...data,
          unit: unitId,
        },
      }),
      invalidatesTags: ['CourseUnits'],
    }),
    
    /**
     * Create practice challenge
     */
    createPracticeChallenge: builder.mutation<Challenge, { lessonId: string; data: Partial<Challenge> }>({
      query: ({ lessonId, data }) => ({
        url: '/practice/challenges/',
        method: 'POST',
        body: {
          ...data,
          lesson: lessonId,
        },
      }),
      invalidatesTags: ['LessonDetail'],
    }),
    
    // =============================================
    // INTEGRATION ENDPOINTS - Course ↔ Laboratory
    // =============================================
    
    /**
     * Get available exercises for course integration
     * Returns hierarchical structure: Course → Unit → Lesson → Challenge
     */
    getAvailableExercises: builder.query<any, void>({
      query: () => ({
        url: '/practice/available-exercises/',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        console.log('🎯 Available exercises for integration:', response);
        return response;
      },
      providesTags: ['AvailableExercises'],
    }),
    
    /**
     * Get specific exercise details by ID
     */
    getExerciseById: builder.query<any, string>({
      query: (exerciseId) => ({
        url: `/practice/exercises/${exerciseId}/`,
        method: 'GET',
      }),
      providesTags: (result, error, exerciseId) => [
        { type: 'ExerciseDetail', id: exerciseId },
      ],
    }),
    
    /**
     * Submit exercise progress (from course integration)
     */
    submitExerciseProgress: builder.mutation<any, { exerciseId: string; challengeId: string; selectedOptionId: string; courseId?: string; chapterId?: string }>(
      {
        query: ({ exerciseId, challengeId, selectedOptionId, courseId, chapterId }) => ({
          url: '/practice/exercise-progress/',
          method: 'POST',
          body: {
            exercise_id: exerciseId,
            challenge_id: challengeId,
            selected_option: selectedOptionId,
            source: 'course_integration',
            course_id: courseId, // Track which course the exercise came from
            chapter_id: chapterId, // Track which chapter the exercise came from
          },
        }),
        transformResponse: (response: any) => {
          console.log('✅ Exercise progress submitted from course:', response);
          return {
            ...response,
            success: response.success || response.correct,
            pointsEarned: response.points_earned || response.pointsEarned || 15,
            heartsUsed: response.hearts_used || response.heartsUsed || (response.correct ? 0 : 1),
            explanation: response.explanation,
          };
        },
        // Optimistically update both lab and course progress
        async onQueryStarted({ courseId, chapterId }, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            
            // Update lab progress
            dispatch(
              laboratoryApiSlice.util.updateQueryData('getUserProgress', undefined, (draft) => {
                if (draft) {
                  draft.points += data.pointsEarned;
                  draft.hearts = Math.max(0, draft.hearts - data.heartsUsed);
                }
              })
            );
            
            // If exercise completed successfully and we have course context, 
            // we'll let the course component handle chapter completion
            console.log('🎆 Exercise completed from course integration:', {
              success: data.success,
              courseId,
              chapterId,
              points: data.pointsEarned
            });
            
          } catch (error) {
            console.error('❌ Failed to sync exercise progress:', error);
          }
        },
        invalidatesTags: ['UserProgress', 'ExerciseDetail'],
      }
    ),
    
    /**
     * Sync course chapter completion with lab progress
     */
    syncChapterProgress: builder.mutation<any, { chapterId: string; exerciseId: string; completed: boolean }>(
      {
        query: ({ chapterId, exerciseId, completed }) => ({
          url: '/practice/sync-chapter-progress/',
          method: 'POST',
          body: {
            chapter_id: chapterId,
            exercise_id: exerciseId,
            completed,
            source: 'course_completion',
          },
        }),
        transformResponse: (response: any) => {
          console.log('🔄 Chapter progress synced with lab:', response);
          return response;
        },
        invalidatesTags: ['UserProgress'],
      }
    ),
    
    // =============================================
    // SHARED ENDPOINTS - Analytics & Reports
    // =============================================
    
    /**
     * Get practice analytics (teacher)
     */
    getPracticeAnalytics: builder.query<any, string>({
      query: (courseId) => ({
        url: `/practice/analytics/?course=${courseId}`,
        method: 'GET',
      }),
      providesTags: ['PracticeAnalytics'],
    }),
    
    /**
     * Get student progress list (teacher)
     */
    getStudentProgressList: builder.query<any[], string>({
      query: (courseId) => ({
        url: `/practice/student-progress/?course=${courseId}`,
        method: 'GET',
      }),
      providesTags: ['StudentProgress'],
    }),
    
  }),
});

// Export hooks
export const {
  // Student hooks
  useGetLaboratoryCoursesQuery,
  useGetUserProgressQuery,
  useUpdateUserProgressMutation,
  useGetCourseUnitsWithProgressQuery,
  useGetLessonDetailQuery,
  useSubmitChallengeProgressMutation,
  useReduceHeartsMutation,
  useRefillHeartsMutation,
  
  // Teacher hooks
  useGetPracticeCoursesQuery,
  useGetPracticeCourseByIdQuery,
  useCreatePracticeCourseMutation,
  useUpdatePracticeCourseMutation,
  useDeletePracticeCourseMutation,
  useToggleCoursePublicationMutation,
  useCreatePracticeUnitMutation,
  useUpdatePracticeUnitMutation,
  useCreatePracticeLessonMutation,
  useCreatePracticeChallengeMutation,
  
  // Integration hooks
  useGetAvailableExercisesQuery,
  useGetExerciseByIdQuery,
  useSubmitExerciseProgressMutation,
  useSyncChapterProgressMutation,
  
  // Analytics hooks
  useGetPracticeAnalyticsQuery,
  useGetStudentProgressListQuery,
  
} = laboratoryApiSlice;

// Teacher hook aliases for consistency
export const useGetTeacherCoursesQuery = useGetPracticeCoursesQuery;
export const useCreateCourseTeacherMutation = useCreatePracticeCourseMutation;
export const useUpdateCourseTeacherMutation = useUpdatePracticeCourseMutation;
export const useDeleteCourseTeacherMutation = useDeletePracticeCourseMutation;
export const usePublishCourseTeacherMutation = useToggleCoursePublicationMutation;
export const useGetCourseAnalyticsQuery = useGetPracticeAnalyticsQuery;

// Export utility functions
export const {
  util: { invalidateTags, resetApiState },
} = laboratoryApiSlice;