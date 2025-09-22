/**
 * Test Script - Redux Migration Integration Test
 * 
 * Testa se os endpoints Django estão sendo consumidos corretamente pelo Redux
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testEndpoints() {
    console.log('🧪 Testing Redux Migration - Django Integration');
    console.log('=' * 50);
    
    const endpoints = [
        '/practice/courses/',
        '/practice/user-progress/',
        '/practice/analytics/',
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n📡 Testing: ${endpoint}`);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            console.log(`   Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Success - Data type: ${Array.isArray(data) ? 'Array' : 'Object'}`);
                console.log(`   📊 Data length: ${Array.isArray(data) ? data.length : Object.keys(data).length}`);
            } else {
                console.log(`   ⚠️ ${response.status} - ${response.statusText}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n🏁 Test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Open http://localhost:3003/user/laboratory/learn');
    console.log('2. Check browser console for Redux migration logs');
    console.log('3. Look for 🔄 Redux indicators in the UI');
}

testEndpoints();