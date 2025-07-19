const https = require('https');
const http = require('http');

async function checkAPIContract() {
  console.log('🔍 ПРОВЕРКА КОНТРАКТА API: /api/inventory/products');
  console.log('='.repeat(60));
  
  // Пробуем разные порты
  const ports = [5173, 3000];
  
  for (const port of ports) {
    console.log(`\n📊 Проверяем порт ${port}...`);
    
    try {
      const url = `http://localhost:${port}/api/inventory/products?page=1&limit=5`;
      console.log(`🔗 URL: ${url}`);
      
      const response = await fetch(url);
      
      console.log(`📋 Статус: ${response.status}`);
      console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        
        console.log('\n📦 СТРУКТУРА ОТВЕТА:');
        console.log(`- Есть data: ${!!data.data}`);
        console.log(`- Тип data: ${Array.isArray(data.data) ? 'массив' : typeof data.data}`);
        console.log(`- Длина: ${data.data?.length || 0}`);
        
        if (data.data && data.data.length > 0) {
          const firstProduct = data.data[0];
          
          console.log('\n🔍 ПОЛЯ ПЕРВОГО ПРОДУКТА:');
          Object.keys(firstProduct).forEach(key => {
            const value = firstProduct[key];
            console.log(`  ${key}: ${typeof value} = ${JSON.stringify(value).substring(0, 50)}${JSON.stringify(value).length > 50 ? '...' : ''}`);
          });
          
          console.log('\n🎯 ПРОВЕРКА КЛЮЧЕВЫХ ПОЛЕЙ:');
          
          // Проверяем поля для остатков
          const stockFields = ['stock', 'current_stock', 'quantity', 'amount'];
          const stockField = stockFields.find(field => firstProduct.hasOwnProperty(field));
          
          if (stockField) {
            console.log(`✅ Найдено поле остатков: ${stockField} = ${firstProduct[stockField]}`);
          } else {
            console.log(`❌ НЕ НАЙДЕНО поле остатков среди: ${stockFields.join(', ')}`);
            console.log(`📋 Доступные поля: ${Object.keys(firstProduct).join(', ')}`);
          }
          
          // Проверяем поле названия
          const nameFields = ['name', 'product_name', 'title', 'productName'];
          const nameField = nameFields.find(field => firstProduct.hasOwnProperty(field));
          
          if (nameField) {
            console.log(`✅ Найдено поле названия: ${nameField} = ${firstProduct[nameField]}`);
          } else {
            console.log(`❌ НЕ НАЙДЕНО поле названия среди: ${nameFields.join(', ')}`);
          }
          
          console.log('\n📋 ПОЛНЫЙ JSON ПЕРВОГО ПРОДУКТА:');
          console.log(JSON.stringify(firstProduct, null, 2));
        }
        
        console.log(`\n✅ ПОРТ ${port} РАБОТАЕТ - API возвращает данные`);
        return; // Если нашли рабочий порт, выходим
        
      } else {
        console.log(`❌ Ошибка ${response.status}: ${await response.text()}`);
      }
      
    } catch (error) {
      console.log(`❌ Порт ${port} недоступен: ${error.message}`);
    }
  }
  
  console.log('\n💡 РЕКОМЕНДАЦИИ:');
  console.log('1. Убедитесь что backend запущен на порту 3000 или frontend dev server проксирует API');
  console.log('2. Проверьте что frontend делает запросы к правильному URL');
  console.log('3. Если API работает, проверьте соответствие полей в ответе ожиданиям frontend');
}

// Polyfill для fetch если нет
if (typeof fetch === 'undefined') {
  global.fetch = async (url) => {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      const req = client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            headers: new Map(Object.entries(res.headers)),
            json: async () => JSON.parse(data),
            text: async () => data
          });
        });
      });
      req.on('error', reject);
    });
  };
}

checkAPIContract(); 