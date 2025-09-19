"use client";

/**
 * Practice Management Actions - Django API Integration for Teacher Dashboard
 * 
 * These functions handle CRUD operations for the practice laboratory management
 * system in the teacher dashboard.
 */

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

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
 * Get specific practice course by ID - for course details page
 */
export const getPracticeCourseById = async (courseId: string) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('Fetching course details for ID:', courseId);
        console.log('Using token:', token.substring(0, 20) + '...');

        const response = await fetch(`${API_BASE_URL}/practice/courses/${courseId}/units-with-progress/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Course details fetch response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Course details fetch error response:', errorText);
            throw new Error(`Failed to fetch course details: ${response.status}`);
        }

        const courseData = await response.json();
        console.log('✅ Course details fetched successfully:', courseData);
        
        // Extract course info and calculate stats
        const course = courseData.course;
        const units = courseData.units || [];
        
        // Calculate stats from units data
        const totalLessons = units.reduce((acc: number, unit: any) => acc + (unit.lessons?.length || 0), 0);
        const totalChallenges = units.reduce((acc: number, unit: any) => {
            return acc + (unit.lessons?.reduce((lessonAcc: number, lesson: any) => {
                return lessonAcc + (lesson.challenges?.length || 0);
            }, 0) || 0);
        }, 0);
        
        // Format course data with calculated stats
        const formattedCourse = {
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            status: course.status,
            units: units.length,
            lessons: totalLessons,
            challenges: totalChallenges,
            students: 0, // TODO: Implement student count from enrollments
            completionRate: 0, // TODO: Implement completion rate calculation
            lastUpdated: course.updated_at,
            createdAt: course.created_at,
            teacher: course.teacher
        };
        
        console.log('📊 Formatted course data:', formattedCourse);
        return formattedCourse;
    } catch (error) {
        console.error("Error fetching course details:", error);
        throw error;
    }
};

/**
 * Get all practice courses - for teacher dashboard
 */
export const getPracticeCourses = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('Fetching courses from:', `${API_BASE_URL}/practice/courses/`);
        console.log('Using token:', token.substring(0, 20) + '...');

        // Try to get ALL courses including drafts
        console.log('🔍 Trying to fetch ALL courses including drafts...');
        
        const response = await fetch(`${API_BASE_URL}/practice/courses/?include_drafts=true`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Courses fetch response status:', response.status);

        // If the parameter doesn't work, try without it and log the issue
        if (!response.ok) {
            console.warn('🚨 Failed with include_drafts parameter, trying without...');
            
            const fallbackResponse = await fetch(`${API_BASE_URL}/practice/courses/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            console.log('Fallback fetch response status:', fallbackResponse.status);
            
            if (!fallbackResponse.ok) {
                const errorText = await fallbackResponse.text();
                console.error('Courses fetch error response:', errorText);
                throw new Error(`Failed to fetch practice courses: ${fallbackResponse.status}`);
            }
            
            console.log('⚠️ NOTA: API Django está filtrando cursos - apenas "Published" são retornados');
            console.log('⚠️ Para ver cursos "Draft", a API precisa ser configurada no backend');
            
            const courses = await fallbackResponse.json();
            console.log('✅ Courses fetched successfully from database:', courses);
            console.log('📊 Number of courses from DB:', courses.length);
            
            // Log detailed course data to verify they're from database
            courses.forEach((course: any, index: number) => {
                console.log(`🎯 Course ${index + 1}:`, {
                    id: course.id,
                    title: course.title,
                    category: course.category,
                    level: course.level,
                    status: course.status,
                    created_at: course.created_at,
                    updated_at: course.updated_at,
                    teacher: course.teacher?.username || course.teacher?.email || 'Unknown'
                });
            });
            
            return courses;
        }

        const courses = await response.json();
        console.log('✅ Courses fetched successfully from database:', courses);
        console.log('📊 Number of courses from DB:', courses.length);
        
        // Log detailed course data to verify they're from database
        courses.forEach((course: any, index: number) => {
            console.log(`🎯 Course ${index + 1}:`, {
                id: course.id,
                title: course.title,
                category: course.category,
                level: course.level,
                status: course.status,
                created_at: course.created_at,
                updated_at: course.updated_at,
                teacher: course.teacher?.username || course.teacher?.email || 'Unknown'
            });
        });
        
        return courses;
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

        console.log('✅ Course created successfully:', result);
        console.log('🆔 New course ID:', result.id);
        console.log('📝 Course details:', {
            title: result.title,
            category: result.category,
            level: result.level,
            status: result.status,
            created_at: result.created_at
        });
        
        // After creating, wait a moment and then fetch courses to verify persistence
        setTimeout(async () => {
            try {
                console.log('🔍 Verifying course persistence after creation...');
                const allCourses = await getPracticeCourses();
                const createdCourse = allCourses.find((c: any) => c.id === result.id);
                if (createdCourse) {
                    console.log('✅ CONFIRMED: New course persisted in database');
                    console.log('🎯 Found created course:', createdCourse);
                } else {
                    console.log('❌ WARNING: New course NOT found in database after creation');
                }
            } catch (error) {
                console.error('Error verifying course persistence:', error);
            }
        }, 1000);
        
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

        const response = await fetch(`${API_BASE_URL}/practice/courses/${courseId}/`, {
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
 * Publish/Unpublish a practice course
 */
export const publishPracticeCourse = async (courseId: string, publish: boolean = true) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log(`${publish ? '📢' : '📝'} ${publish ? 'Publishing' : 'Unpublishing'} practice course:`, courseId);

        const response = await fetch(`${API_BASE_URL}/practice/courses/${courseId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: publish ? 'publish' : 'unpublish'
            }),
        });

        console.log('📡 Publish response status:', response.status);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }
            console.error('❌ Publish error:', errorData);
            throw new Error(errorData.message || `Failed to ${publish ? 'publish' : 'unpublish'} course: ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ Course ${publish ? 'published' : 'unpublished'} successfully:`, result);
        return result;
    } catch (error) {
        console.error(`Error ${publish ? 'publishing' : 'unpublishing'} practice course:`, error);
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

        console.log('🗑️ Deleting course:', courseId);
        console.log('🌐 Delete URL:', `${API_BASE_URL}/practice/courses/${courseId}/`);
        console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

        const response = await fetch(`${API_BASE_URL}/practice/courses/${courseId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Delete course error response:', errorText);
            throw new Error(`Failed to delete course: ${response.status} - ${errorText}`);
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

        console.log('🔄 Fetching units for course:', courseId);
        console.log('🌐 API URL:', `${API_BASE_URL}/practice/courses/${courseId}/units-with-progress/`);

        const response = await fetch(`${API_BASE_URL}/practice/courses/${courseId}/units-with-progress/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('📡 Units fetch response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Units fetch error:', errorText);
            throw new Error(`Failed to fetch course units: ${response.status}`);
        }

        const units = await response.json();
        console.log('✅ Units fetched successfully:', units);
        console.log('📊 Number of units:', units?.length || 0);
        
        return units;
    } catch (error) {
        console.error("❌ Error fetching course units:", error);
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

        console.log('🔄 Creating unit with data:', unitData);
        console.log('🌐 API URL:', `${API_BASE_URL}/practice/units/`);

        const response = await fetch(`${API_BASE_URL}/practice/units/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unitData),
        });

        console.log('📡 Unit creation response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Unit creation error:', errorData);
            throw new Error(errorData.message || "Failed to create unit");
        }

        const result = await response.json();
        console.log('✅ Unit created successfully:', result);
        return result;
    } catch (error) {
        console.error("❌ Error creating practice unit:", error);
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

        console.log('🔄 Creating lesson with data:', lessonData);
        console.log('🌐 API URL:', `${API_BASE_URL}/practice/lessons/`);

        const response = await fetch(`${API_BASE_URL}/practice/lessons/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lessonData),
        });

        console.log('📡 Lesson creation response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Lesson creation error:', errorData);
            throw new Error(errorData.message || "Failed to create lesson");
        }

        const result = await response.json();
        console.log('✅ Lesson created successfully:', result);
        return result;
    } catch (error) {
        console.error("❌ Error creating practice lesson:", error);
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

        console.log('🔄 Creating challenge with data:', challengeData);
        
        const challengePayload = {
            lesson: challengeData.lesson,
            type: challengeData.type,
            question: challengeData.question,
            order: challengeData.order,
        };
        
        console.log('📝 Challenge payload:', challengePayload);
        console.log('🌐 API URL:', `${API_BASE_URL}/practice/challenges/`);

        // First create the challenge
        const challengeResponse = await fetch(`${API_BASE_URL}/practice/challenges/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(challengePayload),
        });

        console.log('📡 Challenge creation response status:', challengeResponse.status);

        if (!challengeResponse.ok) {
            const errorText = await challengeResponse.text();
            console.error('❌ Challenge creation error response:', errorText);
            
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { message: errorText };
            }
            
            throw new Error(errorData.message || `Failed to create challenge: ${challengeResponse.status}`);
        }

        const challenge = await challengeResponse.json();
        console.log('✅ Challenge created, now creating options...');
        console.log('🎯 Challenge ID:', challenge.id);
        console.log('📋 Options to create:', challengeData.options);

        // Then create the options and collect their IDs
        const createdOptions = [];
        for (const [index, option] of challengeData.options.entries()) {
            const optionPayload = {
                ...option,
                challenge_id: challenge.id,  // Django expects challenge_id, not challenge
            };
            
            console.log(`🔄 Creating option ${index + 1}:`, optionPayload);
            
            const optionResponse = await fetch(`${API_BASE_URL}/practice/challenge-options/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(optionPayload),
            });
            
            console.log(`📡 Option ${index + 1} response status:`, optionResponse.status);
            
            if (!optionResponse.ok) {
                const errorText = await optionResponse.text();
                console.error(`❌ Option ${index + 1} creation error:`, errorText);
                
                // Don't throw, continue with other options for now
                console.warn(`⚠️ Skipping option ${index + 1} due to error`);
                createdOptions.push(null); // Keep index alignment
            } else {
                const optionResult = await optionResponse.json();
                console.log(`✅ Option ${index + 1} created:`, optionResult);
                createdOptions.push(optionResult);
            }
        }

        // Return challenge with created options
        return {
            ...challenge,
            createdOptions: createdOptions
        };
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

/**
 * Get presigned URL for audio upload to S3
 */
export const getAudioUploadUrl = async (payload: {
    lessonId: string;
    challengeId: string;
    fileName: string;
    fileType: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🎵 Getting audio upload URL...', payload);

        const response = await fetch(`${API_BASE_URL}/practice/challenges/${payload.challengeId}/get-audio-upload-url/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lessonId: payload.lessonId,
                fileName: payload.fileName,
                fileType: payload.fileType
            }),
        });

        console.log('📡 Audio upload URL response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Audio upload URL error:', errorText);
            throw new Error(`Failed to get audio upload URL: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Audio upload URL received:', result);
        return result;
    } catch (error) {
        console.error("Error getting audio upload URL:", error);
        throw error;
    }
};

/**
 * Upload audio file to S3 using presigned URL
 */
export const uploadAudioToS3 = async (audioFile: File, lessonId: string, challengeId: string): Promise<string> => {
    try {
        console.log('🎵 Starting audio upload...', { audioFile: audioFile.name });
        
        // Get presigned URL from Django backend
        const uploadResponse = await getAudioUploadUrl({
            lessonId,
            challengeId,
            fileName: audioFile.name,
            fileType: audioFile.type
        });

        const { uploadUrl, audioUrl } = uploadResponse.data;
        console.log('📍 Audio upload details:', { uploadUrl, audioUrl });

        // Upload file to S3 using presigned URL
        const uploadToS3Response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': audioFile.type,
            },
            body: audioFile,
        });

        if (!uploadToS3Response.ok) {
            throw new Error(`Upload failed with status: ${uploadToS3Response.status}`);
        }

        console.log('✅ Audio uploaded to S3 successfully');
        return audioUrl;
    } catch (error: any) {
        console.error('❌ Audio upload failed:', error);
        throw error;
    }
};

/**
 * Get presigned URL for image upload to S3
 */
export const getImageUploadUrl = async (payload: {
    lessonId: string;
    challengeId: string;
    fileName: string;
    fileType: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🖼️ Getting image upload URL...', payload);

        const response = await fetch(`${API_BASE_URL}/practice/challenges/${payload.challengeId}/get-image-upload-url/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lessonId: payload.lessonId,
                fileName: payload.fileName,
                fileType: payload.fileType
            }),
        });

        console.log('📡 Image upload URL response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Image upload URL error:', errorText);
            throw new Error(`Failed to get image upload URL: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Image upload URL received:', result);
        return result;
    } catch (error) {
        console.error("Error getting image upload URL:", error);
        throw error;
    }
};

/**
 * Upload image file to S3 using presigned URL
 */
export const uploadImageToS3 = async (imageFile: File, lessonId: string, challengeId: string): Promise<string> => {
    try {
        console.log('🖼️ Starting image upload...', { imageFile: imageFile.name });
        
        // Get presigned URL from Django backend
        const uploadResponse = await getImageUploadUrl({
            lessonId,
            challengeId,
            fileName: imageFile.name,
            fileType: imageFile.type
        });

        const { uploadUrl, imageUrl } = uploadResponse.data;
        console.log('📍 Image upload details:', { uploadUrl, imageUrl });

        // Upload file to S3 using presigned URL
        const uploadToS3Response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': imageFile.type,
            },
            body: imageFile,
        });

        if (!uploadToS3Response.ok) {
            throw new Error(`Upload failed with status: ${uploadToS3Response.status}`);
        }

        console.log('✅ Image uploaded to S3 successfully');
        return imageUrl;
    } catch (error: any) {
        console.error('❌ Image upload failed:', error);
        throw error;
    }
};

/**
 * Update challenge option with media URLs
 */
export const updateChallengeOption = async (optionId: string, updateData: {
    audioSrc?: string;
    imageSrc?: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🔄 Updating challenge option...', { optionId, updateData });

        const response = await fetch(`${API_BASE_URL}/practice/challenge-options/${optionId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        console.log('📡 Option update response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Option update error:', errorText);
            throw new Error(`Failed to update option: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Option updated successfully:', result);
        return result;
    } catch (error) {
        console.error("Error updating challenge option:", error);
        throw error;
    }
};

// ============================================================================
// AI TRANSLATION FUNCTIONS - Intelligent translation validation for challenges
// ============================================================================

/**
 * Validate translation using AI with detailed feedback
 */
export const validateTranslationWithAI = async (payload: {
    sourceText: string;
    userTranslation: string;
    challengeId?: string;
    difficultyLevel?: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🤖 Validating translation with AI...', payload);

        const response = await fetch(`${API_BASE_URL}/practice/validate-ai-translation/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source_text: payload.sourceText,
                user_translation: payload.userTranslation,
                challenge_id: payload.challengeId,
                difficulty_level: payload.difficultyLevel || 'intermediate'
            }),
        });

        console.log('📡 AI validation response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ AI validation error:', errorText);
            throw new Error(`AI validation failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ AI validation successful:', result);
        return result;
    } catch (error) {
        console.error("Error validating translation with AI:", error);
        throw error;
    }
};

/**
 * Generate multiple translation suggestions for teachers creating challenges
 */
export const generateTranslationSuggestions = async (payload: {
    sourceText: string;
    difficultyLevel?: string;
    count?: number;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🎯 Generating translation suggestions...', payload);

        const response = await fetch(`${API_BASE_URL}/practice/generate-translation-suggestions/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source_text: payload.sourceText,
                difficulty_level: payload.difficultyLevel || 'intermediate',
                count: payload.count || 3
            }),
        });

        console.log('📡 Suggestions response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Suggestions generation error:', errorText);
            throw new Error(`Suggestions generation failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Suggestions generated successfully:', result);
        return result;
    } catch (error) {
        console.error("Error generating translation suggestions:", error);
        throw error;
    }
};

// ============================================================================
// AI PRONUNCIATION FUNCTIONS - Intelligent pronunciation analysis for challenges
// ============================================================================

/**
 * Analyze pronunciation using AI with detailed feedback
 */
export const analyzePronunciationWithAI = async (payload: {
    audioFile: File;
    expectedText: string;
    challengeId?: string;
    difficultyLevel?: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🎤 Analyzing pronunciation with AI...', {
            expectedText: payload.expectedText,
            audioFile: payload.audioFile.name,
            size: payload.audioFile.size
        });

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('audio_file', payload.audioFile);
        formData.append('expected_text', payload.expectedText);
        formData.append('difficulty_level', payload.difficultyLevel || 'intermediate');
        if (payload.challengeId) {
            formData.append('challenge_id', payload.challengeId);
        }

        const response = await fetch(`${API_BASE_URL}/practice/analyze-ai-pronunciation/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type for FormData - let browser set it with boundary
            },
            body: formData,
        });

        console.log('📡 AI pronunciation analysis response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ AI pronunciation analysis error:', errorText);
            throw new Error(`AI pronunciation analysis failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ AI pronunciation analysis successful:', result);
        return result;
    } catch (error) {
        console.error("Error analyzing pronunciation with AI:", error);
        throw error;
    }
};

/**
 * Generate pronunciation exercise with AI suggestions for teachers
 */
export const generatePronunciationExercise = async (payload: {
    topic?: string;
    difficultyLevel?: string;
    exerciseType?: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🎯 Generating pronunciation exercise...', payload);

        const response = await fetch(`${API_BASE_URL}/practice/generate-pronunciation-exercise/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: payload.topic || 'daily conversation',
                difficulty_level: payload.difficultyLevel || 'intermediate',
                exercise_type: payload.exerciseType || 'word'
            }),
        });

        console.log('📡 Pronunciation exercise response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Pronunciation exercise generation error:', errorText);
            throw new Error(`Exercise generation failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Pronunciation exercise generated successfully:', result);
        return result;
    } catch (error) {
        console.error("Error generating pronunciation exercise:", error);
        throw error;
    }
};

/**
 * Generate reference audio for pronunciation practice
 */
export const generateReferenceAudio = async (payload: {
    text: string;
    voice?: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🔊 Generating reference audio...', payload);

        const response = await fetch(`${API_BASE_URL}/practice/generate-reference-audio/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: payload.text,
                voice: payload.voice || 'alloy'
            }),
        });

        console.log('📡 Reference audio response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Reference audio generation error:', errorText);
            throw new Error(`Reference audio generation failed: ${response.status}`);
        }

        // Response is audio blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('✅ Reference audio generated successfully');
        return { audioUrl, audioBlob };
    } catch (error) {
        console.error("Error generating reference audio:", error);
        throw error;
    }
};