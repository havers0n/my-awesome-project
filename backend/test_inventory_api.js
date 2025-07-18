require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function testInventoryAPI() {
  try {
    console.log('🧪 АУДИТ API /inventory/products');
    console.log('='.repeat(50));
    
    // Тестируем direct SQL запросы к VIEW
    console.log('\n1️⃣ ПРОВЕРКА VIEW current_stock_view:');
    const { data: viewData, error: viewError } = await supabaseAdmin
      .from('current_stock_view')
      .select('*')
      .limit(3);
    
    if (viewError) {
      console.error('❌ VIEW current_stock_view недоступен:', viewError);
    } else {
      console.log('✅ VIEW current_stock_view работает:');
      console.log(JSON.stringify(viewData, null, 2));
    }
    
    console.log('\n2️⃣ ПРОВЕРКА VIEW stock_by_location_view:');
    const { data: locationData, error: locationError } = await supabaseAdmin
      .from('stock_by_location_view')
      .select('*')
      .limit(5);
    
    if (locationError) {
      console.error('❌ VIEW stock_by_location_view недоступен:', locationError);
    } else {
      console.log('✅ VIEW stock_by_location_view работает:');
      console.log(JSON.stringify(locationData, null, 2));
    }
    
    // Имитируем логику контроллера getProducts
    console.log('\n3️⃣ ИМИТАЦИЯ ЛОГИКИ getProducts:');
    
    const organizationId = 1; // По умолчанию
    
    // Запрос как в контроллере
    const { data: stockData, error: stockError } = await supabaseAdmin
      .from('current_stock_view')
      .select('*')
      .eq('organization_id', organizationId)
      .order('product_name');
    
    if (stockError) {
      console.error('❌ Ошибка получения данных:', stockError);
      return;
    }
    
    console.log(`📊 Найдено ${stockData?.length || 0} продуктов для organization_id = ${organizationId}`);
    
    if (!stockData || stockData.length === 0) {
      console.log('⚠️ НЕТ ДАННЫХ! Возможные причины:');
      console.log('   - Нет продуктов для organization_id = 1');
      console.log('   - VIEW созданы, но не работают');
      console.log('   - Нет операций в таблице operations');
      return;
    }
    
    // Запрос деталей по локациям
    const { data: locationStockData, error: locationStockError } = await supabaseAdmin
      .from('stock_by_location_view')
      .select('*')
      .eq('organization_id', organizationId);
    
    console.log(`📍 Найдено ${locationStockData?.length || 0} записей по локациям`);
    
    // Форматируем как в контроллере
    const formattedProducts = stockData.map((item) => {
      const stockByLocation = (locationStockData || [])
        .filter((loc) => loc.product_id === item.product_id)
        .map((loc) => ({
          location_id: loc.location_id,
          location_name: loc.location_name,
          stock: Number(loc.stock) || 0
        }));

      return {
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        code: item.code,
        price: Number(item.price) || 0,
        stock_by_location: stockByLocation,
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Дополнительные поля для совместимости
        current_stock: Number(item.current_stock) || 0,
        stock_status: item.stock_status || 'Неизвестно',
        locations_with_stock: Number(item.locations_with_stock) || 0
      };
    });
    
    console.log('\n4️⃣ ФИНАЛЬНЫЙ ОТВЕТ API (как его видит frontend):');
    const apiResponse = {
      data: formattedProducts,
      pagination: {
        page: 1,
        limit: 100,
        total: formattedProducts.length
      }
    };
    
    console.log('СТРУКТУРА ОТВЕТА:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n5️⃣ АНАЛИЗ ДАННЫХ:');
    formattedProducts.forEach((product, index) => {
      console.log(`\n📦 Продукт ${index + 1}: ${product.product_name}`);
      console.log(`   - SKU: ${product.sku}`);
      console.log(`   - Общий остаток: ${product.current_stock}`);
      console.log(`   - Статус: ${product.stock_status}`);
      console.log(`   - Локаций с остатками: ${product.locations_with_stock}`);
      console.log(`   - Детализация по локациям: ${product.stock_by_location.length} записей`);
      
      if (product.stock_by_location.length > 0) {
        product.stock_by_location.forEach(loc => {
          console.log(`     • ${loc.location_name}: ${loc.stock}`);
        });
      } else {
        console.log(`     ⚠️ НЕТ ДАННЫХ ПО ЛОКАЦИЯМ!`);
      }
    });
    
    console.log('\n6️⃣ ВЫВОДЫ:');
    if (formattedProducts.length === 0) {
      console.log('❌ API возвращает пустой массив - frontend получает пустые данные');
    } else {
      const hasStockData = formattedProducts.some(p => p.current_stock > 0 || p.stock_by_location.length > 0);
      if (hasStockData) {
        console.log('✅ API возвращает данные с остатками - проблема в frontend');
      } else {
        console.log('⚠️ API возвращает продукты, но без остатков - проблема в VIEW или данных');
      }
    }
    
  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА:', error);
  }
}

console.log('Запуск аудита API...');
testInventoryAPI(); 