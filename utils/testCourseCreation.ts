/**
 * Test Course Creation Utility
 * 
 * Function to test course creation with hardcoded data
 */

import { createPracticeCourse } from '@/actions/practice-management';

export const testCourseCreationWithHardcodedData = async () => {
    console.log('🧪 TESTING COURSE CREATION WITH HARDCODED DATA...');
    
    const testData = {
        title: `Test Course ${Date.now()}`,
        description: 'Test course with complete hardcoded data',
        category: 'General',
        level: 'beginner',
        template: 'general',
        // HARDCODED TEACHER DATA
        teacher_id: 'test-teacher-123',
        teacher_email: 'test@teacher.com',
        teacher_name: 'Test Teacher',
        // HARDCODED METADATA
        course_type: 'practice',
        status: 'draft',
        created_by: 'test-teacher-123',
        language: 'pt-BR',
        difficulty_level: 'beginner'
    };
    
    console.log('🧪 TEST DATA TO SEND:', testData);
    console.log('🧪 TEST DATA KEYS:', Object.keys(testData));
    
    try {
        const result = await createPracticeCourse(testData);
        console.log('🧪 TEST RESULT:', result);
        
        // Check if our fields made it through
        const fieldsCheck = {
            teacher_id: result.teacher_id,
            teacher_email: result.teacher_email,
            teacher_name: result.teacher_name,
            course_type: result.course_type,
            status: result.status,
            created_by: result.created_by,
            language: result.language
        };
        
        console.log('🧪 FIELDS THAT MADE IT THROUGH:', fieldsCheck);
        
        const missingFields = Object.entries(fieldsCheck)
            .filter(([_, value]) => value === undefined)
            .map(([key, _]) => key);
            
        console.log('🧪 MISSING FIELDS:', missingFields);
        
        if (missingFields.length === 0) {
            console.log('✅ ALL FIELDS SUCCESSFULLY SENT AND RECEIVED!');
        } else {
            console.log('❌ SOME FIELDS ARE MISSING - API OR BACKEND ISSUE');
        }
        
        return result;
        
    } catch (error) {
        console.error('🧪 TEST FAILED:', error);
        return null;
    }
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    (window as any).testCourseCreation = testCourseCreationWithHardcodedData;
    console.log('🧪 Test function available at window.testCourseCreation()');
}