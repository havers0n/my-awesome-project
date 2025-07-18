require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function testRPCFunction() {
  try {
    console.log('🧪 ТЕСТИРОВАНИЕ RPC ФУНКЦИИ get_products_with_stock');
    console.log('='.repeat(60));
    
    const organizationId = 1;
    
    console.log(`📊 Вызов RPC функции для organization_id: ${organizationId}`);
    
    // Тестируем RPC функцию
    const { data: rpcResult, error: rpcError } = await supabaseAdmin
      .rpc('get_products_with_stock', { org_id: organizationId });

    if (rpcError) {
      console.error('❌ RPC функция не работает:', rpcError);
      console.log('\n🔧 ИНСТРУКЦИЯ ПО СОЗДАНИЮ RPC ФУНКЦИИ:');
      console.log('1. Откройте Supabase Dashboard > SQL Editor');
      console.log('2. Выполните SQL из файла: create_get_products_function.sql');
      console.log('3. Перезапустите этот тест');
      return;
    }

    console.log(`✅ RPC функция работает! Получено ${rpcResult?.length || 0} продуктов`);
    
    if (!rpcResult || rpcResult.length === 0) {
      console.log('⚠️ RPC функция вернула пустой результат');
      return;
    }

    // Анализируем первые 3 продукта
    console.log('\n📦 ПЕРВЫЕ 3 ПРОДУКТА ИЗ RPC:');
    rpcResult.slice(0, 3).forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.product_name}`);
      console.log(`   - ID: ${product.product_id}`);
      console.log(`   - SKU: ${product.sku}`);
      console.log(`   - Остаток: ${product.current_stock}`);
      console.log(`   - Статус: ${product.stock_status}`);
      console.log(`   - Локаций: ${product.locations_with_stock}`);
    });

    // Проверяем наличие реальных остатков
    const hasStockData = rpcResult.some(p => Number(p.current_stock) > 0);
    const totalStock = rpcResult.reduce((sum, p) => sum + Number(p.current_stock || 0), 0);
    
    console.log('\n📊 АНАЛИЗ ОСТАТКОВ:');
    console.log(`Общий остаток по всем товарам: ${totalStock}`);
    console.log(`Товаров с остатками > 0: ${rpcResult.filter(p => Number(p.current_stock) > 0).length}`);
    console.log(`Товаров с отрицательными остатками: ${rpcResult.filter(p => Number(p.current_stock) < 0).length}`);

    if (hasStockData) {
      console.log('✅ ЕСТЬ РЕАЛЬНЫЕ ОСТАТКИ - RPC функция работает правильно!');
    } else {
      console.log('❌ НЕТ ОСТАТКОВ - проблема в данных или VIEW');
    }

    // Тестируем формат как в контроллере
    console.log('\n🔧 ТЕСТИРОВАНИЕ ФОРМАТА КАК В КОНТРОЛЛЕРЕ:');
    
    const formattedForController = rpcResult.slice(0, 2).map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      code: item.code,
      price: Number(item.price) || 0,
      current_stock: Number(item.current_stock) || 0,
      stock_status: item.stock_status || 'Нет данных',
      locations_with_stock: Number(item.locations_with_stock) || 0,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    console.log('Форматированные данные для контроллера:');
    console.log(JSON.stringify(formattedForController, null, 2));

    console.log('\n🎯 ВЫВОДЫ:');
    if (hasStockData) {
      console.log('✅ RPC функция готова к использованию в контроллере');
      console.log('✅ Данные возвращаются в правильном формате');
      console.log('✅ Остатки реальные и ненулевые');
      console.log('\n🚀 СЛЕДУЮЩИЙ ШАГ: Перезапустить backend и тестировать API');
    } else {
      console.log('⚠️ RPC функция работает, но нет данных по остаткам');
      console.log('⚠️ Проверьте VIEW current_stock_view в базе данных');
    }
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск тестирования RPC функции...');
testRPCFunction(); 