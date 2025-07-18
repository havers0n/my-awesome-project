require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function testDirectView() {
  try {
    console.log('🧪 ТЕСТИРОВАНИЕ ПРЯМОГО ЗАПРОСА К current_stock_view');
    console.log('='.repeat(60));
    
    const organizationId = 1;
    
    console.log(`📊 Тестируем прямой запрос для organization_id: ${organizationId}`);
    
    // ТОЧНО тот же запрос что в новом контроллере
    console.log('\n✅ ПРЯМОЙ ЗАПРОС К current_stock_view:');
    
    const { data, error } = await supabaseAdmin
      .from('current_stock_view')
      .select('*')
      .eq('organization_id', organizationId)
      .order('product_name')
      .limit(5);

    if (error) {
      console.error('❌ Прямой запрос не работает:', error);
      return;
    }

    console.log(`✅ Прямой запрос работает! Получено ${data?.length || 0} продуктов`);
    
    if (!data || data.length === 0) {
      console.log('⚠️ Прямой запрос работает, но данных нет');
      return;
    }

    // Анализируем структуру данных
    console.log('\n📦 ДАННЫЕ ИЗ current_stock_view:');
    data.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.product_name}`);
      console.log(`   - Product ID: ${item.product_id}`);
      console.log(`   - SKU: ${item.sku}`);
      console.log(`   - Остаток: ${item.current_stock}`);
      console.log(`   - Статус: ${item.stock_status}`);
      console.log(`   - Локаций: ${item.locations_with_stock}`);
      console.log(`   - Цена: ${item.price}`);
    });

    // Получаем детализацию по локациям
    console.log('\n🔍 ПОЛУЧЕНИЕ ДЕТАЛИЗАЦИИ ПО ЛОКАЦИЯМ:');
    
    const { data: locationStockData, error: locationError } = await supabaseAdmin
      .from('stock_by_location_view')
      .select('*')
      .eq('organization_id', organizationId);

    if (locationError) {
      console.warn('⚠️ Could not fetch location details:', locationError);
    } else {
      console.log(`✅ Location data: ${locationStockData?.length || 0} records`);
    }

    // Тестируем форматирование как в контроллере
    console.log('\n🔧 ФОРМАТИРОВАНИЕ КАК В КОНТРОЛЛЕРЕ:');
    
    const formattedProducts = data.map((item) => {
      // Находим остатки по локациям для этого продукта
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
        // Поля остатков уже есть в current_stock_view
        current_stock: Number(item.current_stock) || 0,
        stock_status: item.stock_status || 'Нет данных',
        locations_with_stock: Number(item.locations_with_stock) || 0
      };
    });

    console.log('✅ Успешно отформатировано продуктов:', formattedProducts.length);

    // Показываем результат как получит frontend
    console.log('\n📋 ФИНАЛЬНЫЙ РЕЗУЛЬТАТ (как получит frontend):');
    
    const apiResponse = {
      data: formattedProducts,
      pagination: {
        page: 1,
        limit: 100,
        total: formattedProducts.length
      }
    };

    console.log(JSON.stringify(apiResponse, null, 2));

    // Проверяем наличие реальных остатков
    const hasStockData = formattedProducts.some(p => p.current_stock > 0);
    const totalStock = formattedProducts.reduce((sum, p) => sum + p.current_stock, 0);
    
    console.log('\n📊 АНАЛИЗ ОСТАТКОВ:');
    console.log(`Общий остаток по всем товарам: ${totalStock}`);
    console.log(`Товаров с остатками > 0: ${formattedProducts.filter(p => p.current_stock > 0).length}`);
    console.log(`Товаров с детализацией по локациям: ${formattedProducts.filter(p => p.stock_by_location.length > 0).length}`);

    console.log('\n🎯 ФИНАЛЬНЫЙ ВЫВОД:');
    if (hasStockData) {
      console.log('🎉 ПРЯМОЙ ЗАПРОС К current_stock_view РАБОТАЕТ!');
      console.log('🎉 Есть реальные остатки!');
      console.log('🎉 API вернет правильные данные frontend!');
    } else {
      console.log('⚠️ Прямой запрос работает, но остатки равны нулю');
    }

    console.log('\n🚀 СЛЕДУЮЩИЙ ШАГ:');
    console.log('Перезапустить backend и тестировать /api/inventory/products');
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск тестирования прямого запроса к current_stock_view...');
testDirectView(); 