/**
 * Direct API Testing Utility
 * 
 * Test API endpoints directly to verify backend behavior
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
};

/**
 * Test course creation with exact HTTP call
 */
export const testDirectCourseCreation = async () => {
    console.log('🧪 DIRECT API TEST - Course Creation');
    
    const token = getAuthToken();
    if (!token) {
        console.error('❌ No auth token available');
        return;
    }
    
    const testPayload = {
        // Basic fields
        title: `Direct API Test ${Date.now()}`,
        description: 'Testing direct API call to verify backend behavior',
        category: 'Technology', 
        level: 'intermediate',
        template: 'technology',
        
        // Teacher fields - EXPLICIT
        teacher_id: 'test-teacher-direct-123',
        teacher_email: 'direct-test@teacher.com',
        teacher_name: 'Direct Test Teacher',
        
        // Course metadata - EXPLICIT  
        course_type: 'practice',
        status: 'draft',
        created_by: 'test-teacher-direct-123',
        language: 'pt-BR',
        difficulty_level: 'intermediate',
        
        // Additional test fields
        test_field_1: 'test_value_1',
        test_field_2: 'test_value_2',
        custom_metadata: {
            source: 'direct_api_test',
            timestamp: new Date().toISOString()
        }
    };
    
    console.log('📦 PAYLOAD TO SEND:', testPayload);
    console.log('📦 PAYLOAD KEYS:', Object.keys(testPayload));
    console.log('📦 PAYLOAD JSON:', JSON.stringify(testPayload, null, 2));
    
    try {
        console.log('🌐 Making direct fetch call...');
        
        const response = await fetch(`${API_BASE_URL}/practice/courses/create/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Add custom headers to trace the request
                'X-Test-Source': 'direct-api-test',
                'X-Request-ID': `test-${Date.now()}`
            },
            body: JSON.stringify(testPayload),
        });
        
        console.log('📡 RESPONSE STATUS:', response.status);
        console.log('📡 RESPONSE STATUS TEXT:', response.statusText);
        console.log('📡 RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ ERROR RESPONSE:', errorText);
            
            try {
                const errorJson = JSON.parse(errorText);
                console.error('❌ ERROR JSON:', errorJson);
            } catch (e) {
                console.error('❌ Error is not JSON format');
            }
            
            return { success: false, error: errorText, status: response.status };
        }
        
        const responseData = await response.json();
        console.log('✅ SUCCESS RESPONSE:', responseData);
        
        // Analyze what came back vs what we sent
        console.log('🔍 FIELD ANALYSIS:');
        console.log('📤 Fields SENT:', Object.keys(testPayload));
        console.log('📥 Fields RECEIVED:', Object.keys(responseData));
        
        const sentFields = Object.keys(testPayload);
        const receivedFields = Object.keys(responseData);
        const missingFields = sentFields.filter(field => !(field in responseData));
        const extraFields = receivedFields.filter(field => !(field in testPayload));
        
        console.log('❌ MISSING in response:', missingFields);
        console.log('➕ EXTRA in response:', extraFields);
        
        // Check specific critical fields
        const criticalFields = ['teacher_id', 'teacher_email', 'course_type', 'created_by'];
        const criticalFieldsStatus = criticalFields.map(field => ({
            field,
            sent: testPayload[field as keyof typeof testPayload],
            received: responseData[field],
            present: field in responseData
        }));
        
        console.log('🎯 CRITICAL FIELDS STATUS:', criticalFieldsStatus);
        
        return {
            success: true,
            request: testPayload,
            response: responseData,
            analysis: {
                sentFields,
                receivedFields,
                missingFields,
                extraFields,
                criticalFieldsStatus
            }
        };
        
    } catch (error) {
        console.error('❌ DIRECT API TEST FAILED:', error);
        return { success: false, error: String(error) };
    }
};

/**
 * Test getting courses to see what fields are returned
 */
export const testDirectCourseList = async () => {
    console.log('🧪 DIRECT API TEST - Course List');
    
    const token = getAuthToken();
    if (!token) {
        console.error('❌ No auth token available');
        return;
    }
    
    const endpoints = [
        `${API_BASE_URL}/practice/courses/`,
        `${API_BASE_URL}/practice/courses/?include_drafts=true`,
        `${API_BASE_URL}/practice/courses/?course_type=practice`,
        `${API_BASE_URL}/practice/courses/?include_drafts=true&course_type=practice`
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\n🔍 Testing endpoint: ${endpoint}`);
        
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint} - ${data.length} courses`);
                
                if (data.length > 0) {
                    console.log('📋 Sample course fields:', Object.keys(data[0]));
                    console.log('📋 Sample course:', data[0]);
                }
            } else {
                console.log(`❌ ${endpoint} - HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint} - Error: ${error}`);
        }
    }
};

// Make functions available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    (window as any).testDirectAPI = {
        createCourse: testDirectCourseCreation,
        listCourses: testDirectCourseList
    };
    
    console.log('🧪 Direct API test functions available at:');
    console.log('   window.testDirectAPI.createCourse()');
    console.log('   window.testDirectAPI.listCourses()');
}