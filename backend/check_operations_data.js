const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://iumfkjvlkqzfgacsckmy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1bWZranZsa3F6ZmdhY3Nja215Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDE3MDMxNCwiZXhwIjoyMDQ5NzQ2MzE0fQ.vZKlTuBqMj-Vx7X4dCO6E9GjvQ6sSEBsH7vwhpFU-_M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOperationsData() {
  console.log('🔍 ПРОВЕРКА ДАННЫХ В ТАБЛИЦЕ OPERATIONS');
  
  try {
    // 1. Проверяем структуру таблицы operations
    console.log('\n1️⃣ Структура таблицы operations:');
    const { data: operations, error: opsError } = await supabase
      .from('operations')
      .select('*')
      .limit(3);
    
    if (opsError) {
      console.log('❌ Ошибка запроса operations:', opsError);
      return;
    }
    
    console.log(`✅ Найдено операций: ${operations?.length || 0}`);
    if (operations && operations.length > 0) {
      console.log('📊 Структура первой операции:');
      console.log(Object.keys(operations[0]));
      console.log('📋 Первая операция:', operations[0]);
    }
    
    // 2. Проверяем операции с JOIN к связанным таблицам
    console.log('\n2️⃣ Операции с JOIN к locations и suppliers:');
    const { data: operationsWithJoin, error: joinError } = await supabase
      .from('operations')
      .select(`
        id,
        operation_type,
        operation_date,
        quantity,
        total_amount,
        cost_price,
        product_id,
        location_id,
        supplier_id,
        locations(id, name),
        suppliers(id, name),
        products(id, name)
      `)
      .limit(5);
    
    if (joinError) {
      console.log('❌ Ошибка JOIN запроса:', joinError);
    } else {
      console.log(`✅ Операции с JOIN: ${operationsWithJoin?.length || 0}`);
      if (operationsWithJoin && operationsWithJoin.length > 0) {
        console.log('📋 Первая операция с JOIN:', operationsWithJoin[0]);
      }
    }
    
    // 3. Проверяем операции для конкретного товара (например, product_id = 64)
    console.log('\n3️⃣ Операции для товара с ID 64:');
    const { data: productOps, error: prodOpsError } = await supabase
      .from('operations')
      .select(`
        id,
        operation_type,
        operation_date,
        quantity,
        total_amount,
        cost_price,
        locations(id, name),
        suppliers(id, name)
      `)
      .eq('product_id', 64)
      .order('operation_date', { ascending: false })
      .limit(10);
    
    if (prodOpsError) {
      console.log('❌ Ошибка запроса операций товара:', prodOpsError);
    } else {
      console.log(`✅ Операций для товара 64: ${productOps?.length || 0}`);
      if (productOps && productOps.length > 0) {
        console.log('📋 Операции товара 64:');
        productOps.forEach((op, index) => {
          console.log(`  ${index + 1}. ${op.operation_type} - ${op.quantity} шт. (${op.operation_date})`);
          if (op.locations) console.log(`     Локация: ${op.locations.name}`);
          if (op.suppliers) console.log(`     Поставщик: ${op.suppliers.name}`);
        });
      }
    }
    
    // 4. Статистика операций
    console.log('\n4️⃣ Статистика операций:');
    const { count: totalOps } = await supabase
      .from('operations')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Общее количество операций: ${totalOps || 0}`);
    
    // Статистика по типам операций
    const { data: typeStats, error: typeError } = await supabase
      .from('operations')
      .select('operation_type')
      .order('operation_type');
    
    if (!typeError && typeStats) {
      const typeCounts = typeStats.reduce((acc, op) => {
        acc[op.operation_type] = (acc[op.operation_type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 Статистика по типам операций:');
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    }
    
    // 5. Проверяем есть ли связи с products, locations, suppliers
    console.log('\n5️⃣ Проверка связей:');
    
    const { data: productsCheck } = await supabase
      .from('products')
      .select('id, name')
      .limit(3);
    console.log(`📦 Товаров в базе: ${productsCheck?.length || 0}`);
    
    const { data: locationsCheck } = await supabase
      .from('locations')
      .select('id, name')
      .limit(3);
    console.log(`📍 Локаций в базе: ${locationsCheck?.length || 0}`);
    
    const { data: suppliersCheck } = await supabase
      .from('suppliers')
      .select('id, name')
      .limit(3);
    console.log(`🚚 Поставщиков в базе: ${suppliersCheck?.length || 0}`);
    
  } catch (error) {
    console.error('💥 Общая ошибка:', error);
  }
}

checkOperationsData().catch(console.error); 