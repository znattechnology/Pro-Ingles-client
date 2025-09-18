// Test script to verify API connection
console.log('🔧 Testing API Configuration...');
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_DJANGO_API_URL:', process.env.NEXT_PUBLIC_DJANGO_API_URL);

// Test the API endpoint
fetch('http://localhost:8000/api/v1/practice/courses/', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('📡 API Response Status:', response.status);
  console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(data => {
  console.log('📄 API Response Body:', data);
})
.catch(error => {
  console.error('❌ API Error:', error);
});