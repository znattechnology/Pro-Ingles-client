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
    console.log('🔑 Auth token available:', !!token, token ? 'Bearer ***' + token.slice(-10) : 'null');
    
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

        // Try to get ALL practice courses including drafts
        console.log('🔍 Trying to fetch ALL practice courses including drafts...');
        
        const response = await fetch(`${API_BASE_URL}/practice/courses/?include_drafts=true&course_type=practice`, {
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
            
            const fallbackResponse = await fetch(`${API_BASE_URL}/practice/courses/?course_type=practice`, {
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
            
            // Log detailed course data to verify they're from database - ENHANCED FALLBACK LOGGING
            courses.forEach((course: any, index: number) => {
                console.log(`🎯 FALLBACK Course ${index + 1} - COMPLETE DATA:`, {
                    id: course.id,
                    title: course.title,
                    category: course.category,
                    level: course.level,
                    status: course.status,
                    course_type: course.course_type,
                    created_at: course.created_at,
                    updated_at: course.updated_at,
                    teacher: course.teacher,
                    teacher_id: course.teacher_id,
                    teacher_email: course.teacher_email,
                    teacher_name: course.teacher_name,
                    created_by: course.created_by,
                    language: course.language,
                    // ALL AVAILABLE FIELDS
                    allAvailableFields: Object.keys(course),
                    // MISSING FIELDS (undefined)
                    missingFields: Object.entries(course).filter(([_, value]) => value === undefined).map(([key, _]) => key)
                });
            });
            
            return courses;
        }

        const courses = await response.json();
        console.log('✅ Courses fetched successfully from database:', courses);
        console.log('📊 Number of courses from DB:', courses.length);
        
        // Log detailed course data to verify they're from database - ENHANCED LOGGING
        courses.forEach((course: any, index: number) => {
            console.log(`🎯 Course ${index + 1} - COMPLETE DATA:`, {
                id: course.id,
                title: course.title,
                category: course.category,
                level: course.level,
                status: course.status,
                course_type: course.course_type,
                created_at: course.created_at,
                updated_at: course.updated_at,
                teacher: course.teacher,
                teacher_id: course.teacher_id,
                teacher_email: course.teacher_email,
                teacher_name: course.teacher_name,
                created_by: course.created_by,
                language: course.language,
                // ALL AVAILABLE FIELDS
                allAvailableFields: Object.keys(course),
                // MISSING FIELDS (undefined)
                missingFields: Object.entries(course).filter(([_, value]) => value === undefined).map(([key, _]) => key)
            });
        });
        
        return courses;
    } catch (error) {
        console.error("Error fetching practice courses:", error);
        throw error;
    }
};

/**
 * Get courses with statistics efficiently
 */
export const getCoursesWithStatistics = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('📊 Fetching courses with statistics...');

        // Buscar cursos básicos primeiro
        const courses = await getPracticeCourses();
        console.log('📚 Found courses:', courses?.length || 0, courses);
        
        if (!courses || courses.length === 0) {
            console.log('❌ No courses found');
            return [];
        }
        
        // Buscar todas as estatísticas em paralelo
        const coursesWithStats = await Promise.all(
            courses.map(async (course: any) => {
                try {
                    console.log(`📊 Fetching stats for course: ${course.id} - ${course.title}`);
                    const stats = await getCourseStatistics(course.id);
                    console.log(`✅ Stats for ${course.title}:`, stats);
                    return {
                        ...course,
                        ...stats
                    };
                } catch (error) {
                    console.warn(`❌ Não foi possível buscar estatísticas para o curso ${course.id}:`, error);
                    return {
                        ...course,
                        units_count: 0,
                        lessons_count: 0,
                        challenges_count: 0,
                        total_progress: 0
                    };
                }
            })
        );
        
        console.log('✅ Courses with statistics loaded:', coursesWithStats.length);
        return coursesWithStats;

    } catch (error) {
        console.error("Error fetching courses with statistics:", error);
        throw error;
    }
};

/**
 * Get course statistics (units, lessons, challenges count)
 */
export const getCourseStatistics = async (courseId: string) => {
    try {
        const token = getAuthToken();
        console.log('🔑 getCourseStatistics - Auth token available:', !!token, token ? 'Bearer ***' + token.slice(-10) : 'null');
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log(`📊 Fetching statistics for course: ${courseId}`);
        console.log(`🔗 API URL: ${API_BASE_URL}/practice/units/?course=${courseId}`);

        // Buscar unidades do curso
        const unitsResponse = await fetch(`${API_BASE_URL}/practice/units/?course=${courseId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        let unitsCount = 0;
        let lessonsCount = 0;
        let challengesCount = 0;

        console.log(`📊 Units response status: ${unitsResponse.status}`);
        
        if (unitsResponse.ok) {
            const unitsData = await unitsResponse.json();
            console.log(`📦 Found undefined units:`, unitsData);
            const units = unitsData.results || unitsData || [];
            unitsCount = units.length;
            console.log(`📦 Found ${unitsCount} units:`, units);

            // Para cada unidade, buscar lições
            for (const unit of units) {
                try {
                    const lessonsResponse = await fetch(`${API_BASE_URL}/practice/lessons/?unit=${unit.id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (lessonsResponse.ok) {
                        const lessonsData = await lessonsResponse.json();
                        const lessons = lessonsData.results || lessonsData || [];
                        lessonsCount += lessons.length;

                        // Para cada lição, buscar challenges
                        for (const lesson of lessons) {
                            try {
                                const challengesResponse = await fetch(`${API_BASE_URL}/practice/challenges/?lesson=${lesson.id}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                });

                                if (challengesResponse.ok) {
                                    const challengesData = await challengesResponse.json();
                                    const challenges = challengesData.results || challengesData || [];
                                    challengesCount += challenges.length;
                                }
                            } catch (error) {
                                console.warn(`Erro ao buscar challenges da lição ${lesson.id}:`, error);
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Erro ao buscar lições da unidade ${unit.id}:`, error);
                }
            }
        } else {
            console.warn(`❌ Failed to fetch units for course ${courseId}. Status: ${unitsResponse.status}`);
            const errorText = await unitsResponse.text();
            console.warn(`❌ Error response:`, errorText);
        }

        const stats = {
            units_count: unitsCount,
            lessons_count: lessonsCount,
            challenges_count: challengesCount,
            total_progress: lessonsCount > 0 ? Math.round((challengesCount / lessonsCount) * 100) : 0
        };

        console.log(`📊 Statistics for course ${courseId}:`, stats);
        return stats;

    } catch (error) {
        console.error(`Error fetching course statistics for ${courseId}:`, error);
        return {
            units_count: 0,
            lessons_count: 0,
            challenges_count: 0,
            total_progress: 0
        };
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
    // Teacher information
    teacher_id?: string;
    teacher_email?: string;
    teacher_name?: string;
    // Course metadata
    course_type?: string;
    status?: string;
    created_by?: string;
    language?: string;
    difficulty_level?: string;
    // Learning configuration
    learningObjectives?: string[];
    targetAudience?: string;
    hearts?: number;
    pointsPerChallenge?: number;
    passingScore?: number;
    [key: string]: any; // Allow additional fields
}) => {
    try {
        console.log('🚀 DEEP DEBUG - createPracticeCourse called with:', courseData);
        console.log('🚀 DEEP DEBUG - courseData keys:', Object.keys(courseData));
        console.log('🚀 DEEP DEBUG - courseData teacher fields:', {
            teacher_id: courseData.teacher_id,
            teacher_email: courseData.teacher_email,
            teacher_name: courseData.teacher_name,
            course_type: courseData.course_type,
            status: courseData.status
        });
        
        // Use courseData AS-IS since it now contains all necessary information
        // Do NOT override fields that are already set correctly
        const requestBody = {
            ...courseData,
            // Only set these if they're not already provided
            status: courseData.status || 'draft',
            course_type: courseData.course_type || 'practice'
        };
        
        console.log('🌐 FINAL REQUEST to Django API:');
        console.log('📍 URL:', `${API_BASE_URL}/practice/courses/create/`);
        console.log('📦 Request Body (FINAL):', requestBody);
        console.log('📦 Request Body Keys:', Object.keys(requestBody));
        console.log('📦 Request Body JSON:', JSON.stringify(requestBody, null, 2));

        console.log('🔑 AUTH TOKEN CHECK:', {
            hasToken: !!getAuthToken(),
            tokenLength: getAuthToken()?.length,
            tokenPreview: getAuthToken()?.substring(0, 20) + '...'
        });

        // MANUAL FETCH to see EXACTLY what's being sent
        const token = getAuthToken();
        console.log('🌐 MANUAL FETCH - About to send request...');
        console.log('📍 URL:', `${API_BASE_URL}/practice/courses/create/`);
        console.log('🔑 Token (first 20):', token?.substring(0, 20));
        console.log('📦 Body String:', JSON.stringify(requestBody));
        
        const response = await fetch(`${API_BASE_URL}/practice/courses/create/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        console.log('📡 Response Status:', response.status);
        console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response Error Text:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('📦 Raw Response JSON:', result);
        
        console.log('🔄 RAW API RESPONSE received:', result);

        console.log('✅ Course created successfully - FULL RESPONSE:', result);
        console.log('🆔 New course ID:', result.id);
        console.log('📝 DETAILED Course Response Analysis:', {
            id: result.id,
            title: result.title,
            category: result.category,
            level: result.level,
            status: result.status,
            course_type: result.course_type,
            created_at: result.created_at,
            updated_at: result.updated_at,
            teacher: result.teacher,
            teacher_id: result.teacher_id,
            teacher_email: result.teacher_email,
            teacher_name: result.teacher_name,
            created_by: result.created_by,
            language: result.language,
            // Check ALL possible fields
            allFields: Object.keys(result),
            // Check for undefined fields
            undefinedFields: Object.entries(result).filter(([_, value]) => value === undefined).map(([key, _]) => key)
        });
        
        // IMMEDIATE verification - test multiple endpoints to find the course
        console.log('🔍 IMMEDIATE VERIFICATION: Testing if course was created...');
        
        // Test different endpoint variations to find the course
        const verificationTests = [
            { name: 'Standard Endpoint', url: `${API_BASE_URL}/practice/courses/` },
            { name: 'With include_drafts', url: `${API_BASE_URL}/practice/courses/?include_drafts=true` },
            { name: 'With course_type', url: `${API_BASE_URL}/practice/courses/?course_type=practice` },
            { name: 'Both Parameters', url: `${API_BASE_URL}/practice/courses/?include_drafts=true&course_type=practice` },
            { name: 'Direct Course Access', url: `${API_BASE_URL}/practice/courses/${result.id}/` }
        ];

        for (const test of verificationTests) {
            try {
                console.log(`🧪 Testing: ${test.name} - ${test.url}`);
                
                const verifyResponse = await fetch(test.url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (verifyResponse.ok) {
                    const verifyData = await verifyResponse.json();
                    let foundCourse = null;

                    if (Array.isArray(verifyData)) {
                        // List endpoint
                        foundCourse = verifyData.find((c: any) => c.id === result.id);
                        console.log(`📊 ${test.name}: Found ${verifyData.length} courses total`);
                        if (foundCourse) {
                            console.log(`✅ ${test.name}: Course FOUND!`, foundCourse);
                        } else {
                            console.log(`❌ ${test.name}: Course NOT in list`);
                        }
                    } else if (verifyData.id === result.id) {
                        // Direct access endpoint
                        foundCourse = verifyData;
                        console.log(`✅ ${test.name}: Direct access successful!`, foundCourse);
                    }
                } else {
                    console.log(`❌ ${test.name}: HTTP ${verifyResponse.status}`);
                }
            } catch (error) {
                console.log(`❌ ${test.name}: Error - ${error}`);
            }
        }

        // DELAYED verification (in case of DB sync delays)
        setTimeout(async () => {
            try {
                console.log('⏰ DELAYED VERIFICATION (after 2 seconds)...');
                const allCourses = await getPracticeCourses();
                const createdCourse = allCourses.find((c: any) => c.id === result.id);
                if (createdCourse) {
                    console.log('✅ DELAYED CONFIRMATION: Course found in standard fetch');
                    console.log('📋 Final course data:', createdCourse);
                } else {
                    console.log('❌ DELAYED WARNING: Course still not found in standard fetch');
                    console.log('🔍 Available courses:', allCourses.map((c: any) => ({ id: c.id, title: c.title, status: c.status })));
                }
            } catch (error) {
                console.error('❌ Delayed verification error:', error);
            }
        }, 2000);
        
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

        const data = await response.json();
        console.log('✅ Units fetched successfully:', data);
        
        // Handle different response structures from Django API
        let units;
        if (Array.isArray(data)) {
            // Direct array response
            units = data;
        } else if (data && Array.isArray(data.units)) {
            // Object with units property
            units = data.units;
        } else {
            // Fallback to empty array
            console.warn('⚠️ Unexpected units response structure:', data);
            units = [];
        }
        
        console.log('📊 Number of units:', units?.length || 0);
        console.log('🎯 Final units array:', units);
        
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
    // =============================================
    // DEFENSIVE VALIDATION - Frontend
    // =============================================
    
    // Validate required fields
    if (!unitData.course || !unitData.title || !unitData.description) {
        throw new Error('Campos obrigatórios ausentes: course, title, description são necessários');
    }
    
    // Validate field types and formats
    if (typeof unitData.course !== 'string' || unitData.course.trim() === '') {
        throw new Error('ID do curso deve ser uma string não vazia');
    }
    
    if (typeof unitData.title !== 'string' || unitData.title.trim().length < 3) {
        throw new Error('Título deve ter pelo menos 3 caracteres');
    }
    
    if (typeof unitData.description !== 'string' || unitData.description.trim().length < 10) {
        throw new Error('Descrição deve ter pelo menos 10 caracteres');
    }
    
    if (typeof unitData.order !== 'number' || unitData.order < 1) {
        throw new Error('Ordem deve ser um número maior que 0');
    }
    
    // Sanitize data
    const sanitizedData = {
        course: unitData.course.trim(),
        title: unitData.title.trim(),
        description: unitData.description.trim(),
        order: Math.max(1, Math.floor(unitData.order))
    };

    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🔄 Creating unit with data:', sanitizedData);
        console.log('🌐 API URL:', `${API_BASE_URL}/practice/units/`);

        const response = await fetch(`${API_BASE_URL}/practice/units/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedData),
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
    // =============================================
    // DEFENSIVE VALIDATION - Frontend
    // =============================================
    
    // Validate required fields
    if (!lessonData.unit || !lessonData.title) {
        throw new Error('Campos obrigatórios ausentes: unit, title são necessários');
    }
    
    // Validate field types and formats
    if (typeof lessonData.unit !== 'string' || lessonData.unit.trim() === '') {
        throw new Error('ID da unidade deve ser uma string não vazia');
    }
    
    if (typeof lessonData.title !== 'string' || lessonData.title.trim().length < 3) {
        throw new Error('Título da lição deve ter pelo menos 3 caracteres');
    }
    
    if (typeof lessonData.order !== 'number' || lessonData.order < 1) {
        throw new Error('Ordem deve ser um número maior que 0');
    }
    
    // Sanitize data
    const sanitizedData = {
        unit: lessonData.unit.trim(),
        title: lessonData.title.trim(),
        order: Math.max(1, Math.floor(lessonData.order))
    };

    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🔄 Creating lesson with data:', sanitizedData);
        console.log('🌐 API URL:', `${API_BASE_URL}/practice/lessons/`);

        const response = await fetch(`${API_BASE_URL}/practice/lessons/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedData),
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
        
        // Defensive validation before API call
        if (!challengeData.lesson || typeof challengeData.lesson !== 'string') {
            throw new Error('ID da lição é obrigatório e deve ser válido');
        }
        
        if (!challengeData.type || typeof challengeData.type !== 'string') {
            throw new Error('Tipo do desafio é obrigatório');
        }
        
        if (!challengeData.question || typeof challengeData.question !== 'string' || challengeData.question.trim().length < 5) {
            throw new Error('Pergunta deve ter pelo menos 5 caracteres');
        }
        
        if (typeof challengeData.order !== 'number' || challengeData.order < 1) {
            throw new Error('Ordem do desafio deve ser um número positivo');
        }
        
        if (!Array.isArray(challengeData.options)) {
            throw new Error('Opções devem ser fornecidas como array');
        }
        
        // Validate options
        challengeData.options.forEach((option, index) => {
            if (!option.text || typeof option.text !== 'string' || option.text.trim().length === 0) {
                throw new Error(`Opção ${index + 1}: Texto é obrigatório`);
            }
            if (typeof option.is_correct !== 'boolean') {
                throw new Error(`Opção ${index + 1}: Campo 'is_correct' deve ser booleano`);
            }
            if (typeof option.order !== 'number') {
                throw new Error(`Opção ${index + 1}: Ordem deve ser um número`);
            }
        });

        // Sanitize data
        const sanitizedData = {
            lesson: challengeData.lesson.trim(),
            type: challengeData.type.trim(),
            question: challengeData.question.trim(),
            order: Math.max(1, Math.floor(challengeData.order)),
            options: challengeData.options.map((option) => ({
                text: option.text.trim(),
                is_correct: Boolean(option.is_correct),
                order: Math.max(0, Math.floor(option.order)),
                image_url: option.image_url?.trim() || undefined,
                audio_url: option.audio_url?.trim() || undefined,
            }))
        };
        
        const challengePayload = {
            lesson: sanitizedData.lesson,
            type: sanitizedData.type,
            question: sanitizedData.question,
            order: sanitizedData.order,
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
        console.log('📋 Options to create:', sanitizedData.options);

        // Then create the options and collect their IDs
        const createdOptions = [];
        for (const [index, option] of sanitizedData.options.entries()) {
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