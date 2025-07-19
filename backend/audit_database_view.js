require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function auditDatabaseView() {
  try {
    console.log('🔍 АУДИТ БАЗЫ ДАННЫХ: current_stock_view');
    console.log('='.repeat(60));
    
    const organizationId = 1;
    
    // Проверяем current_stock_view
    console.log('1️⃣ ПРОВЕРКА current_stock_view:');
    
    const { data: viewData, error: viewError } = await supabaseAdmin
      .from('current_stock_view')
      .select('*')
      .eq('organization_id', organizationId)
      .order('product_name')
      .limit(10);

    if (viewError) {
      console.error('❌ Ошибка при запросе current_stock_view:', viewError);
      return;
    }

    console.log(`✅ Получено ${viewData?.length || 0} записей из current_stock_view`);
    
    if (viewData && viewData.length > 0) {
      console.log('\n📦 ПЕРВЫЕ 5 ПРОДУКТОВ ИЗ VIEW:');
      viewData.slice(0, 5).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.product_name}`);
        console.log(`   Product ID: ${item.product_id}`);
        console.log(`   SKU: ${item.sku}`);
        console.log(`   Current Stock: ${item.current_stock} (тип: ${typeof item.current_stock})`);
        console.log(`   Stock Status: ${item.stock_status}`);
        console.log(`   Locations with Stock: ${item.locations_with_stock}`);
        console.log(`   Price: ${item.price}`);
        console.log(`   Organization ID: ${item.organization_id}`);
      });
      
      // Анализ остатков
      console.log('\n📊 АНАЛИЗ ОСТАТКОВ В VIEW:');
      const totalItems = viewData.length;
      const itemsWithStock = viewData.filter(item => item.current_stock && item.current_stock > 0);
      const itemsWithZeroStock = viewData.filter(item => !item.current_stock || item.current_stock === 0);
      const totalStock = viewData.reduce((sum, item) => sum + (Number(item.current_stock) || 0), 0);
      
      console.log(`Всего товаров в VIEW: ${totalItems}`);
      console.log(`Товаров с остатками > 0: ${itemsWithStock.length}`);
      console.log(`Товаров с нулевыми остатками: ${itemsWithZeroStock.length}`);
      console.log(`Общий остаток по всем товарам: ${totalStock}`);
      
      if (itemsWithStock.length > 0) {
        console.log('\n✅ ТОВАРЫ С НЕНУЛЕВЫМИ ОСТАТКАМИ:');
        itemsWithStock.forEach((item, index) => {
          console.log(`${index + 1}. ${item.product_name}: ${item.current_stock}`);
        });
      }
      
      // Проверяем структуру полей
      console.log('\n🔍 СТРУКТУРА ПОЛЕЙ В VIEW:');
      const firstItem = viewData[0];
      Object.keys(firstItem).forEach(key => {
        const value = firstItem[key];
        console.log(`${key}: ${typeof value} = ${value}`);
      });
      
    } else {
      console.log('❌ current_stock_view пуст или не содержит данных для organization_id = 1');
    }
    
    // Проверяем исходную таблицу products
    console.log('\n2️⃣ ПРОВЕРКА ТАБЛИЦЫ products:');
    
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, organization_id')
      .eq('organization_id', organizationId)
      .limit(5);

    if (productsError) {
      console.error('❌ Ошибка при запросе products:', productsError);
    } else {
      console.log(`✅ Найдено ${productsData?.length || 0} продуктов в таблице products`);
      if (productsData && productsData.length > 0) {
        console.log('Первые продукты:');
        productsData.forEach((product, index) => {
          console.log(`${index + 1}. ID: ${product.id}, Name: ${product.name}`);
        });
      }
    }
    
    // Проверяем таблицу operations
    console.log('\n3️⃣ ПРОВЕРКА ТАБЛИЦЫ operations:');
    
    const { data: operationsData, error: operationsError } = await supabaseAdmin
      .from('operations')
      .select('id, product_id, operation_type, quantity, organization_id')
      .eq('organization_id', organizationId)
      .limit(10);

    if (operationsError) {
      console.error('❌ Ошибка при запросе operations:', operationsError);
    } else {
      console.log(`✅ Найдено ${operationsData?.length || 0} операций в таблице operations`);
      if (operationsData && operationsData.length > 0) {
        console.log('Первые операции:');
        operationsData.forEach((op, index) => {
          console.log(`${index + 1}. Product: ${op.product_id}, Type: ${op.operation_type}, Qty: ${op.quantity}`);
        });
        
        // Анализ типов операций
        const operationTypes = [...new Set(operationsData.map(op => op.operation_type))];
        console.log('Найденные типы операций:', operationTypes.join(', '));
      }
    }
    
    console.log('\n🎯 ДИАГНОСТИКА:');
    
    if (viewData && viewData.length > 0) {
      const hasRealStock = viewData.some(item => item.current_stock && item.current_stock > 0);
      if (hasRealStock) {
        console.log('✅ current_stock_view содержит товары с реальными остатками');
        console.log('➡️ Проблема НЕ в базе данных');
        console.log('➡️ Нужно проверить backend контроллер');
      } else {
        console.log('❌ current_stock_view содержит только нулевые остатки');
        console.log('➡️ Проблема в логике VIEW или данных operations');
        console.log('➡️ Возможно нет операций supply или неправильная логика подсчета');
      }
    } else {
      console.log('❌ current_stock_view пуст');
      console.log('➡️ VIEW не создан или нет данных для organization_id = 1');
    }
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск аудита базы данных...');
auditDatabaseView(); 