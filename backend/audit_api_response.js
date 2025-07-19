require('dotenv').config();
const axios = require('axios');

async function auditAPIResponse() {
  try {
    console.log('🔍 АУДИТ API RESPONSE: /api/inventory/products');
    console.log('='.repeat(60));
    
    // Предполагаем что backend запущен на порту 3000
    const apiUrl = 'http://localhost:3000/api/inventory/products';
    
    console.log(`📊 Запрос к: ${apiUrl}`);
    console.log('⏱️ Отправляем запрос...');
    
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        // Добавляем заголовок организации если нужен
        'organization-id': '1'
      }
    });

    console.log(`✅ Статус ответа: ${response.status}`);
    console.log(`📊 Размер ответа: ${JSON.stringify(response.data).length} символов`);
    
    const data = response.data;
    
    // Анализируем структуру ответа
    console.log('\n📋 СТРУКТУРА ОТВЕТА:');
    console.log('- Есть поле data:', !!data.data);
    console.log('- Есть поле pagination:', !!data.pagination);
    
    if (data.data && Array.isArray(data.data)) {
      console.log(`- Количество продуктов: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log('\n📦 АНАЛИЗ ПЕРВОГО ПРОДУКТА:');
        const firstProduct = data.data[0];
        
        console.log('Поля продукта:');
        Object.keys(firstProduct).forEach(key => {
          console.log(`  - ${key}: ${typeof firstProduct[key]} = ${firstProduct[key]}`);
        });
        
        console.log('\n🔍 ПРОВЕРКА ОСТАТКОВ:');
        console.log(`current_stock: ${firstProduct.current_stock} (тип: ${typeof firstProduct.current_stock})`);
        console.log(`stock_status: ${firstProduct.stock_status}`);
        console.log(`locations_with_stock: ${firstProduct.locations_with_stock}`);
        
        if (firstProduct.stock_by_location && Array.isArray(firstProduct.stock_by_location)) {
          console.log(`stock_by_location: ${firstProduct.stock_by_location.length} локаций`);
          if (firstProduct.stock_by_location.length > 0) {
            console.log('Первая локация:', JSON.stringify(firstProduct.stock_by_location[0], null, 2));
          }
        } else {
          console.log('stock_by_location: НЕ МАССИВ или отсутствует');
        }
        
        console.log('\n📋 ПОЛНЫЙ JSON ПЕРВОГО ПРОДУКТА:');
        console.log(JSON.stringify(firstProduct, null, 2));
      }
      
      // Проверяем несколько продуктов на остатки
      console.log('\n📊 АНАЛИЗ ОСТАТКОВ ВСЕХ ПРОДУКТОВ:');
      
      const productsWithStock = data.data.filter(p => p.current_stock && p.current_stock > 0);
      const productsWithZeroStock = data.data.filter(p => !p.current_stock || p.current_stock === 0);
      
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
      
    } else {
      console.log('❌ data.data не является массивом или отсутствует');
    }
    
    console.log('\n🎯 ВЫВОДЫ:');
    if (data.data && data.data.length > 0) {
      const hasAnyStock = data.data.some(p => p.current_stock && p.current_stock > 0);
      if (hasAnyStock) {
        console.log('✅ API возвращает продукты с ненулевыми остатками');
        console.log('➡️ Проблема НЕ в backend API');
        console.log('➡️ Нужно проверить frontend или данные VIEW');
      } else {
        console.log('❌ API возвращает только нулевые остатки');
        console.log('➡️ Проблема в backend логике или VIEW данных');
        console.log('➡️ Нужно проверить current_stock_view в базе');
      }
    } else {
      console.log('❌ API не возвращает продукты');
      console.log('➡️ Критическая проблема в backend');
    }
    
  } catch (error) {
    console.error('\n💥 ОШИБКА ПРИ ЗАПРОСЕ К API:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend не запущен на localhost:3000');
      console.log('\n🔧 ДЛЯ ЗАПУСКА BACKEND:');
      console.log('cd backend');
      console.log('npm start');
    } else if (error.response) {
      console.error(`❌ HTTP ошибка: ${error.response.status}`);
      console.error(`Сообщение: ${error.response.data}`);
    } else {
      console.error('❌ Неизвестная ошибка:', error.message);
    }
    
    console.log('\n➡️ СНАЧАЛА ЗАПУСТИТЕ BACKEND, ЗАТЕМ ПОВТОРИТЕ АУДИТ');
  }
}

console.log('Запуск аудита API response...');
auditAPIResponse(); 