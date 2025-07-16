const http = require('http');

// Function to make a GET request
function makeGetRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: headers
    };
    
    console.log(`Making request to ${url} with options:`, options);
    
    http.get(url, options, (res) => {
      let data = '';
      
      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // The whole response has been received
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        
        try {
          const parsedData = JSON.parse(data);
          console.log('Response data:', parsedData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          console.log('Raw response:', data);
          resolve({ statusCode: res.statusCode, data });
        }
      });
    }).on('error', (err) => {
      console.error(`Error: ${err.message}`);
      reject(err);
    });
  });
}

// Test the endpoints
async function testEndpoints() {
  try {
    console.log('=== TESTING API ENDPOINTS ===');
    console.log('Testing /api/test endpoint...');
    await makeGetRequest('http://localhost:3001/api/test');
    
    console.log('\nTesting /api/inventory/test-no-auth endpoint...');
    await makeGetRequest('http://localhost:3001/api/inventory/test-no-auth');
    
    // For authenticated endpoints, we would need a token
    // This is just a test without authentication to see the error response
    console.log('\nTesting /api/inventory/products endpoint (without auth)...');
    await makeGetRequest('http://localhost:3001/api/inventory/products');
    
    console.log('\nTesting /api/forecast/metrics endpoint (without auth)...');
    await makeGetRequest('http://localhost:3001/api/forecast/metrics');
    
    // If you have a token, you could test with authentication like this:
    // const token = 'your-auth-token';
    // await makeGetRequest('http://localhost:3001/api/forecast/metrics', { 'Authorization': `Bearer ${token}` });
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEndpoints();