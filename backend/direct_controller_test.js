require('dotenv').config();
const { getProducts } = require('./dist/controllers/inventoryController.js');

async function testControllerDirectly() {
  try {
    console.log('🔍 ПРЯМОЙ ТЕСТ КОНТРОЛЛЕРА inventoryController.getProducts');
    console.log('='.repeat(60));
    
    // Создаем мок объекты req и res
    const mockReq = {
      user: { organization_id: 1 },
      headers: {}
    };
    
    let responseData = null;
    let responseStatus = null;
    
    const mockRes = {
      status: (code) => {
        responseStatus = code;
        return mockRes;
      },
      json: (data) => {
        responseData = data;
        console.log(`📊 Response Status: ${responseStatus || 200}`);
        console.log(`📊 Response Data:`, JSON.stringify(data, null, 2));
      }
    };
    
    console.log('🚀 Вызов контроллера...');
    await getProducts(mockReq, mockRes);
    
    // Анализируем результат
    console.log('\n🔍 АНАЛИЗ РЕЗУЛЬТАТА:');
    
    if (responseData) {
      console.log('✅ Контроллер вернул данные');
      
      if (responseData.data && Array.isArray(responseData.data)) {
        console.log(`📦 Количество продуктов: ${responseData.data.length}`);
        
        if (responseData.data.length > 0) {
          const firstProduct = responseData.data[0];
          console.log('\n📋 ПЕРВЫЙ ПРОДУКТ:');
          console.log(`Name: ${firstProduct.product_name}`);
          console.log(`ID: ${firstProduct.product_id}`);
          console.log(`Current Stock: ${firstProduct.current_stock} (тип: ${typeof firstProduct.current_stock})`);
          console.log(`Stock Status: ${firstProduct.stock_status}`);
          console.log(`SKU: ${firstProduct.sku}`);
          console.log(`Price: ${firstProduct.price}`);
          
          // Проверяем остатки
          const productsWithStock = responseData.data.filter(p => p.current_stock && p.current_stock > 0);
          const productsWithZeroStock = responseData.data.filter(p => !p.current_stock || p.current_stock === 0);
          
          console.log('\n📊 АНАЛИЗ ОСТАТКОВ:');
          console.log(`Продуктов с остатками > 0: ${productsWithStock.length}`);
          console.log(`Продуктов с нулевыми остатками: ${productsWithZeroStock.length}`);
          
          if (productsWithStock.length > 0) {
            console.log('\n✅ ПРОДУКТЫ С ОСТАТКАМИ:');
            productsWithStock.slice(0, 5).forEach((product, index) => {
              console.log(`${index + 1}. ${product.product_name}: ${product.current_stock}`);
            });
          }
          
          if (productsWithZeroStock.length > 0) {
            console.log('\n❌ ПРОДУКТЫ БЕЗ ОСТАТКОВ:');
            productsWithZeroStock.slice(0, 5).forEach((product, index) => {
              console.log(`${index + 1}. ${product.product_name}: ${product.current_stock}`);
            });
          }
        }
      } else {
        console.log('❌ responseData.data не является массивом или отсутствует');
      }
    } else {
      console.log('❌ Контроллер не вернул данные');
    }
    
    console.log('\n🎯 ДИАГНОЗ:');
    
    if (responseData && responseData.data && responseData.data.length > 0) {
      const hasStock = responseData.data.some(p => p.current_stock && p.current_stock > 0);
      if (hasStock) {
        console.log('✅ КОНТРОЛЛЕР РАБОТАЕТ ПРАВИЛЬНО - возвращает остатки!');
        console.log('➡️ Проблема НЕ в backend контроллере');
        console.log('➡️ Возможно проблема в HTTP сервере или frontend');
      } else {
        console.log('❌ КОНТРОЛЛЕР ВОЗВРАЩАЕТ НУЛЕВЫЕ ОСТАТКИ');
        console.log('➡️ Проблема в логике контроллера или запросе к VIEW');
      }
    } else {
      console.log('❌ КОНТРОЛЛЕР НЕ ВОЗВРАЩАЕТ ПРОДУКТЫ');
      console.log('➡️ Критическая проблема в контроллере');
    }
    
  } catch (error) {
    console.error('💥 ОШИБКА при прямом тестировании контроллера:');
    console.error(error);
  }
}

console.log('Запуск прямого теста контроллера...');
testControllerDirectly(); 