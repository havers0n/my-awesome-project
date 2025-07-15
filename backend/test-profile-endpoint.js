const axios = require('axios');

async function testProfileEndpoint() {
  try {
    // Test 1: Health check (may return 503 due to ML service being down)
    console.log('Testing health endpoint...');
    try {
      const healthResponse = await axios.get('http://localhost:3000/api/health');
      console.log('Health check status:', healthResponse.status);
      console.log('Health check data:', healthResponse.data);
    } catch (healthError) {
      console.log('Health check error (expected if ML service is down):', healthError.response?.status);
      console.log('Health check details:', healthError.response?.data);
    }
    
    // Test 1.5: Check if auth routes are working
    console.log('\nTesting auth endpoint...');
    try {
      const authResponse = await axios.get('http://localhost:3000/api/auth/me');
      console.log('Auth response:', authResponse.data);
    } catch (authError) {
      console.log('Auth error status:', authError.response?.status);
      console.log('Auth error (expected 401):', authError.response?.data?.error);
    }
    
    // Test 1.6: Check if admin routes are working
    console.log('\nTesting admin endpoint...');
    try {
      const adminResponse = await axios.get('http://localhost:3000/api/admin/users');
      console.log('Admin response:', adminResponse.data);
    } catch (adminError) {
      console.log('Admin error status:', adminError.response?.status);
      console.log('Admin error (expected 401):', adminError.response?.data?.error);
    }
    
    // Test 1.7: Check if users routes are working with GET
    console.log('\nTesting users endpoint with GET...');
    try {
      const usersResponse = await axios.get('http://localhost:3000/api/users');
      console.log('Users GET response:', usersResponse.data);
    } catch (usersError) {
      console.log('Users GET error status:', usersError.response?.status);
      console.log('Users GET error:', usersError.response?.data || usersError.message);
    }
    
    // Test 2: Profile endpoint with fake token (should return 401)
    console.log('\nTesting profile endpoint with fake token...');
    const profileResponse = await axios.put('http://localhost:3000/api/users/profile', 
      { fullName: 'Test User' }, 
      { headers: { 'Authorization': 'Bearer fake-token' } }
    );
    console.log('Profile response:', profileResponse.data);
  } catch (error) {
    console.log('Profile endpoint error status:', error.response?.status);
    console.log('Profile endpoint error message:', error.response?.data?.error || error.message);
    console.log('Profile endpoint error details:', error.response?.data);
    
    // Test 2.1: Try profile endpoint under auth routes (temporary workaround)
    console.log('\nTesting profile endpoint under /api/auth/profile...');
    try {
      const authProfileResponse = await axios.put('http://localhost:3000/api/auth/profile', 
        { fullName: 'Test User' }, 
        { headers: { 'Authorization': 'Bearer fake-token' } }
      );
      console.log('Auth profile response:', authProfileResponse.data);
    } catch (authError) {
      console.log('Auth profile error status:', authError.response?.status);
      console.log('Auth profile error message:', authError.response?.data?.error || authError.message);
      
      if (authError.response?.status === 401) {
        console.log('\n✅ SUCCESS: The profile endpoint is working at /api/auth/profile (401 expected for fake token)');
      } else if (authError.response?.status === 404) {
        console.log('\n❌ PROBLEM: The profile endpoint is also not found at /api/auth/profile');
      }
    }
    
    // If it's a 404, that means the route is not found
    if (error.response?.status === 404) {
      console.log('\n❌ PROBLEM: The profile endpoint is returning 404 - route not found!');
    } else if (error.response?.status === 401) {
      console.log('\n✅ SUCCESS: The profile endpoint is working (401 expected for fake token)');
    }
  }
}

testProfileEndpoint(); 