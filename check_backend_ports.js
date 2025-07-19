const http = require('http');

async function checkBackendPorts() {
  console.log('🔍 ПРОВЕРКА BACKEND ПОРТОВ');
  console.log('='.repeat(50));
  
  const ports = [3000, 5173];
  
  for (const port of ports) {
    console.log(`\n📊 Проверяем порт ${port}...`);
    
    try {
      const url = `http://localhost:${port}/api/inventory/products?page=1&limit=1`;
      console.log(`🔗 URL: ${url}`);
      
      const response = await fetch(url);
      
      console.log(`📋 Статус: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          const product = data.data[0];
          
          console.log(`✅ Продукт: ${product.product_name}`);
          console.log(`📊 Поля продукта: ${Object.keys(product).join(', ')}`);
          
          // Проверяем ключевые поля
          const hasStock = product.hasOwnProperty('current_stock');
          const hasStatus = product.hasOwnProperty('stock_status');
          
          console.log(`🎯 current_stock: ${hasStock ? '✅ ' + product.current_stock : '❌ НЕТ'}`);
          console.log(`🎯 stock_status: ${hasStatus ? '✅ ' + product.stock_status : '❌ НЕТ'}`);
          
          if (hasStock && hasStatus) {
            console.log(`🟢 ПОРТ ${port}: НОВЫЙ КОД (с остатками)`);
          } else {
            console.log(`🔴 ПОРТ ${port}: СТАРЫЙ КОД (без остатков)`);
          }
        }
      } else {
        console.log(`❌ Ошибка ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Порт ${port} недоступен: ${error.message}`);
    }
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

checkBackendPorts(); 