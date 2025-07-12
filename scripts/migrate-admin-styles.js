#!/usr/bin/env node

/**
 * Скрипт для автоматической миграции стилей админ-панели
 * Заменяет старые Tailwind классы на новые admin-* классы
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Карта замен старых классов на новые
const styleReplacements = {
  // Кнопки
  'bg-blue-600 text-white': 'admin-btn admin-btn-primary',
  'bg-blue-700': 'admin-btn-primary:hover',
  'hover:bg-blue-700': '',
  'bg-white text-gray-700 border border-gray-200': 'admin-btn admin-btn-secondary',
  'hover:bg-gray-50': '',
  'bg-red-600 text-white': 'admin-btn admin-btn-danger',
  'hover:bg-red-700': '',
  
  // Карточки
  'bg-white rounded-lg shadow-xl': 'admin-card',
  'bg-white rounded-lg shadow-lg': 'admin-card',
  'bg-white rounded-lg shadow': 'admin-card',
  
  // Формы
  'block w-full px-3 py-2 border border-gray-300 rounded-md': 'admin-input',
  'block text-sm font-medium text-gray-700': 'admin-label',
  'w-full px-3 py-2 border border-gray-300 rounded-md': 'admin-select',
  
  // Таблицы
  'min-w-full divide-y divide-gray-200': 'admin-table',
  'px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider': 'admin-table th',
  'px-6 py-4 whitespace-nowrap text-sm text-gray-900': 'admin-table td',
  
  // Модальные окна
  'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full': 'admin-modal-overlay',
  'relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white': 'admin-modal',
  
  // Навигация
  'flex items-center px-4 py-2 text-sm font-medium rounded-md': 'admin-nav-item',
  'bg-blue-100 text-blue-700': 'admin-nav-item active',
  'text-gray-700 hover:bg-gray-100': 'admin-nav-item',
  
  // Бейджи
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800': 'admin-badge admin-badge-success',
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800': 'admin-badge admin-badge-error',
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800': 'admin-badge admin-badge-warning',
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800': 'admin-badge admin-badge-neutral',
  
  // Отступы
  'mt-4': 'admin-mt-4',
  'mb-4': 'admin-mb-4',
  'ml-4': 'admin-ml-4',
  'mr-4': 'admin-mr-4',
  'p-4': 'admin-p-4',
  'p-6': 'admin-p-6',
  
  // Текст
  'text-xl font-semibold': 'admin-text-xl admin-font-semibold',
  'text-sm text-gray-500': 'admin-text-sm admin-text-gray-500',
  'text-gray-900': 'admin-text-gray-900',
  'font-medium': 'admin-font-medium',
  'font-semibold': 'admin-font-semibold',
  'font-bold': 'admin-font-bold',
  
  // Контейнеры
  'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': 'admin-container',
  'w-full px-4': 'admin-container-fluid'
};

// Специальные замены для React компонентов
const componentReplacements = {
  'className="bg-blue-600 text-white shadow-lg"': 'className="admin-nav"',
  'className="flex items-center justify-between h-16"': 'className="admin-nav"',
  'className="font-semibold text-xl"': 'className="admin-text-xl admin-font-semibold"',
  'className="flex space-x-2"': 'className="flex gap-2"'
};

function migrateFile(filePath) {
  console.log(`🔄 Обрабатываю файл: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Применяем замены стилей
  Object.entries(styleReplacements).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.includes(oldClass)) {
      content = content.replace(regex, newClass);
      hasChanges = true;
      console.log(`   ✅ Заменил: "${oldClass}" → "${newClass}"`);
    }
  });
  
  // Применяем замены компонентов
  Object.entries(componentReplacements).forEach(([oldPattern, newPattern]) => {
    if (content.includes(oldPattern)) {
      content = content.replace(new RegExp(oldPattern, 'g'), newPattern);
      hasChanges = true;
      console.log(`   ✅ Заменил компонент: "${oldPattern}" → "${newPattern}"`);
    }
  });
  
  // Удаляем дублирующиеся классы
  content = content.replace(/className="([^"]*?)"/g, (match, classes) => {
    const classArray = classes.split(' ').filter(Boolean);
    const uniqueClasses = [...new Set(classArray)];
    return `className="${uniqueClasses.join(' ')}"`;
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`   💾 Файл обновлен`);
  } else {
    console.log(`   ⏭️  Изменений не требуется`);
  }
  
  return hasChanges;
}

function processDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  console.log(`📁 Обрабатываю директорию: ${dir}`);
  
  const files = fs.readdirSync(dir);
  let totalChanges = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Пропускаем node_modules и другие служебные папки
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        totalChanges += processDirectory(filePath, extensions);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      if (migrateFile(filePath)) {
        totalChanges++;
      }
    }
  });
  
  return totalChanges;
}

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup-${timestamp}`;
  
  console.log(`💾 Создаю резервную копию в ${backupDir}`);
  
  try {
    execSync(`cp -r frontend ${backupDir}`, { stdio: 'inherit' });
    console.log(`✅ Резервная копия создана`);
    return backupDir;
  } catch (error) {
    console.error(`❌ Ошибка создания резервной копии: ${error.message}`);
    return null;
  }
}

function validateMigration() {
  console.log(`🔍 Проверяю результат миграции...`);
  
  const problematicPatterns = [
    'bg-blue-600',
    'bg-blue-700',
    'hover:bg-blue-700',
    'text-white shadow-lg',
    'flex items-center justify-between h-16'
  ];
  
  let issues = [];
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    problematicPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        issues.push({ file: filePath, pattern });
      }
    });
  }
  
  function checkDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !['node_modules', '.git'].includes(file)) {
        checkDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        checkFile(filePath);
      }
    });
  }
  
  checkDirectory('frontend/src');
  
  if (issues.length > 0) {
    console.log(`⚠️  Найдены потенциальные проблемы:`);
    issues.forEach(({ file, pattern }) => {
      console.log(`   - ${file}: "${pattern}"`);
    });
  } else {
    console.log(`✅ Миграция завершена успешно!`);
  }
  
  return issues.length === 0;
}

function main() {
  console.log('🚀 Начинаю миграцию стилей админ-панели...\n');
  
  // Проверяем, что мы в правильной директории
  if (!fs.existsSync('frontend/src')) {
    console.error('❌ Ошибка: Запустите скрипт из корневой директории проекта');
    process.exit(1);
  }
  
  // Создаем резервную копию
  const backupDir = createBackup();
  if (!backupDir) {
    console.error('❌ Не удалось создать резервную копию. Миграция отменена.');
    process.exit(1);
  }
  
  console.log('\n📝 Начинаю миграцию файлов...\n');
  
  // Обрабатываем админ-панель
  const adminPanelChanges = processDirectory('frontend/src/pages/Admin');
  const workedAdminChanges = fs.existsSync('workedadminpanel') 
    ? processDirectory('workedadminpanel') 
    : 0;
  
  const totalChanges = adminPanelChanges + workedAdminChanges;
  
  console.log(`\n📊 Статистика миграции:`);
  console.log(`   - Обработано файлов: ${totalChanges}`);
  console.log(`   - Админ-панель: ${adminPanelChanges} файлов`);
  console.log(`   - Workedadminpanel: ${workedAdminChanges} файлов`);
  
  // Проверяем результат
  console.log('\n🔍 Проверяю результат миграции...\n');
  const isValid = validateMigration();
  
  if (isValid) {
    console.log('\n🎉 Миграция завершена успешно!');
    console.log(`💾 Резервная копия сохранена в: ${backupDir}`);
    console.log('\n📋 Следующие шаги:');
    console.log('   1. Добавьте import для admin-design-tokens.css в index.css');
    console.log('   2. Проверьте работу админ-панели в браузере');
    console.log('   3. Запустите тесты');
    console.log('   4. Если все работает, удалите резервную копию');
  } else {
    console.log('\n⚠️  Миграция завершена с предупреждениями');
    console.log('   Проверьте указанные файлы и исправьте проблемы вручную');
  }
}

// Запускаем миграцию
if (require.main === module) {
  main();
}

module.exports = { migrateFile, processDirectory, styleReplacements }; 