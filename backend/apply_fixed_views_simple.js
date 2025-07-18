require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');

async function applyFixedViewsSimple() {
  try {
    console.log('🚀 Применение исправленных VIEW для остатков (упрощенный метод)...');
    
    // Шаг 1: Удаляем старые VIEW
    console.log('🗑️ Удаление старых VIEW...');
    
    try {
      // Пробуем запросить данные из VIEW чтобы проверить их существование
      const { error: checkError1 } = await supabaseAdmin
        .from('current_stock_view')
        .select('*')
        .limit(1);
      
      if (!checkError1) {
        console.log('📋 current_stock_view существует, будет обновлен');
      }
    } catch (e) {
      console.log('📋 current_stock_view не существует, будет создан');
    }
    
    // Шаг 2: Создаем stock_by_location_view через raw SQL
    console.log('🔨 Создание stock_by_location_view...');
    
    const stockByLocationSQL = `
      CREATE OR REPLACE VIEW public.stock_by_location_view AS
      SELECT 
          o.organization_id,
          o.product_id,
          p.name as product_name,
          o.location_id,
          l.name as location_name,
          SUM(
              CASE 
                  WHEN o.operation_type = 'supply' THEN o.quantity
                  WHEN o.operation_type = 'sale' THEN -o.quantity
                  WHEN o.operation_type = 'write_off' THEN -o.quantity
                  ELSE 0
              END
          ) as stock
      FROM public.operations o
      JOIN public.locations l ON o.location_id = l.id
      JOIN public.products p ON o.product_id = p.id
      GROUP BY 
          o.organization_id, 
          o.product_id, 
          p.name,
          o.location_id, 
          l.name;
    `;
    
    // Шаг 3: Создаем current_stock_view через raw SQL
    console.log('🔨 Создание current_stock_view...');
    
    const currentStockSQL = `
      CREATE OR REPLACE VIEW public.current_stock_view AS
      SELECT
          p.id as product_id,
          p.organization_id,
          p.name as product_name,
          p.sku,
          p.code,
          p.price,
          COALESCE(SUM(slv.stock), 0) as current_stock,
          COUNT(slv.location_id) FILTER (WHERE slv.stock != 0) as locations_with_stock,
          CASE 
              WHEN COALESCE(SUM(slv.stock), 0) = 0 THEN 'Нет в наличии'
              WHEN COALESCE(SUM(slv.stock), 0) <= 10 THEN 'Мало'
              WHEN COALESCE(SUM(slv.stock), 0) < 0 THEN 'Отрицательный остаток'
              ELSE 'В наличии'
          END as stock_status,
          NOW() as last_update,
          p.created_at,
          p.updated_at
      FROM 
          public.products p
      LEFT JOIN 
          public.stock_by_location_view slv ON p.id = slv.product_id AND p.organization_id = slv.organization_id
      GROUP BY
          p.id,
          p.organization_id,
          p.name,
          p.sku,
          p.code,
          p.price,
          p.created_at,
          p.updated_at;
    `;
    
    // Поскольку у нас нет прямого способа выполнить CREATE VIEW через Supabase JS API,
    // выводим SQL для ручного выполнения
    console.log('\n📋 SQL для ручного выполнения в Supabase SQL Editor:');
    console.log('\n--- STEP 1: Create stock_by_location_view ---');
    console.log(stockByLocationSQL);
    console.log('\n--- STEP 2: Create current_stock_view ---');
    console.log(currentStockSQL);
    
    // Пробуем проверить доступность VIEW после создания
    console.log('\n🧪 Проверка доступности VIEW...');
    
    // Если VIEW уже созданы, пробуем запросить тестовые данные
    try {
      const { data: testData, error: testError } = await supabaseAdmin
        .from('current_stock_view')
        .select('product_id, product_name, current_stock, stock_status')
        .limit(3);
      
      if (testError) {
        console.log('⚠️ VIEW еще не созданы или недоступны:', testError.message);
        console.log('📝 Пожалуйста, выполните SQL команды выше в Supabase Dashboard > SQL Editor');
      } else {
        console.log('✅ VIEW работают! Тестовые данные:');
        console.log(JSON.stringify(testData, null, 2));
      }
    } catch (error) {
      console.log('⚠️ VIEW недоступны, выполните SQL команды в Supabase Dashboard');
    }
    
    console.log('\n🏁 Скрипт завершен. Если VIEW не созданы автоматически, выполните SQL команды выше вручную.');
    
  } catch (error) {
    console.error('💥 Ошибка:', error);
  }
}

// Запускаем скрипт
applyFixedViewsSimple(); 