require('dotenv').config();
const axios = require('axios');

async function testUserCreation() {
  try {
    console.log('Testing user creation API with workaround...');
    
    // Test creating a user through our API
    const testEmail = `test-${Date.now()}@example.com`;
    console.log('Creating user with email:', testEmail);
    
    const response = await axios.post('http://localhost:3000/api/admin/users', {
      email: testEmail,
      password: 'testpassword123',
      full_name: 'Test User',
      organization_id: 1,
      role: 'EMPLOYEE'
    }, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjZqeGVNTzVvSnpuV3VOdkMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3V4Y3N6aXlsbXlvZ3ZjcXl5dWl3LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5NzIwMDdmNS0zMDVmLTQ5Y2EtYTM1MS1lYTU1MjBhMDk4MmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUyNzUzNjY1LCJpYXQiOjE3NTI3NTAwNjUsImVtYWlsIjoiZGFueXBldHJvdjIwMDJAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiZGFuaWVsIGhhdmVyc29uIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTI3NTAwNjV9XSwic2Vzc2lvbl9pZCI6IjBkMzFmNmIxLTRkYTMtNDdjNS1hMWZkLTg3MGU5ZGVhYWVjOCIsImlzX2Fub255bW91cyI6ZmFsc2V9.Fd1hAf_SDFYFw41CuZ3HsPv66NuTMUka8Bcu6IxFxsc',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Request made but no response received:', error.request);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is the backend server running?');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Request timed out');
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('Full error:', error);
  }
}

testUserCreation(); 