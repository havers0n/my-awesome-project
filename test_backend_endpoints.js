const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Список endpoints для тестирования
const endpoints = [
  { name: 'Health Test', url: '/api/health/test', method: 'GET' },
  { name: 'Forecast Test', url: '/api/forecast/test', method: 'GET' },
  { name: 'Inventory Test', url: '/api/inventory/test', method: 'GET' },
  { name: 'Inventory Products', url: '/api/inventory/products', method: 'GET' },
  { name: 'Forecast Metrics', url: '/api/forecast/metrics', method: 'GET' },
  { name: 'ML Test', url: '/api/ml/test', method: 'GET' },
];

async function testEndpoint(endpoint) {
  try {
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.url}`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      name: endpoint.name,
      url: endpoint.url,
      status: response.status,
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      name: endpoint.name,
      url: endpoint.url,
      status: error.response?.status || 'NO_RESPONSE',
      success: false,
      error: error.message,
      data: error.response?.data || null
    };
  }
}

async function testAllEndpoints() {
  console.log('🚀 Тестирование всех backend endpoints...\n');
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    
    if (result.success) {
      console.log(`✅ ${result.name}: ${result.status}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
    } else {
      console.log(`❌ ${result.name}: ${result.status}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Error: ${result.error}`);
      if (result.data) {
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
      }
      console.log('');
    }
  }
  
  console.log('🏁 Тестирование завершено!');
}

// Дополнительный тест для ML сервиса
async function testMLService() {
  console.log('\n🤖 Тестирование ML сервиса...\n');
  
  const mlTestData = {
    "DaysCount": 7,
    "events": [
      {
        "Type": "Продажа",
        "Период": "2025-07-15T00:00:00",
        "Номенклатура": "Тестовый товар",
        "Код": "TEST123"
      }
    ]
  };
  
  try {
    const response = await axios.post('http://localhost:8000/predict', mlTestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ ML сервис работает корректно');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ ML сервис недоступен');
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Запуск тестов
testAllEndpoints().then(() => testMLService()); 