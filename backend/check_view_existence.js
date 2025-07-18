require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function checkViewExistence() {
  try {
    console.log('🔍 ПРОВЕРКА СУЩЕСТВОВАНИЯ VIEW current_stock_view');
    console.log('='.repeat(60));
    
    // Проверяем существование VIEW через прямой запрос
    console.log('1️⃣ Проверяем существование current_stock_view...');
    
    const { data: viewData, error: viewError } = await supabaseAdmin
      .from('current_stock_view')
      .select('*')
      .limit(3);

    if (viewError) {
      console.error('❌ VIEW current_stock_view НЕ СУЩЕСТВУЕТ:', viewError);
      console.log('\n🔧 РЕШЕНИЕ:');
      console.log('1. Откройте Supabase Dashboard > SQL Editor');
      console.log('2. Выполните SQL из файла: database/create_current_stock_view_FIXED.sql');
      console.log('3. Или выполните SQL из файла: database/CORRECT_current_stock_view.sql');
      
      // Проверяем альтернативные VIEW
      console.log('\n2️⃣ Проверяем альтернативные VIEW...');
      
      const { data: altData, error: altError } = await supabaseAdmin
        .from('stock_by_location_view')
        .select('*')
        .limit(1);
      
      if (altError) {
        console.error('❌ stock_by_location_view тоже не существует:', altError);
      } else {
        console.log('✅ stock_by_location_view существует!');
      }
      
      return;
    }

    console.log(`✅ VIEW current_stock_view существует! Найдено ${viewData?.length || 0} записей`);
    
    if (viewData && viewData.length > 0) {
      console.log('\n📦 ДАННЫЕ ИЗ current_stock_view:');
      viewData.forEach((row, index) => {
        console.log(`${index + 1}. Product ID: ${row.product_id}, Stock: ${row.current_stock}, Status: ${row.stock_status}`);
      });
    }

    // Проверяем структуру VIEW
    console.log('\n3️⃣ Проверяем структуру current_stock_view...');
    
    const { data: structureData, error: structureError } = await supabaseAdmin
      .from('current_stock_view')
      .select('*')
      .eq('organization_id', 1)
      .limit(1);

    if (structureError) {
      console.error('❌ Ошибка получения структуры:', structureError);
    } else if (structureData && structureData.length > 0) {
      console.log('✅ Структура VIEW:');
      console.log(JSON.stringify(structureData[0], null, 2));
    }

    // Проверяем таблицу products
    console.log('\n4️⃣ Проверяем таблицу products...');
    
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, organization_id')
      .eq('organization_id', 1)
      .limit(3);

    if (productsError) {
      console.error('❌ Таблица products недоступна:', productsError);
    } else {
      console.log(`✅ Таблица products доступна! Найдено ${productsData?.length || 0} записей`);
      if (productsData && productsData.length > 0) {
        console.log('Первые продукты:');
        productsData.forEach((product, index) => {
          console.log(`${index + 1}. ID: ${product.id}, Name: ${product.name}`);
        });
      }
    }

    console.log('\n🔧 ПРОБЛЕМА С JOIN:');
    console.log('VIEW current_stock_view существует, но Supabase не может делать автоматический JOIN');
    console.log('Причина: нет foreign key связи между products и current_stock_view');
    
    console.log('\n💡 ВОЗМОЖНЫЕ РЕШЕНИЯ:');
    console.log('1. Создать foreign key связь (сложно для VIEW)');
    console.log('2. Использовать RPC функцию (как мы делали ранее)');
    console.log('3. Использовать manual join как в Promise.all подходе');
    console.log('4. Проверить, можно ли добавить foreign key constraint в VIEW');
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск проверки существования VIEW...');
checkViewExistence(); 