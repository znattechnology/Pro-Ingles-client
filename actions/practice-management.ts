"use client";

/**
 * Practice Management Actions - Django API Integration for Teacher Dashboard
 * 
 * These functions handle CRUD operations for the practice laboratory management
 * system in the teacher dashboard.
 */

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
};

/**
 * Make authenticated request with automatic token refresh
 */
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error("Token de autenticação não encontrado. Por favor, faça login novamente.");
    }

    // Add auth header to options
    const authOptions: RequestInit = {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    let response = await fetch(url, authOptions);

    // If we get a 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
        console.log('Token expired, attempting to refresh...');
        
        try {
            const { djangoAuth } = await import('@/lib/django-auth');
            const refreshResult = await djangoAuth.refreshToken();
            console.log('Token refreshed successfully');
            
            // Update the auth header with new token and retry
            const refreshedAuthOptions: RequestInit = {
                ...options,
                headers: {
                    'Authorization': `Bearer ${refreshResult.access}`,
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            };
            
            response = await fetch(url, refreshedAuthOptions);
            console.log('Retry response status:', response.status);
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }
    }

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            console.log('Error response:', errorData);
            errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.json();
};

// ============================================================================
// COURSE MANAGEMENT
// ============================================================================

/**
 * Get all practice courses - for teacher dashboard
 */
export const getPracticeCourses = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/courses/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch practice courses");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching practice courses:", error);
        throw error;
    }
};

/**
 * Create a new practice course
 */
export const createPracticeCourse = async (courseData: {
    title: string;
    description: string;
    category: string;
    level: string;
    template?: string;
}) => {
    try {
        console.log('Creating course with data:', courseData);
        
        const requestBody = {
            ...courseData,
            status: 'Draft' // Start as draft
        };
        
        console.log('Request URL:', `${API_BASE_URL}/practice/courses/create/`);
        console.log('Request body:', requestBody);

        const result = await makeAuthenticatedRequest(`${API_BASE_URL}/practice/courses/create/`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        console.log('Success response:', result);
        return result;
    } catch (error) {
        console.error("Error creating practice course:", error);
        throw error;
    }
};

/**
 * Update a practice course
 */
export const updatePracticeCourse = async (courseId: string, courseData: {
    title?: string;
    description?: string;
    category?: string;
    level?: string;
    status?: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(courseData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update course");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating practice course:", error);
        throw error;
    }
};

/**
 * Delete a practice course
 */
export const deletePracticeCourse = async (courseId: string) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete course");
        }

        return true;
    } catch (error) {
        console.error("Error deleting practice course:", error);
        throw error;
    }
};

// ============================================================================
// UNITS MANAGEMENT
// ============================================================================

/**
 * Get units for a specific course
 */
export const getCourseUnits = async (courseId: string) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/courses/${courseId}/units-with-progress/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch course units");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching course units:", error);
        throw error;
    }
};

/**
 * Create a new unit
 */
export const createPracticeUnit = async (unitData: {
    course: string;
    title: string;
    description: string;
    order: number;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/units/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unitData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create unit");
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating practice unit:", error);
        throw error;
    }
};

/**
 * Update a practice unit
 */
export const updatePracticeUnit = async (unitId: string, unitData: {
    title?: string;
    description?: string;
    order?: number;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/units/${unitId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unitData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update unit");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating practice unit:", error);
        throw error;
    }
};

/**
 * Delete a practice unit
 */
export const deletePracticeUnit = async (unitId: string) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/units/${unitId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete unit");
        }

        return true;
    } catch (error) {
        console.error("Error deleting practice unit:", error);
        throw error;
    }
};

// ============================================================================
// LESSONS MANAGEMENT
// ============================================================================

/**
 * Get lessons for a specific unit
 */
export const getUnitLessons = async (unitId: string) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/units/${unitId}/lessons/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch unit lessons");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching unit lessons:", error);
        throw error;
    }
};

/**
 * Create a new lesson
 */
export const createPracticeLesson = async (lessonData: {
    unit: string;
    title: string;
    order: number;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/lessons/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lessonData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create lesson");
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating practice lesson:", error);
        throw error;
    }
};

/**
 * Get lesson details with challenges
 */
export const getPracticeLessonDetails = async (lessonId: string) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/lessons/${lessonId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch lesson details");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching lesson details:", error);
        throw error;
    }
};

// ============================================================================
// CHALLENGES MANAGEMENT
// ============================================================================

/**
 * Create a new challenge
 */
export const createPracticeChallenge = async (challengeData: {
    lesson: string;
    type: string;
    question: string;
    order: number;
    options: Array<{
        text: string;
        is_correct: boolean;
        image_url?: string;
        audio_url?: string;
        order: number;
    }>;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        // First create the challenge
        const challengeResponse = await fetch(`${API_BASE_URL}/practice/challenges/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lesson: challengeData.lesson,
                type: challengeData.type,
                question: challengeData.question,
                order: challengeData.order,
            }),
        });

        if (!challengeResponse.ok) {
            const errorData = await challengeResponse.json();
            throw new Error(errorData.message || "Failed to create challenge");
        }

        const challenge = await challengeResponse.json();

        // Then create the options
        for (const option of challengeData.options) {
            await fetch(`${API_BASE_URL}/practice/challenge-options/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...option,
                    challenge: challenge.id,
                }),
            });
        }

        return challenge;
    } catch (error) {
        console.error("Error creating practice challenge:", error);
        throw error;
    }
};

/**
 * Update a practice challenge
 */
export const updatePracticeChallenge = async (challengeId: string, challengeData: {
    type?: string;
    question?: string;
    order?: number;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/challenges/${challengeId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(challengeData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update challenge");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating practice challenge:", error);
        throw error;
    }
};

/**
 * Delete a practice challenge
 */
export const deletePracticeChallenge = async (challengeId: string) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/challenges/${challengeId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete challenge");
        }

        return true;
    } catch (error) {
        console.error("Error deleting practice challenge:", error);
        throw error;
    }
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get practice analytics for teacher dashboard
 */
export const getPracticeAnalytics = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/analytics/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch analytics");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching practice analytics:", error);
        throw error;
    }
};

/**
 * Get student progress data
 */
export const getStudentProgress = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/student-progress/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch student progress");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching student progress:", error);
        throw error;
    }
};