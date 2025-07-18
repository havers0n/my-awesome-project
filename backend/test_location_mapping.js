require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function testLocationMapping() {
  try {
    console.log('🧪 ТЕСТИРОВАНИЕ МАППИНГА ПО ЛОКАЦИЯМ');
    console.log('='.repeat(50));
    
    const organizationId = 1;
    
    // Получаем данные по локациям
    console.log('\n1️⃣ ДАННЫЕ ИЗ stock_by_location_view:');
    const { data: locationData, error: locationError } = await supabaseAdmin
      .from('stock_by_location_view')
      .select('*')
      .eq('organization_id', organizationId)
      .limit(10);

    if (locationError) {
      console.error('❌ Ошибка:', locationError);
      return;
    }

    console.log(`✅ Найдено ${locationData?.length || 0} записей по локациям`);
    
    // Группируем по продуктам
    const productIds = [...new Set(locationData?.map(loc => loc.product_id) || [])];
    console.log(`📦 Уникальных продуктов в локациях: ${productIds.length}`);
    console.log(`📦 ID продуктов: ${productIds.slice(0, 5).join(', ')}${productIds.length > 5 ? '...' : ''}`);

    // Берем первый продукт для детального анализа
    if (productIds.length > 0) {
      const testProductId = productIds[0];
      console.log(`\n2️⃣ ДЕТАЛИЗАЦИЯ ДЛЯ ПРОДУКТА ID = ${testProductId}:`);
      
      const productLocations = locationData?.filter(loc => loc.product_id === testProductId) || [];
      console.log(`📍 Локаций для этого продукта: ${productLocations.length}`);
      
      productLocations.forEach(loc => {
        console.log(`  - ${loc.location_name} (ID: ${loc.location_id}): ${loc.stock}`);
      });

      // Тестируем маппинг как в контроллере
      console.log('\n3️⃣ МАППИНГ КАК В КОНТРОЛЛЕРЕ:');
      const stockByLocation = productLocations.map((loc) => ({
        location_id: loc.location_id,
        location_name: loc.location_name,
        stock: Number(loc.stock) || 0
      }));

      console.log('Результат маппинга:');
      console.log(JSON.stringify(stockByLocation, null, 2));

      // Теперь получаем данные продукта
      console.log('\n4️⃣ ПОЛУЧЕНИЕ ДАННЫХ ПРОДУКТА:');
      const { data: productData, error: productError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', testProductId)
        .single();

      if (productError) {
        console.error('❌ Ошибка продукта:', productError);
      } else {
        console.log(`✅ Продукт: ${productData.name}`);
        
        // Получаем данные из current_stock_view
        const { data: stockViewData, error: stockViewError } = await supabaseAdmin
          .from('current_stock_view')
          .select('*')
          .eq('product_id', testProductId)
          .single();

        if (stockViewError) {
          console.error('❌ Ошибка current_stock_view:', stockViewError);
        } else {
          console.log(`✅ Общий остаток: ${stockViewData.current_stock}`);

          // Полный объект как в контроллере
          console.log('\n5️⃣ ПОЛНЫЙ ОБЪЕКТ ДЛЯ FRONTEND:');
          const fullProduct = {
            product_id: productData.id,
            product_name: productData.name,
            sku: productData.sku,
            code: productData.code,
            price: Number(productData.price) || 0,
            stock_by_location: stockByLocation,
            created_at: productData.created_at,
            updated_at: productData.updated_at,
            current_stock: Number(stockViewData.current_stock) || 0,
            stock_status: stockViewData.stock_status || 'Неизвестно',
            locations_with_stock: stockByLocation.length
          };

          console.log(JSON.stringify(fullProduct, null, 2));

          console.log('\n6️⃣ ПРОВЕРКА:');
          if (fullProduct.current_stock > 0) {
            console.log('✅ Общий остаток > 0');
          } else {
            console.log('❌ Общий остаток = 0');
          }

          if (fullProduct.stock_by_location.length > 0) {
            console.log('✅ Есть детализация по локациям');
          } else {
            console.log('❌ НЕТ детализации по локациям');
          }
        }
      }
    }

    console.log('\n7️⃣ ПРОБЛЕМА В ТЕСТЕ:');
    console.log('В предыдущем тесте мы брали первые 3 продукта по алфавиту,');
    console.log('но данные по локациям есть не для всех продуктов.');
    console.log('Нужно либо исправить фильтрацию, либо брать продукты');
    console.log('которые точно есть в stock_by_location_view.');
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск тестирования маппинга локаций...');
testLocationMapping(); 