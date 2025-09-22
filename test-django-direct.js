/**
 * Direct Django API Test Script
 * 
 * Execute this file to test Django API directly and verify if it receives the data correctly
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Mock auth token - you need to get a real one from your localStorage
const AUTH_TOKEN = 'your_actual_token_here';

/**
 * Test course creation with complete data
 */
async function testDirectCourseCreation() {
    console.log('🧪 DIRECT DJANGO API TEST - Course Creation');
    
    const testPayload = {
        // Basic fields
        title: `Direct Test Course ${Date.now()}`,
        description: 'Testing direct API call to verify Django backend behavior',
        category: 'Technology', 
        level: 'intermediate',
        template: 'technology',
        
        // Teacher fields - EXPLICIT
        teacher_id: 'direct-test-teacher-123',
        teacher_email: 'direct-test@teacher.com',
        teacher_name: 'Direct Test Teacher',
        
        // Course metadata - EXPLICIT  
        course_type: 'practice',
        status: 'draft',
        created_by: 'direct-test-teacher-123',
        language: 'pt-BR',
        difficulty_level: 'intermediate',
        
        // Additional test fields to verify backend processing
        test_field_1: 'test_value_1',
        test_field_2: 'test_value_2',
        learningObjectives: ['Learn technical vocabulary', 'Practice code review'],
        targetAudience: 'Software developers',
        hearts: 5,
        pointsPerChallenge: 10,
        passingScore: 70,
        
        // Extended metadata
        custom_metadata: {
            source: 'direct_api_test',
            timestamp: new Date().toISOString(),
            version: '1.0'
        }
    };
    
    console.log('📦 PAYLOAD TO SEND:', testPayload);
    console.log('📦 PAYLOAD KEYS:', Object.keys(testPayload));
    console.log('📦 PAYLOAD JSON:', JSON.stringify(testPayload, null, 2));
    
    try {
        console.log('🌐 Making direct fetch call to Django...');
        
        const response = await fetch(`${API_BASE_URL}/practice/courses/create/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Add custom headers to trace the request
                'X-Test-Source': 'direct-django-test',
                'X-Request-ID': `test-${Date.now()}`,
                'X-Debug-Mode': 'true'
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
        
        // Critical field analysis
        console.log('🔍 CRITICAL FIELD ANALYSIS:');
        console.log('📤 Fields SENT:', Object.keys(testPayload));
        console.log('📥 Fields RECEIVED:', Object.keys(responseData));
        
        const sentFields = Object.keys(testPayload);
        const receivedFields = Object.keys(responseData);
        const missingFields = sentFields.filter(field => !(field in responseData));
        const extraFields = receivedFields.filter(field => !(field in testPayload));
        
        console.log('❌ MISSING in response:', missingFields);
        console.log('➕ EXTRA in response:', extraFields);
        
        // Check specific critical fields
        const criticalFields = ['teacher_id', 'teacher_email', 'teacher_name', 'course_type', 'created_by', 'status'];
        const criticalFieldsStatus = criticalFields.map(field => ({
            field,
            sent: testPayload[field],
            received: responseData[field],
            present: field in responseData,
            matches: testPayload[field] === responseData[field]
        }));
        
        console.log('🎯 CRITICAL FIELDS STATUS:', criticalFieldsStatus);
        
        // Field-by-field comparison
        console.log('📊 FIELD-BY-FIELD COMPARISON:');
        sentFields.forEach(field => {
            const sent = testPayload[field];
            const received = responseData[field];
            const status = field in responseData ? 
                (sent === received ? '✅ MATCH' : '⚠️ DIFFERENT') : 
                '❌ MISSING';
            
            console.log(`  ${field}: ${status}`, { sent, received });
        });
        
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
        console.error('❌ DIRECT DJANGO TEST FAILED:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Test getting courses to see what fields are returned
 */
async function testDirectCourseList() {
    console.log('🧪 DIRECT DJANGO TEST - Course List');
    
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
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint} - ${data.length} courses`);
                
                if (data.length > 0) {
                    console.log('📋 Sample course fields:', Object.keys(data[0]));
                    console.log('📋 Sample course:', data[0]);
                    
                    // Check for our critical fields in the latest course
                    const latestCourse = data[0];
                    const criticalFields = ['teacher_id', 'teacher_email', 'teacher_name', 'course_type', 'created_by'];
                    const criticalFieldsPresent = criticalFields.filter(field => field in latestCourse);
                    const criticalFieldsMissing = criticalFields.filter(field => !(field in latestCourse));
                    
                    console.log('🎯 Critical fields present:', criticalFieldsPresent);
                    console.log('❌ Critical fields missing:', criticalFieldsMissing);
                }
            } else {
                const errorText = await response.text();
                console.log(`❌ ${endpoint} - HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint} - Error: ${error}`);
        }
    }
}

// Instructions for running the test
console.log(`
🧪 DJANGO DIRECT API TEST SCRIPT

To run this test:

1. First, get your auth token:
   - Open browser DevTools on your app
   - Go to Application > Local Storage > http://localhost:3001
   - Copy the 'access_token' value
   - Replace 'your_actual_token_here' in this file

2. Make sure Django server is running on port 8000

3. Run this script:
   node test-django-direct.js

4. Or copy and paste the functions into browser console

Available functions:
- testDirectCourseCreation()
- testDirectCourseList()
`);

// Auto-export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testDirectCourseCreation,
        testDirectCourseList
    };
}

// Make available globally for browser console
if (typeof window !== 'undefined') {
    window.testDjango = {
        createCourse: testDirectCourseCreation,
        listCourses: testDirectCourseList
    };
}