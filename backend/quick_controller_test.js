require('dotenv').config();
const { getProducts } = require('./dist/controllers/inventoryController.js');

async function quickTest() {
  try {
    console.log('🔍 БЫСТРЫЙ ТЕСТ КОНТРОЛЛЕРА');
    console.log('='.repeat(40));
    
    const mockReq = {
      user: { organization_id: 1 },
      headers: {}
    };
    
    let responseData = null;
    
    const mockRes = {
      status: () => mockRes,
      json: (data) => { responseData = data; }
    };
    
    await getProducts(mockReq, mockRes);
    
    if (responseData && responseData.data) {
      const products = responseData.data;
      console.log(`✅ Получено продуктов: ${products.length}`);
      
      const withStock = products.filter(p => p.current_stock > 0);
      const withZeroStock = products.filter(p => p.current_stock === 0);
      
      console.log(`📦 С остатками > 0: ${withStock.length}`);
      console.log(`❌ С нулевыми остатками: ${withZeroStock.length}`);
      
      if (withStock.length > 0) {
        console.log('\n✅ ПРИМЕРЫ С ОСТАТКАМИ:');
        withStock.slice(0, 3).forEach(p => {
          console.log(`  ${p.product_name}: ${p.current_stock}`);
        });
      }
      
      console.log('\n🎯 РЕЗУЛЬТАТ:');
      if (withStock.length > 0) {
        console.log('✅ КОНТРОЛЛЕР РАБОТАЕТ - возвращает остатки!');
        console.log('➡️ Проблема НЕ в backend');
      } else {
        console.log('❌ Контроллер возвращает нули');
        console.log('➡️ Проблема В backend');
      }
    } else {
      console.log('❌ Контроллер не вернул данные');
    }
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error.message);
  }
}

quickTest(); 