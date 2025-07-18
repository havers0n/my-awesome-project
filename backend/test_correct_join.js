require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function testCorrectJoin() {
  try {
    console.log('🧪 ТЕСТИРОВАНИЕ ПРАВИЛЬНОГО JOIN С VIEW');
    console.log('='.repeat(60));
    
    const organizationId = 1;
    
    console.log(`📊 Тестируем правильный JOIN синтаксис для organization_id: ${organizationId}`);
    
    // Тестируем правильный синтаксис JOIN как предложил пользователь
    console.log('\n1️⃣ ПРАВИЛЬНЫЙ JOIN: products с current_stock_view(*)');
    const { data: productsWithStock, error: joinError } = await supabaseAdmin
      .from('products')
      .select('*, current_stock_view(*)')
      .eq('organization_id', organizationId)
      .order('name')
      .limit(5);

    if (joinError) {
      console.error('❌ JOIN не работает:', joinError);
      console.log('\n🔧 ВОЗМОЖНЫЕ ПРИЧИНЫ:');
      console.log('1. Нет foreign key связи между products и current_stock_view');
      console.log('2. VIEW current_stock_view не существует');
      console.log('3. Неправильный синтаксис для VIEW (нужны таблицы, не VIEW)');
      
      console.log('\n2️⃣ АЛЬТЕРНАТИВНЫЙ СИНТАКСИС: без (*) ');
      const { data: altData, error: altError } = await supabaseAdmin
        .from('products')
        .select('*, current_stock_view!inner(current_stock, stock_status)')
        .eq('organization_id', organizationId)
        .limit(3);
      
      if (altError) {
        console.error('❌ Альтернативный синтаксис тоже не работает:', altError);
      } else {
        console.log('✅ Альтернативный синтаксис работает!');
        console.log('Пример данных:', JSON.stringify(altData?.[0], null, 2));
      }
      
      return;
    }

    console.log(`✅ JOIN работает! Получено ${productsWithStock?.length || 0} продуктов`);
    
    if (!productsWithStock || productsWithStock.length === 0) {
      console.log('⚠️ JOIN работает, но данных нет');
      return;
    }

    // Анализируем структуру данных
    console.log('\n📦 АНАЛИЗ СТРУКТУРЫ ДАННЫХ:');
    const firstProduct = productsWithStock[0];
    console.log('Структура первого продукта:');
    console.log(JSON.stringify(firstProduct, null, 2));

    // Проверяем как выглядит current_stock_view в ответе
    console.log('\n🔍 АНАЛИЗ current_stock_view:');
    if (firstProduct.current_stock_view) {
      console.log('✅ current_stock_view присутствует');
      console.log('Содержимое:', JSON.stringify(firstProduct.current_stock_view, null, 2));
    } else {
      console.log('❌ current_stock_view отсутствует или null');
    }

    // Тестируем преобразование как в контроллере
    console.log('\n🔧 ПРЕОБРАЗОВАНИЕ КАК В КОНТРОЛЛЕРЕ:');
    
    const transformedData = productsWithStock.map(item => {
      const stockView = item.current_stock_view;
      
      return {
        product_id: item.id,
        product_name: item.name,
        sku: item.sku,
        code: item.code,
        price: item.price,
        current_stock: Number(stockView?.current_stock) || 0,
        stock_status: stockView?.stock_status || 'Нет данных',
        locations_with_stock: Number(stockView?.locations_with_stock) || 0
      };
    });

    console.log('Первые 2 преобразованных продукта:');
    transformedData.slice(0, 2).forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.product_name}`);
      console.log(`   - Остаток: ${product.current_stock}`);
      console.log(`   - Статус: ${product.stock_status}`);
      console.log(`   - Локаций: ${product.locations_with_stock}`);
    });

    // Проверяем наличие реальных остатков
    const hasStockData = transformedData.some(p => p.current_stock > 0);
    const totalStock = transformedData.reduce((sum, p) => sum + p.current_stock, 0);
    
    console.log('\n📊 ИТОГОВЫЙ АНАЛИЗ:');
    console.log(`Общий остаток: ${totalStock}`);
    console.log(`Товаров с остатками > 0: ${transformedData.filter(p => p.current_stock > 0).length}`);

    if (hasStockData) {
      console.log('✅ СТАНДАРТНЫЙ JOIN РАБОТАЕТ! Есть реальные остатки.');
      console.log('✅ Можно использовать в контроллере без RPC функций.');
    } else {
      console.log('⚠️ JOIN работает, но остатки равны нулю.');
      console.log('⚠️ Проверьте данные в current_stock_view.');
    }

    console.log('\n🎯 ФИНАЛЬНЫЙ ВЫВОД:');
    if (hasStockData) {
      console.log('🎉 СТАНДАРТНЫЙ SUPABASE JOIN РЕШАЕТ ЗАДАЧУ!');
      console.log('🎉 RPC функция НЕ НУЖНА - можно использовать простой JOIN.');
    } else {
      console.log('⚠️ JOIN работает технически, но нужно проверить данные.');
    }
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск тестирования правильного JOIN...');
testCorrectJoin(); 