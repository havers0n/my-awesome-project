const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://iumfkjvlkqzfgacsckmy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1bWZranZsa3F6ZmdhY3Nja215Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDE3MDMxNCwiZXhwIjoyMDQ5NzQ2MzE0fQ.vZKlTuBqMj-Vx7X4dCO6E9GjvQ6sSEBsH7vwhpFU-_M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOperations() {
  console.log('🔍 ТЕСТИРОВАНИЕ ОПЕРАЦИЙ ДЛЯ ТОВАРА 64');
  
  try {
    // Тест операций для товара 64 - такой же запрос как в контроллере
    const { data: operations, error } = await supabase
      .from('operations')
      .select(`
        id,
        operation_type,
        operation_date,
        quantity,
        total_amount,
        cost_price,
        shelf_price,
        stock_on_hand,
        delivery_delay_days,
        was_out_of_stock,
        created_at,
        locations (
          id,
          name
        ),
        suppliers (
          id,
          name
        )
      `)
      .eq('product_id', 64)
      .eq('organization_id', 1)
      .order('operation_date', { ascending: false })
      .limit(50);

    if (error) {
      console.log('❌ Ошибка запроса операций:', error);
      return;
    }

    console.log(`✅ Найдено операций для товара 64: ${operations?.length || 0}`);
    
    if (operations && operations.length > 0) {
      console.log('\n📋 Первые 5 операций:');
      operations.slice(0, 5).forEach((op, index) => {
        console.log(`${index + 1}. ${op.operation_type} - ${op.quantity} шт.`);
        console.log(`   Дата: ${op.operation_date}`);
        console.log(`   Локация: ${op.locations?.name || 'НЕТ ДАННЫХ'}`);
        console.log(`   Поставщик: ${op.suppliers?.name || 'НЕТ ДАННЫХ'}`);
        console.log(`   Сумма: ${op.total_amount || 'НЕТ ДАННЫХ'}`);
        console.log('   ---');
      });
      
      // Проверим структуру как в контроллере
      const formattedOperations = operations.map(op => ({
        id: op.id,
        type: op.operation_type,
        date: op.operation_date,
        quantity: op.quantity,
        totalAmount: op.total_amount,
        costPrice: op.cost_price,
        shelfPrice: op.shelf_price,
        stockOnHand: op.stock_on_hand,
        deliveryDelayDays: op.delivery_delay_days,
        wasOutOfStock: op.was_out_of_stock,
        location: op.locations ? {
          id: op.locations.id,
          name: op.locations.name
        } : null,
        supplier: op.suppliers ? {
          id: op.suppliers.id,
          name: op.suppliers.name
        } : null,
        createdAt: op.created_at
      }));
      
      console.log('\n🎯 Форматированные операции (как отправляются на frontend):');
      console.log(JSON.stringify({ 
        productId: 64,
        operations: formattedOperations.slice(0, 3),
        total: formattedOperations.length 
      }, null, 2));
      
    } else {
      console.log('\n⚠️ Операции не найдены для товара 64');
      
      // Проверим есть ли вообще операции для других товаров
      const { data: anyOps, error: anyError } = await supabase
        .from('operations')
        .select('product_id, operation_type, count(*)')
        .eq('organization_id', 1)
        .limit(10);
      
      if (!anyError && anyOps && anyOps.length > 0) {
        console.log('\n📊 Операции для других товаров:');
        anyOps.forEach(op => {
          console.log(`   Товар ${op.product_id}: ${op.operation_type}`);
        });
      } else {
        console.log('\n❌ Вообще нет операций для организации 1');
      }
    }
    
  } catch (error) {
    console.error('💥 Общая ошибка:', error);
  }
}

testOperations().catch(console.error); 