const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Конфигурация Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY не настроены в .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('🔍 Проверяем существующих пользователей...');
    
    // Получаем список пользователей
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, role, organization_id')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Ошибка при получении пользователей:', usersError);
      return;
    }
    
    console.log(`📋 Найдено пользователей: ${users?.length || 0}`);
    if (users && users.length > 0) {
      console.log('Список пользователей:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.full_name || 'Без имени'}) - ${user.role || 'Без роли'}`);
      });
    }
    
    // Проверяем, есть ли тестовый пользователь
    const testUser = users?.find(u => u.email === 'test@example.com');
    
    if (testUser) {
      console.log('✅ Тестовый пользователь уже существует:', testUser.email);
      return;
    }
    
    console.log('🔧 Создаем тестового пользователя...');
    
    // Создаем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Тестовый Пользователь'
      }
    });
    
    if (authError) {
      console.error('❌ Ошибка при создании пользователя в Auth:', authError);
      return;
    }
    
    console.log('✅ Пользователь создан в Auth:', authData.user.email);
    
    // Проверяем, есть ли организация
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1);
    
    let organizationId = 1;
    if (orgs && orgs.length > 0) {
      organizationId = orgs[0].id;
      console.log('📋 Используем существующую организацию:', orgs[0].name);
    } else {
      console.log('🔧 Создаем тестовую организацию...');
      const { data: newOrg, error: newOrgError } = await supabase
        .from('organizations')
        .insert({
          id: 1,
          name: 'Тестовая Компания ООО',
          inn_or_ogrn: '1234567890',
          status: 'active'
        })
        .select()
        .single();
      
      if (newOrgError) {
        console.error('❌ Ошибка при создании организации:', newOrgError);
        return;
      }
      
      organizationId = newOrg.id;
      console.log('✅ Организация создана:', newOrg.name);
    }
    
    // Добавляем пользователя в таблицу users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: 'Тестовый Пользователь',
        organization_id: organizationId,
        role: 'employee',
        is_active: true
      })
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Ошибка при добавлении пользователя в таблицу users:', userError);
      return;
    }
    
    console.log('✅ Тестовый пользователь создан успешно!');
    console.log('📋 Данные для входа:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Пароль: test123456`);
    console.log(`   Роль: ${userData.role}`);
    console.log(`   Организация: ${organizationId}`);
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

// Запускаем скрипт
createTestUser(); 