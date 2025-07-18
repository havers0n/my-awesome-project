require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function testFinalJoin() {
  try {
    console.log('🧪 ТЕСТИРОВАНИЕ ПРАВИЛЬНОГО JOIN СИНТАКСИСА');
    console.log('='.repeat(60));
    
    const organizationId = 1;
    
    console.log(`📊 Тестируем правильный JOIN для organization_id: ${organizationId}`);
    
    // Используем ТОЧНО тот синтаксис что предложил пользователь
    console.log('\n✅ ПРАВИЛЬНЫЙ SUPABASE JOIN:');
    console.log('products.select("*, current_stock_view(current_stock, stock_status, locations_with_stock)")');
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        current_stock_view ( current_stock, stock_status, locations_with_stock )
      `)
      .eq('organization_id', organizationId)
      .order('name')
      .limit(5);

    if (error) {
      console.error('❌ JOIN не работает:', error);
      console.log('\n🔧 ВОЗМОЖНЫЕ ПРИЧИНЫ:');
      console.log('1. VIEW current_stock_view не существует');
      console.log('2. Нет правильной связи между products и current_stock_view');
      console.log('3. Проблемы с правами доступа');
      return;
    }

    console.log(`✅ JOIN работает! Получено ${data?.length || 0} продуктов`);
    
    if (!data || data.length === 0) {
      console.log('⚠️ JOIN работает, но данных нет');
      return;
    }

    // Анализируем структуру данных
    console.log('\n📦 АНАЛИЗ СТРУКТУРЫ ДАННЫХ:');
    const firstProduct = data[0];
    console.log('Полная структура первого продукта:');
    console.log(JSON.stringify(firstProduct, null, 2));

    // Проверяем наличие current_stock_view
    console.log('\n🔍 АНАЛИЗ current_stock_view:');
    if (firstProduct.current_stock_view) {
      console.log('✅ current_stock_view присутствует в JOIN!');
      console.log('Содержимое current_stock_view:');
      console.log(JSON.stringify(firstProduct.current_stock_view, null, 2));
      
      // Проверяем значения
      const stockView = firstProduct.current_stock_view;
      if (stockView.current_stock && stockView.current_stock > 0) {
        console.log(`✅ ЕСТЬ РЕАЛЬНЫЕ ОСТАТКИ: ${stockView.current_stock}`);
      } else {
        console.log(`⚠️ Остаток равен: ${stockView.current_stock}`);
      }
    } else {
      console.log('❌ current_stock_view отсутствует или null');
    }

    // Тестируем преобразование как в контроллере
    console.log('\n🔧 ПРЕОБРАЗОВАНИЕ КАК В КОНТРОЛЛЕРЕ:');
    
    const transformedData = data.map(item => {
      const stockView = item.current_stock_view;
      
      return {
        product_id: item.id,
        product_name: item.name,
        sku: item.sku,
        code: item.code,
        price: Number(item.price) || 0,
        current_stock: Number(stockView?.current_stock) || 0,
        stock_status: stockView?.stock_status || 'Нет данных',
        locations_with_stock: Number(stockView?.locations_with_stock) || 0
      };
    });

    console.log('Преобразованные данные:');
    transformedData.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.product_name}`);
      console.log(`   - ID: ${product.product_id}`);
      console.log(`   - Остаток: ${product.current_stock}`);
      console.log(`   - Статус: ${product.stock_status}`);
      console.log(`   - Локаций: ${product.locations_with_stock}`);
    });

    // Проверяем наличие реальных остатков
    const hasStockData = transformedData.some(p => p.current_stock > 0);
    const totalStock = transformedData.reduce((sum, p) => sum + p.current_stock, 0);
    
    console.log('\n📊 ИТОГОВЫЙ АНАЛИЗ:');
    console.log(`Общий остаток по всем товарам: ${totalStock}`);
    console.log(`Товаров с остатками > 0: ${transformedData.filter(p => p.current_stock > 0).length}`);
    console.log(`Товаров с нулевыми остатками: ${transformedData.filter(p => p.current_stock === 0).length}`);

    console.log('\n🎯 ФИНАЛЬНЫЙ ВЫВОД:');
    if (hasStockData) {
      console.log('🎉 ПРАВИЛЬНЫЙ JOIN РАБОТАЕТ!');
      console.log('🎉 Есть реальные остатки через JOIN с current_stock_view!');
      console.log('🎉 Контроллер должен работать с этим синтаксисом!');
    } else {
      console.log('⚠️ JOIN работает, но все остатки равны нулю');
      console.log('⚠️ Нужно проверить данные в current_stock_view');
    }

    console.log('\n🚀 СЛЕДУЮЩИЙ ШАГ:');
    console.log('Перезапустить backend и тестировать /api/inventory/products');
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск тестирования правильного JOIN синтаксиса...');
testFinalJoin(); 