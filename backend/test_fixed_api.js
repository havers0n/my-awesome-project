require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function testFixedAPI() {
  try {
    console.log('🧪 ТЕСТИРОВАНИЕ ИСПРАВЛЕННОГО API');
    console.log('='.repeat(50));
    
    // Имитируем вызов getProducts контроллера
    const organizationId = 1;
    
    console.log(`📊 Testing JOIN approach for organization_id: ${organizationId}`);
    
    // Тестируем JOIN подход как в исправленном контроллере
    console.log('\n1️⃣ ТЕСТИРОВАНИЕ JOIN products с current_stock_view:');
    
    const { data: productsWithStock, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
          id,
          name,
          sku,
          code,
          price,
          organization_id,
          created_at,
          updated_at,
          current_stock_view!inner(current_stock)
      `)
      .eq('organization_id', organizationId)
      .order('name');

    if (productsError) {
      console.error('❌ JOIN не работает:', productsError);
      console.log('\n2️⃣ ТЕСТИРОВАНИЕ FALLBACK подхода:');
      
      // Fallback подход как в контроллере
      const { data: allProducts, error: allProductsError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (allProductsError) {
        console.error('❌ Products fallback error:', allProductsError);
        return;
      }

      const { data: stockView, error: stockViewError } = await supabaseAdmin
        .from('current_stock_view')
        .select('*')
        .eq('organization_id', organizationId);

      if (stockViewError) {
        console.error('❌ Stock view error:', stockViewError);
        return;
      }

      // Объединяем данные вручную как в контроллере
      const stockData = (allProducts || []).map(product => {
        const stockInfo = (stockView || []).find(s => s.product_id === product.id);
        return {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          code: product.code,
          price: product.price,
          organization_id: product.organization_id,
          created_at: product.created_at,
          updated_at: product.updated_at,
          current_stock: stockInfo?.current_stock || 0,
          stock_status: stockInfo?.stock_status || 'Нет данных',
          locations_with_stock: stockInfo?.locations_with_stock || 0
        };
      });

      console.log(`✅ Fallback successful: ${stockData.length} products`);
      console.log('Первые 3 продукта с остатками:');
      stockData.slice(0, 3).forEach(product => {
        console.log(`  - ${product.product_name}: ${product.current_stock} (${product.stock_status})`);
      });

      var finalStockData = stockData;
    } else {
      console.log(`✅ JOIN successful: ${productsWithStock?.length || 0} products`);
      
      const joinStockData = (productsWithStock || []).map(item => ({
        product_id: item.id,
        product_name: item.name,
        sku: item.sku,
        code: item.code,
        price: item.price,
        organization_id: item.organization_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        current_stock: item.current_stock_view?.current_stock || 0,
        stock_status: 'JOIN данные',
        locations_with_stock: 1
      }));

      console.log('Первые 3 продукта через JOIN:');
      joinStockData.slice(0, 3).forEach(product => {
        console.log(`  - ${product.product_name}: ${product.current_stock}`);
      });

      var finalStockData = joinStockData;
    }

    console.log('\n3️⃣ ТЕСТИРОВАНИЕ stock_by_location_view:');
    
    const { data: locationStockData, error: locationError } = await supabaseAdmin
      .from('stock_by_location_view')
      .select('*')
      .eq('organization_id', organizationId)
      .limit(5);

    if (locationError) {
      console.error('❌ Location stock error:', locationError);
    } else {
      console.log(`✅ Location data: ${locationStockData?.length || 0} records`);
      if (locationStockData && locationStockData.length > 0) {
        console.log('Первые записи по локациям:');
        locationStockData.slice(0, 3).forEach(loc => {
          console.log(`  - ${loc.product_name} в ${loc.location_name}: ${loc.stock}`);
        });
      }
    }

    console.log('\n4️⃣ ФОРМАТИРОВАНИЕ КАК В КОНТРОЛЛЕРЕ:');
    
    // Имитируем форматирование как в контроллере
    const formattedProducts = finalStockData.slice(0, 3).map((item) => {
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

    console.log('\n5️⃣ ФИНАЛЬНЫЙ РЕЗУЛЬТАТ (как получит frontend):');
    const apiResponse = {
      data: formattedProducts,
      pagination: {
        page: 1,
        limit: 100,
        total: finalStockData.length
      }
    };

    console.log(JSON.stringify(apiResponse, null, 2));

    console.log('\n6️⃣ АНАЛИЗ ОСТАТКОВ:');
    const hasStockData = formattedProducts.some(p => p.current_stock > 0);
    const hasLocationData = formattedProducts.some(p => p.stock_by_location.length > 0);
    
    if (hasStockData) {
      console.log('✅ Есть данные по общим остаткам');
    } else {
      console.log('❌ НЕТ данных по общим остаткам');
    }
    
    if (hasLocationData) {
      console.log('✅ Есть данные по локациям');
    } else {
      console.log('❌ НЕТ данных по локациям');
    }

    console.log('\n🎯 ВЫВОД:');
    if (hasStockData && hasLocationData) {
      console.log('✅ API исправлен! Frontend получит данные с остатками.');
    } else if (hasStockData) {
      console.log('⚠️ Общие остатки есть, но нет детализации по локациям.');
    } else {
      console.log('❌ Остатков всё ещё нет - нужна дополнительная диагностика.');
    }
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск тестирования исправленного API...');
testFixedAPI(); 