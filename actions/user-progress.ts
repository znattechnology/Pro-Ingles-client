'use client';

/**
 * User Progress Actions - Django API Integration
 * 
 * These functions replace the original Server Actions that used Clerk/Drizzle
 * and now call our Django REST API endpoints instead.
 */

// Base API URL - adjust if needed
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

/**
 * Update user's active course - replaces original upsertUserProgress
 * Now calls Django API: PUT /api/v1/practice/user-progress/
 */
export const upsertUserProgress = async (courseId: string) => {
    try {
        // Get the auth token from localStorage (adjust based on your auth implementation)
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            throw new Error("Authentication required");
        }

        // Find the course object by ID (we need the full course object for Django API)
        const coursesResponse = await fetch(`${API_BASE_URL}/practice/courses/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!coursesResponse.ok) {
            throw new Error("Failed to fetch courses");
        }

        const courses = await coursesResponse.json();
        const course = courses.find((c: any) => c.id === courseId);

        if (!course) {
            throw new Error("Course not found");
        }

        // Update user progress with the selected course
        const response = await fetch(`${API_BASE_URL}/practice/user-progress/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                active_course: course
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update user progress");
        }

        const result = await response.json();
        
        // Return success - the calling component should handle navigation
        return { success: true, data: result };

    } catch (error) {
        console.error("Error updating user progress:", error);
        throw error;
    }
};

/**
 * Reduce user's hearts when they get an answer wrong
 * Now calls Django API: POST /api/v1/practice/reduce-hearts/
 */
export const reduceHearts = async (challengeId: string) => {
    try {
        // Get the auth token from localStorage (adjust based on your auth implementation)
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            throw new Error("Authentication required");
        }

        // Call Django API to reduce hearts
        const response = await fetch(`${API_BASE_URL}/practice/reduce-hearts/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                challenge_id: challengeId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle specific error types (matching original logic)
            if (response.status === 400) {
                if (errorData.error === 'hearts') {
                    return { error: "hearts" };
                }
                if (errorData.error === 'practice') {
                    return { error: "practice" };
                }
            }
            
            throw new Error(errorData.message || "Failed to reduce hearts");
        }

        const result = await response.json();
        return { success: true, data: result };

    } catch (error) {
        console.error("Error reducing hearts:", error);
        throw error;
    }
};