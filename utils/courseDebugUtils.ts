/**
 * Course Debug Utilities
 * 
 * Comprehensive debugging tools for course creation and listing issues
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
 * Test all possible endpoint variations to find courses
 */
export const testAllCourseEndpoints = async () => {
    const token = getAuthToken();
    if (!token) {
        console.error('❌ No auth token found');
        return;
    }

    const endpoints = [
        { name: 'Basic Courses', url: `${API_BASE_URL}/practice/courses/` },
        { name: 'Include Drafts', url: `${API_BASE_URL}/practice/courses/?include_drafts=true` },
        { name: 'Course Type Practice', url: `${API_BASE_URL}/practice/courses/?course_type=practice` },
        { name: 'Both Parameters', url: `${API_BASE_URL}/practice/courses/?include_drafts=true&course_type=practice` },
        { name: 'All Status', url: `${API_BASE_URL}/practice/courses/?status=all` },
        { name: 'Draft Status', url: `${API_BASE_URL}/practice/courses/?status=draft` },
        { name: 'Published Status', url: `${API_BASE_URL}/practice/courses/?status=published` },
        { name: 'No Cache', url: `${API_BASE_URL}/practice/courses/?_t=${Date.now()}` },
        { name: 'Full Query', url: `${API_BASE_URL}/practice/courses/?include_drafts=true&course_type=practice&status=all&_t=${Date.now()}` },
    ];

    console.log('🧪 Testing all course endpoints...');
    console.log('=====================================');

    const results: any = {};

    for (const endpoint of endpoints) {
        try {
            console.log(`\n🔍 Testing: ${endpoint.name}`);
            console.log(`📡 URL: ${endpoint.url}`);

            const response = await fetch(endpoint.url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const courses = Array.isArray(data) ? data : [];
                
                results[endpoint.name] = {
                    status: response.status,
                    count: courses.length,
                    courses: courses.map(course => ({
                        id: course.id,
                        title: course.title,
                        status: course.status,
                        course_type: course.course_type,
                        created_at: course.created_at,
                        updated_at: course.updated_at
                    }))
                };

                console.log(`✅ Success: ${courses.length} courses found`);
                
                // Group by status
                const statusGroups = courses.reduce((acc: any, course: any) => {
                    const status = course.status || 'undefined';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});

                console.log(`📊 By Status:`, statusGroups);

                // Show recent courses
                const recent = courses
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3);
                
                if (recent.length > 0) {
                    console.log(`🕒 Most Recent:`);
                    recent.forEach((course: any, index: number) => {
                        console.log(`   ${index + 1}. "${course.title}" (${course.status}) - ${new Date(course.created_at).toLocaleString()}`);
                    });
                }

            } else {
                results[endpoint.name] = {
                    status: response.status,
                    error: `HTTP ${response.status}`,
                };
                console.log(`❌ Failed: HTTP ${response.status}`);
            }

        } catch (error) {
            results[endpoint.name] = {
                error: String(error)
            };
            console.log(`❌ Error: ${error}`);
        }
    }

    console.log('\n📋 SUMMARY REPORT');
    console.log('=====================================');
    
    // Find the endpoint with most courses
    const workingEndpoints = Object.entries(results)
        .filter(([_, result]: [string, any]) => result.count > 0)
        .sort(([_, a]: [string, any], [__, b]: [string, any]) => (b.count || 0) - (a.count || 0));

    if (workingEndpoints.length > 0) {
        console.log(`🏆 Best Endpoint: ${workingEndpoints[0][0]} (${(workingEndpoints[0][1] as any).count} courses)`);
        
        // Show all unique courses across all endpoints
        const allCourses = new Map();
        Object.values(results).forEach((result: any) => {
            if (result.courses) {
                result.courses.forEach((course: any) => {
                    allCourses.set(course.id, course);
                });
            }
        });
        
        console.log(`📊 Total Unique Courses Found: ${allCourses.size}`);
        
        // Show status distribution
        const allStatusGroups = Array.from(allCourses.values()).reduce((acc: any, course: any) => {
            const status = course.status || 'undefined';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        
        console.log(`📈 Status Distribution:`, allStatusGroups);
    } else {
        console.log('❌ No working endpoints found!');
    }

    return results;
};

/**
 * Create a test course and track its visibility
 */
export const createTestCourseAndTrack = async (testData = {
    title: `Test Course ${Date.now()}`,
    description: 'Test course for debugging',
    category: 'General',
    level: 'beginner'
}) => {
    console.log('🧪 Creating test course and tracking visibility...');
    
    const token = getAuthToken();
    if (!token) {
        console.error('❌ No auth token found');
        return;
    }

    try {
        // Create the course
        const createResponse = await fetch(`${API_BASE_URL}/practice/courses/create/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...testData,
                status: 'draft',
                course_type: 'practice'
            }),
        });

        if (!createResponse.ok) {
            console.error('❌ Failed to create test course:', createResponse.status);
            return;
        }

        const createdCourse = await createResponse.json();
        console.log('✅ Test course created:', {
            id: createdCourse.id,
            title: createdCourse.title,
            status: createdCourse.status,
            course_type: createdCourse.course_type
        });

        // Now test visibility across all endpoints
        console.log('\n🔍 Testing visibility of new course...');
        const results = await testAllCourseEndpoints();
        
        // Check which endpoints can see the new course
        const visibleIn: string[] = [];
        Object.entries(results).forEach(([name, result]: [string, any]) => {
            if (result.courses) {
                const found = result.courses.find((c: any) => c.id === createdCourse.id);
                if (found) {
                    visibleIn.push(name);
                }
            }
        });

        console.log('\n🎯 NEW COURSE VISIBILITY REPORT');
        console.log('=====================================');
        console.log(`Course ID: ${createdCourse.id}`);
        console.log(`Course Title: ${createdCourse.title}`);
        console.log(`Visible in ${visibleIn.length} endpoints:`);
        visibleIn.forEach(endpoint => console.log(`  ✅ ${endpoint}`));
        
        if (visibleIn.length === 0) {
            console.log('❌ Course is NOT visible in any endpoint!');
            console.log('🔍 This indicates a filtering or API issue');
        }

        return {
            createdCourse,
            visibleIn,
            allResults: results
        };

    } catch (error) {
        console.error('❌ Error in test course creation:', error);
        return null;
    }
};

/**
 * Compare course data between different endpoints
 */
export const compareCourseEndpoints = async () => {
    console.log('🔍 Comparing course data across endpoints...');
    
    const results = await testAllCourseEndpoints();
    
    // Extract all unique course IDs
    const allCourseIds = new Set();
    Object.values(results).forEach((result: any) => {
        if (result.courses) {
            result.courses.forEach((course: any) => {
                allCourseIds.add(course.id);
            });
        }
    });

    console.log('\n📊 ENDPOINT COMPARISON');
    console.log('=====================================');
    
    Array.from(allCourseIds).forEach((courseId: any) => {
        console.log(`\nCourse ID: ${courseId}`);
        
        Object.entries(results).forEach(([name, result]: [string, any]) => {
            if (result.courses) {
                const course = result.courses.find((c: any) => c.id === courseId);
                if (course) {
                    console.log(`  ✅ ${name}: "${course.title}" (${course.status})`);
                } else {
                    console.log(`  ❌ ${name}: Not visible`);
                }
            } else if (result.error) {
                console.log(`  ⚠️ ${name}: ${result.error}`);
            }
        });
    });

    return results;
};

// Make functions available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    (window as any).debugCourses = {
        testAllEndpoints: testAllCourseEndpoints,
        createTestAndTrack: createTestCourseAndTrack,
        compareEndpoints: compareCourseEndpoints
    };
    
    console.log('🛠️ Course debug utilities available at window.debugCourses');
}