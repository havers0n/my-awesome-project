const http = require('http');

async function checkTestRoute() {
  console.log('🔍 ПРОВЕРКА ТЕСТОВОГО РОУТА /products-test');
  console.log('='.repeat(60));
  
  try {
    const url = `http://localhost:3000/api/inventory/products-test`;
    console.log(`🔗 URL: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`📋 Статус: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const product = data.data[0];
        
        console.log(`✅ Продукт: ${product.product_name}`);
        console.log(`📊 Все поля: ${Object.keys(product).join(', ')}`);
        
        // Проверяем тестовые значения
        const hasStock = product.hasOwnProperty('current_stock');
        const hasStatus = product.hasOwnProperty('stock_status');
        const hasDebug = product.hasOwnProperty('debug_original_current_stock');
        
        console.log('\n🎯 КЛЮЧЕВЫЕ ПОЛЯ:');
        console.log(`  current_stock: ${hasStock ? '✅ ' + product.current_stock : '❌ НЕТ'}`);
        console.log(`  stock_status: ${hasStatus ? '✅ ' + product.stock_status : '❌ НЕТ'}`);
        console.log(`  debug поля: ${hasDebug ? '✅ ЕСТЬ' : '❌ НЕТ'}`);
        
        if (hasStock && product.current_stock === 1999) {
          console.log('🟢 НОВЫЙ КОД РАБОТАЕТ! (тестовое значение 1999 найдено)');
        } else if (hasStock && product.current_stock > 0) {
          console.log('🟠 РЕАЛЬНЫЕ ДАННЫЕ (не тестовые значения)');
        } else {
          console.log('🔴 СТАРЫЙ КОД (нет остатков)');
        }
        
        console.log('\n📋 ПОЛНЫЙ JSON:');
        console.log(JSON.stringify(product, null, 2));
      }
    } else {
      const text = await response.text();
      console.log(`❌ Ошибка ${response.status}: ${text}`);
    }
    
  } catch (error) {
    console.log(`❌ Ошибка подключения: ${error.message}`);
  }
}

// Polyfill для fetch
if (typeof fetch === 'undefined') {
  global.fetch = async (url) => {
    return new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => JSON.parse(data),
            text: async () => data
          });
        });
      });
      req.on('error', reject);
    });
  };
}

checkTestRoute(); 