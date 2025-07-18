// Простой скрипт для проверки данных в БД
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkDatabase() {
  console.log('🔍 Проверяем подключение к базе данных...');
  
  // Создаем клиент supabase
  const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  console.log('Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'не найден');
  console.log('Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'не найден');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Переменные окружения Supabase не найдены');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Проверяем таблицу products
    console.log('\n📊 Проверяем таблицу products...');
    const { data: products, error, count } = await supabase
      .from('products')
      .select('id, name, sku, price, organization_id', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('❌ Ошибка запроса к БД:', error.message);
      return;
    }
    
    console.log(`✅ Найдено продуктов в БД: ${count}`);
    
    if (products && products.length > 0) {
      console.log('\n📋 Первые продукты:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (ID: ${product.id}, SKU: ${product.sku || 'нет'}, Цена: ${product.price || 0})`);
      });
    } else {
      console.log('⚠️ Продукты не найдены');
    }
    
    // Проверяем таблицу locations
    console.log('\n🏪 Проверяем таблицу locations...');
    const { data: locations, error: locError, count: locCount } = await supabase
      .from('locations')
      .select('id, name, type', { count: 'exact' })
      .limit(3);
    
    if (locError) {
      console.error('❌ Ошибка запроса к locations:', locError.message);
    } else {
      console.log(`✅ Найдено локаций в БД: ${locCount}`);
      if (locations && locations.length > 0) {
        locations.forEach((loc, index) => {
          console.log(`  ${index + 1}. ${loc.name} (ID: ${loc.id}, Тип: ${loc.type})`);
        });
      }
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error.message);
  }
}

checkDatabase(); 