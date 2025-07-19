const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Тестовый токен (замените на реальный если нужна аутентификация)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

async function testApiEndpoints() {
  console.log('🔍 ТЕСТИРОВАНИЕ API ЭНДПОИНТОВ ДЛЯ МОДАЛЬНОГО ОКНА');
  
  try {
    // 1. Проверяем основной эндпоинт товаров
    console.log('\n1️⃣ Тестирование GET /api/inventory/products');
    try {
      const response = await axios.get(`${BASE_URL}/api/inventory/products`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log('✅ Статус:', response.status);
      console.log('✅ Количество товаров:', response.data?.data?.length || 0);
      
      if (response.data?.data?.length > 0) {
        const firstProduct = response.data.data[0];
        console.log('📦 Первый товар:', {
          id: firstProduct.product_id,
          name: firstProduct.product_name,
          current_stock: firstProduct.current_stock,
          stock_by_location: firstProduct.stock_by_location?.length || 0
        });
        
        // Проверим stock_by_location структуру
        if (firstProduct.stock_by_location && firstProduct.stock_by_location.length > 0) {
          console.log('📍 Первая локация в stock_by_location:', firstProduct.stock_by_location[0]);
        }
        
        // Тестируем эндпоинты для этого товара
        const testProductId = firstProduct.product_id;
        
        // 2. Тестируем получение операций
        console.log(`\n2️⃣ Тестирование GET /api/inventory/products/${testProductId}/operations`);
        try {
          const operationsResponse = await axios.get(`${BASE_URL}/api/inventory/products/${testProductId}/operations`, {
            headers: {
              'Authorization': `Bearer ${TEST_TOKEN}`
            }
          });
          
          console.log('✅ Статус операций:', operationsResponse.status);
          console.log('✅ Количество операций:', operationsResponse.data?.operations?.length || 0);
          
          if (operationsResponse.data?.operations?.length > 0) {
            console.log('📋 Первая операция:', operationsResponse.data.operations[0]);
          }
        } catch (error) {
          console.log('❌ Ошибка получения операций:', error.response?.status, error.response?.data?.error || error.message);
        }
        
        // 3. Тестируем получение поставщиков
        console.log('\n3️⃣ Тестирование GET /api/inventory/suppliers');
        try {
          const suppliersResponse = await axios.get(`${BASE_URL}/api/inventory/suppliers`, {
            headers: {
              'Authorization': `Bearer ${TEST_TOKEN}`
            }
          });
          
          console.log('✅ Статус поставщиков:', suppliersResponse.status);
          console.log('✅ Количество поставщиков:', suppliersResponse.data?.length || 0);
          
          if (suppliersResponse.data?.length > 0) {
            console.log('🚚 Первый поставщик:', suppliersResponse.data[0]);
            
            // 4. Тестируем получение информации о поставщике
            const firstSupplierId = suppliersResponse.data[0].id;
            console.log(`\n4️⃣ Тестирование GET /api/inventory/suppliers/${firstSupplierId}/delivery-info`);
            try {
              const supplierInfoResponse = await axios.get(`${BASE_URL}/api/inventory/suppliers/${firstSupplierId}/delivery-info`, {
                headers: {
                  'Authorization': `Bearer ${TEST_TOKEN}`
                }
              });
              
              console.log('✅ Статус информации поставщика:', supplierInfoResponse.status);
              console.log('✅ Аналитика поставщика:', supplierInfoResponse.data?.analytics);
            } catch (error) {
              console.log('❌ Ошибка получения информации поставщика:', error.response?.status, error.response?.data?.error || error.message);
            }
          }
        } catch (error) {
          console.log('❌ Ошибка получения поставщиков:', error.response?.status, error.response?.data?.error || error.message);
        }
      }
    } catch (error) {
      console.log('❌ Ошибка получения товаров:', error.response?.status, error.response?.data?.error || error.message);
    }
    
    // 5. Тестируем тестовый эндпоинт без аутентификации
    console.log('\n5️⃣ Тестирование GET /api/inventory/products-test (без аутентификации)');
    try {
      const testResponse = await axios.get(`${BASE_URL}/api/inventory/products-test`);
      console.log('✅ Статус тестового эндпоинта:', testResponse.status);
      console.log('✅ Количество товаров (тест):', testResponse.data?.data?.length || 0);
      
      if (testResponse.data?.data?.length > 0) {
        const testProduct = testResponse.data.data[0];
        console.log('📦 Тестовый товар:', {
          id: testProduct.product_id,
          name: testProduct.product_name,
          current_stock: testProduct.current_stock,
          stock_status: testProduct.stock_status,
          stock_by_location_count: testProduct.stock_by_location?.length || 0
        });
        
        if (testProduct.stock_by_location && testProduct.stock_by_location.length > 0) {
          console.log('📍 Локации в тестовом товаре:', testProduct.stock_by_location);
        }
      }
    } catch (error) {
      console.log('❌ Ошибка тестового эндпоинта:', error.response?.status, error.response?.data?.error || error.message);
    }
    
  } catch (error) {
    console.log('💥 Общая ошибка тестирования:', error.message);
  }
  
  console.log('\n🎯 ЗАКЛЮЧЕНИЕ:');
  console.log('Проверьте, какие эндпоинты работают корректно, а какие возвращают ошибки.');
  console.log('Особое внимание на структуру stock_by_location - есть ли location_name.');
}

testApiEndpoints().catch(console.error); 