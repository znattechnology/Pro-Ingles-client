/**
 * Django API Queries - Replacement for Drizzle queries
 * 
 * 🧪 TESTING REDUX INDEPENDENCE: Most functions temporarily commented out
 * to test if Redux migration is working 100% independently.
 * 
 * These functions replace the original Drizzle/Clerk queries
 * and call our Django REST API endpoints instead.
 */

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get auth token from localStorage
 * Adjust this based on your auth implementation
 */
const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('access_token');
    
    // If no token, try to redirect to login
    if (!token) {
        console.warn('No auth token found, user might need to login');
        // Optional: Force redirect to login
        // window.location.href = '/auth/signin';
    }
    
    return token;
};

/**
 * Get user's practice progress
 * Replaces: getUserProgress() from client project
 * Django API: GET /api/v1/practice/user-progress/
 * 
 * 🧪 COMMENTED OUT FOR REDUX INDEPENDENCE TEST
 */
export const getUserProgress = async () => {
    console.warn('🧪 LEGACY getUserProgress called - Redux should handle this!');
    console.warn('🔄 If you see this, the component is not using Redux properly');
    
    // Return mock data to prevent crashes during testing
    return {
        hearts: 5,
        points: 0,
        active_course: null,
        user_image_src: '/placeholder.png',
        streak: 0
    };
    
    /* ORIGINAL IMPLEMENTATION COMMENTED OUT FOR TESTING
    try {
        const token = getAuthToken();
        if (!token) {
            console.warn('No auth token available for getUserProgress');
            return null;
        }

        console.log('Fetching user progress with token:', token.substring(0, 20) + '...');

        const response = await fetch(`${API_BASE_URL}/practice/user-progress/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('User progress response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Unauthorized: Token might be invalid or expired');
                return null;
            }
            const errorText = await response.text();
            console.error('User progress API error:', errorText);
            throw new Error(`Failed to fetch user progress: ${response.status}`);
        }

        const data = await response.json();
        console.log('User progress data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return null;
    }
    */
};

/**
 * Get all available courses
 * Replaces: getCourses() from client project
 * Django API: GET /api/v1/practice/courses/
 * 
 * 🧪 COMMENTED OUT FOR REDUX INDEPENDENCE TEST
 */
export const getCourses = async () => {
    console.warn('🧪 LEGACY getCourses called - Redux should handle this!');
    console.warn('🔄 If you see this, the component is not using Redux properly');
    
    // Return empty array to prevent crashes during testing
    return [];
    
    /* ORIGINAL IMPLEMENTATION COMMENTED OUT FOR TESTING
    try {
        const token = getAuthToken();
        if (!token) return [];

        const response = await fetch(`${API_BASE_URL}/practice/courses/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
    */
};

/**
 * Get laboratory courses (practice courses only)
 * Now the Django API filters courses that have practice_units (Course → PracticeUnit → PracticeLesson → PracticeChallenge)
 * Django API: GET /api/v1/practice/courses/ (filtered by practice_units existence)
 * 
 * 🧪 COMMENTED OUT FOR REDUX INDEPENDENCE TEST
 */
export const getLaboratoryCourses = async () => {
    console.warn('🧪 LEGACY getLaboratoryCourses called - Redux should handle this!');
    console.warn('🔄 If you see this, the component is not using Redux properly');
    
    // Return empty array to prevent crashes during testing
    return [];
    
    /* ORIGINAL IMPLEMENTATION COMMENTED OUT FOR TESTING
    try {
        const token = getAuthToken();
        if (!token) return [];

        const response = await fetch(`${API_BASE_URL}/practice/courses/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch laboratory courses');
        }

        const laboratoryCourses = await response.json();
        
        console.log('Laboratory courses found:', laboratoryCourses.length);
        console.log('Laboratory courses:', laboratoryCourses.map((c: any) => ({
            title: c.title, 
            template: c.template,
            category: c.category
        })));

        return laboratoryCourses;
    } catch (error) {
        console.error('Error fetching laboratory courses:', error);
        return [];
    }
    */
};

/**
 * Get course by ID
 * Replaces: getCourseById() from client project  
 * Django API: GET /api/v1/practice/courses/ (then filter)
 * 
 * 🧪 COMMENTED OUT FOR REDUX INDEPENDENCE TEST
 */
export const getCourseById = async (courseId: string) => {
    console.warn('🧪 LEGACY getCourseById called - Redux should handle this!');
    console.warn('🔄 If you see this, the component is not using Redux properly');
    
    // Return null to prevent crashes during testing
    return null;
    
    /* ORIGINAL IMPLEMENTATION COMMENTED OUT FOR TESTING
    try {
        const courses = await getCourses();
        return courses.find((course: any) => course.id === courseId) || null;
    } catch (error) {
        console.error('Error fetching course by ID:', error);
        return null;
    }
    */
};

/**
 * Get units for a course (with user progress)
 * Replaces: getUnits() from client project
 * Django API: GET /api/v1/practice/courses/{courseId}/units-with-progress/
 * 
 * 🧪 COMMENTED OUT FOR REDUX INDEPENDENCE TEST
 */
export const getUnits = async (courseId?: string) => {
    console.warn('🧪 LEGACY getUnits called - Redux should handle this!');
    console.warn('🔄 If you see this, the component is not using Redux properly');
    
    // Return empty array to prevent crashes during testing
    return [];
    
    /* ORIGINAL IMPLEMENTATION COMMENTED OUT FOR TESTING
    try {
        if (!courseId) {
            console.warn('No courseId provided to getUnits');
            return [];
        }
        
        const token = getAuthToken();
        if (!token) {
            console.warn('No auth token available for getUnits');
            return [];
        }

        console.log('Fetching units for course:', courseId);

        const response = await fetch(`${API_BASE_URL}/practice/courses/${courseId}/units-with-progress/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Units response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Units API error:', errorText);
            throw new Error(`Failed to fetch units: ${response.status}`);
        }

        const data = await response.json();
        console.log('Units data from API:', data);
        
        // Handle different response structures from Django API
        let units;
        if (Array.isArray(data)) {
            // Direct array response (legacy)
            units = data;
        } else if (data && Array.isArray(data.units)) {
            // Object with units property (current API structure)
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
        console.error('Error fetching units:', error);
        return [];
    }
    */
};

/**
 * Get course progress (active lesson info)
 * This is a derived function - the Django API provides lesson completion
 * status within the units, so we calculate the first uncompleted lesson
 * 
 * 🧪 COMMENTED OUT FOR REDUX INDEPENDENCE TEST
 */
export const getCourseProgress = async (courseId?: string) => {
    console.warn('🧪 LEGACY getCourseProgress called - Redux should handle this!');
    console.warn('🔄 If you see this, the component is not using Redux properly');
    
    // Return null to prevent crashes during testing
    return null;
    
    /* ORIGINAL IMPLEMENTATION COMMENTED OUT FOR TESTING
    try {
        if (!courseId) return null;
        
        const units = await getUnits(courseId);
        
        // Find the first uncompleted lesson
        for (const unit of units) {
            for (const lesson of unit.lessons || []) {
                if (!lesson.completed) {
                    return {
                        activeLesson: lesson,
                        activeLessonId: lesson.id
                    };
                }
            }
        }
        
        // All lessons completed
        return {
            activeLesson: null,
            activeLessonId: null
        };
    } catch (error) {
        console.error('Error calculating course progress:', error);
        return null;
    }
    */
};

/**
 * Get lesson details with challenges
 * Replaces: getLesson() from client project
 * Django API: GET /api/v1/practice/lessons/{lessonId}/
 * 
 * 🧪 COMMENTED OUT FOR REDUX INDEPENDENCE TEST
 */
export const getLesson = async (lessonId?: string) => {
    console.warn('🧪 LEGACY getLesson called - Redux should handle this!');
    console.warn('🔄 If you see this, the component is not using Redux properly');
    
    // Return mock lesson data to prevent crashes during testing
    return {
        id: lessonId || 'mock-lesson-id',
        title: 'Mock Lesson for Testing',
        challenges: []
    };
    
    /* ORIGINAL IMPLEMENTATION COMMENTED OUT FOR TESTING
    try {
        const token = getAuthToken();
        if (!token) return null;

        let targetLessonId = lessonId;
        
        // If no lessonId provided, get the active lesson ID
        if (!targetLessonId) {
            const userProgress = await getUserProgress();
            if (!userProgress?.active_course) return null;
            
            const courseProgress = await getCourseProgress(userProgress.active_course.id);
            targetLessonId = courseProgress?.activeLessonId;
            
            if (!targetLessonId) return null;
        }

        const response = await fetch(`${API_BASE_URL}/practice/lessons/${targetLessonId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch lesson');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return null;
    }
    */
};

/**
 * Get lesson completion percentage
 * Replaces: getLessonPercentage() from client project
 * Django API: GET /api/v1/practice/lessons/{lessonId}/percentage/
 * 
 * 🧪 COMMENTED OUT FOR REDUX INDEPENDENCE TEST
 */
export const getLessonPercentage = async (lessonId?: string) => {
    console.warn('🧪 LEGACY getLessonPercentage called - Redux should handle this!');
    console.warn('🔄 If you see this, the component is not using Redux properly');
    
    // Return 0 to prevent crashes during testing
    return 0;
    
    /* ORIGINAL IMPLEMENTATION COMMENTED OUT FOR TESTING
    try {
        if (!lessonId) return 0;
        
        const token = getAuthToken();
        if (!token) return 0;

        const response = await fetch(`${API_BASE_URL}/practice/lessons/${lessonId}/percentage/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch lesson percentage');
        }

        const data = await response.json();
        return data.percentage || 0;
    } catch (error) {
        console.error('Error fetching lesson percentage:', error);
        return 0;
    }
    */
};