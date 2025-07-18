require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');
const fs = require('fs');
const path = require('path');

async function applyFixedViews() {
  try {
    console.log('🚀 Применение исправленных VIEW для остатков...');
    
    // Читаем SQL скрипт
    const sqlPath = path.join(__dirname, '..', 'database', 'create_current_stock_view_FIXED.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📖 SQL скрипт загружен, размер:', sqlScript.length, 'символов');
    
    // Выполняем SQL через rpc вызов raw SQL
    console.log('⚡ Выполнение SQL скрипта...');
    
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: sqlScript
    });

    if (error) {
      console.error('❌ Ошибка выполнения SQL:', error);
      
      // Пробуем альтернативный способ - через прямой SQL запрос
      console.log('🔄 Пробую альтернативный способ выполнения...');
      
      // Разбиваем скрипт на отдельные команды
      const commands = sqlScript
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.toUpperCase().startsWith('--'));
      
      console.log(`📝 Найдено ${commands.length} SQL команд для выполнения`);
      
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command.toUpperCase() === 'BEGIN' || command.toUpperCase() === 'COMMIT') {
          console.log(`⏭️ Пропуск команды транзакции: ${command}`);
          continue;
        }
        
        console.log(`🔨 Выполнение команды ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`);
        
        const { error: cmdError } = await supabaseAdmin.rpc('exec_sql', {
          sql_query: command
        });
        
        if (cmdError) {
          console.error(`❌ Ошибка в команде ${i + 1}:`, cmdError);
          throw cmdError;
        }
      }
      
      console.log('✅ Все команды выполнены успешно через альтернативный метод');
    } else {
      console.log('✅ SQL скрипт выполнен успешно:', data);
    }
    
    // Проверяем что VIEW созданы
    console.log('🔍 Проверка созданных VIEW...');
    
    const { data: viewsCheck, error: viewsError } = await supabaseAdmin
      .from('information_schema.views')
      .select('table_name')
      .in('table_name', ['current_stock_view', 'stock_by_location_view']);
    
    if (viewsError) {
      console.error('⚠️ Не удалось проверить VIEW:', viewsError);
    } else {
      const foundViews = viewsCheck.map(v => v.table_name);
      console.log('📋 Найденные VIEW:', foundViews);
      
      if (foundViews.includes('current_stock_view') && foundViews.includes('stock_by_location_view')) {
        console.log('🎉 Оба VIEW успешно созданы!');
      } else {
        console.log('⚠️ Не все VIEW созданы. Найдены:', foundViews);
      }
    }
    
    // Пробуем запросить данные из current_stock_view
    console.log('🧪 Тестирование current_stock_view...');
    
    const { data: testData, error: testError } = await supabaseAdmin
      .from('current_stock_view')
      .select('*')
      .limit(3);
    
    if (testError) {
      console.error('❌ Ошибка при запросе к current_stock_view:', testError);
    } else {
      console.log('✅ Тестовые данные из current_stock_view:');
      console.log(JSON.stringify(testData, null, 2));
    }
    
    console.log('🏁 Готово! VIEW обновлены и готовы к использованию.');
    
  } catch (error) {
    console.error('💥 Фатальная ошибка:', error);
    process.exit(1);
  }
}

// Запускаем скрипт
applyFixedViews(); 