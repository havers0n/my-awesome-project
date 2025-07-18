require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function checkDatabaseStructure() {
  try {
    console.log('🔍 ПРОВЕРКА СТРУКТУРЫ БАЗЫ ДАННЫХ');
    console.log('='.repeat(50));

    // Проверяем основные таблицы
    console.log('\n1️⃣ ПРОВЕРКА ТАБЛИЦЫ PRODUCTS:');
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.error('❌ Таблица products недоступна:', productsError);
    } else {
      console.log(`✅ Найдено ${products?.length || 0} продуктов:`);
      products?.forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id}, ORG: ${p.organization_id})`);
      });
    }

    console.log('\n2️⃣ ПРОВЕРКА ТАБЛИЦЫ OPERATIONS:');
    const { data: operations, error: operationsError } = await supabaseAdmin
      .from('operations')
      .select('*')
      .limit(5);
    
    if (operationsError) {
      console.error('❌ Таблица operations недоступна:', operationsError);
    } else {
      console.log(`✅ Найдено ${operations?.length || 0} операций:`);
      operations?.forEach(op => {
        console.log(`   - ${op.operation_type}: ${op.quantity} (Product ID: ${op.product_id}, Loc: ${op.location_id})`);
      });
      
      // Анализ типов операций
      const operationTypes = [...new Set(operations?.map(op => op.operation_type))];
      console.log(`   Типы операций: ${operationTypes.join(', ')}`);
    }

    console.log('\n3️⃣ ПРОВЕРКА ТАБЛИЦЫ LOCATIONS:');
    const { data: locations, error: locationsError } = await supabaseAdmin
      .from('locations')
      .select('*')
      .limit(5);
    
    if (locationsError) {
      console.error('❌ Таблица locations недоступна:', locationsError);
    } else {
      console.log(`✅ Найдено ${locations?.length || 0} локаций:`);
      locations?.forEach(loc => {
        console.log(`   - ${loc.name} (ID: ${loc.id}, ORG: ${loc.organization_id})`);
      });
    }

    console.log('\n4️⃣ ПРОВЕРКА ВСЕХ VIEW:');
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('information_schema.views')
      .select('table_name, view_definition')
      .eq('table_schema', 'public')
      .like('table_name', '%stock%');
    
    if (viewsError) {
      console.error('❌ Не удалось получить список VIEW:', viewsError);
    } else {
      console.log(`✅ Найдено ${views?.length || 0} VIEW связанных с stock:`);
      views?.forEach(view => {
        console.log(`   - ${view.table_name}`);
      });
    }

    console.log('\n5️⃣ ПРОВЕРКА ДАННЫХ ДЛЯ ORGANIZATION_ID = 1:');
    
    // Проверяем есть ли продукты для организации 1
    const { data: orgProducts, error: orgProductsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('organization_id', 1);
    
    console.log(`📦 Продуктов для ORG 1: ${orgProducts?.length || 0}`);
    
    // Проверяем есть ли операции для организации 1
    const { data: orgOperations, error: orgOperationsError } = await supabaseAdmin
      .from('operations')
      .select('*')
      .eq('organization_id', 1);
    
    console.log(`📊 Операций для ORG 1: ${orgOperations?.length || 0}`);
    
    // Проверяем есть ли локации для организации 1
    const { data: orgLocations, error: orgLocationsError } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('organization_id', 1);
    
    console.log(`📍 Локаций для ORG 1: ${orgLocations?.length || 0}`);

    console.log('\n6️⃣ АНАЛИЗ ДАННЫХ:');
    
    if ((orgProducts?.length || 0) === 0) {
      console.log('⚠️ НЕТ ПРОДУКТОВ для organization_id = 1');
      console.log('   Решение: Добавить продукты или изменить organization_id в контроллере');
    }
    
    if ((orgOperations?.length || 0) === 0) {
      console.log('⚠️ НЕТ ОПЕРАЦИЙ для organization_id = 1');
      console.log('   Решение: Добавить операции или изменить organization_id в контроллере');
    }
    
    if ((orgLocations?.length || 0) === 0) {
      console.log('⚠️ НЕТ ЛОКАЦИЙ для organization_id = 1');
      console.log('   Решение: Добавить локации или изменить organization_id в контроллере');
    }

    // Проверяем какие organization_id реально есть
    const { data: existingOrgs, error: orgsError } = await supabaseAdmin
      .from('products')
      .select('organization_id')
      .limit(100);
    
    if (!orgsError && existingOrgs) {
      const uniqueOrgs = [...new Set(existingOrgs.map(p => p.organization_id))];
      console.log(`🏢 Существующие organization_id в продуктах: ${uniqueOrgs.join(', ')}`);
      
      if (uniqueOrgs.length > 0 && !uniqueOrgs.includes(1)) {
        console.log(`💡 РЕКОМЕНДАЦИЯ: Использовать organization_id = ${uniqueOrgs[0]} вместо 1`);
      }
    }

    console.log('\n7️⃣ РЕКОМЕНДАЦИИ:');
    console.log('1. Создать правильные VIEW из CRITICAL_VIEWS_ISSUE_FOUND.md');
    console.log('2. Убедиться что есть данные для используемой организации');
    console.log('3. Проверить типы операций (должны быть: supply, sale, write_off)');
    
  } catch (error) {
    console.error('💥 ОШИБКА:', error);
  }
}

console.log('Запуск проверки структуры базы данных...');
checkDatabaseStructure(); 