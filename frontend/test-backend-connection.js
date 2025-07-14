// Simple test to check backend connection
const fetch = require('node-fetch');

async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test if backend is running
    const response = await fetch('http://localhost:3000/api/predictions/debug-auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

testBackendConnection();
