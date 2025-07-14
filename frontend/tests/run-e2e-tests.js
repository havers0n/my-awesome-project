#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Конфигурации для различных типов тестов
const testConfigs = {
  'all': {
    command: 'playwright test',
    description: 'Запуск всех E2E тестов'
  },
  'auth': {
    command: 'playwright test auth-flow.e2e.spec.ts',
    description: 'Тесты авторизации'
  },
  'forecast': {
    command: 'playwright test sales-forecast-flow.e2e.spec.ts',
    description: 'Тесты прогноза продаж'
  },
  'inventory': {
    command: 'playwright test out-of-stock.e2e.spec.ts',
    description: 'Тесты управления инвентарем'
  },
  'dashboard': {
    command: 'playwright test dashboards-reports.e2e.spec.ts',
    description: 'Тесты дашбордов и отчетов'
  },
  'export': {
    command: 'playwright test export-mobile.e2e.spec.ts --grep "Экспорт данных"',
    description: 'Тесты экспорта данных'
  },
  'mobile': {
    command: 'playwright test export-mobile.e2e.spec.ts --grep "Мобильная адаптивность"',
    description: 'Тесты мобильной адаптивности'
  },
  'performance': {
    command: 'playwright test performance.e2e.spec.ts',
    description: 'Тесты производительности'
  },
  'parallel': {
    command: 'playwright test --workers=4',
    description: 'Параллельный запуск всех тестов'
  },
  'headed': {
    command: 'playwright test --headed',
    description: 'Запуск тестов с отображением браузера'
  },
  'debug': {
    command: 'playwright test --debug',
    description: 'Запуск тестов в режиме отладки'
  },
  'chromium': {
    command: 'playwright test --project=chromium',
    description: 'Запуск тестов только в Chromium'
  },
  'firefox': {
    command: 'playwright test --project=firefox',
    description: 'Запуск тестов только в Firefox'
  },
  'webkit': {
    command: 'playwright test --project=webkit',
    description: 'Запуск тестов только в WebKit'
  },
  'mobile-devices': {
    command: 'playwright test --project="Mobile Chrome" --project="Mobile Safari"',
    description: 'Запуск тестов на мобильных устройствах'
  },
  'update-snapshots': {
    command: 'playwright test --update-snapshots',
    description: 'Обновление скриншотов'
  },
  'report': {
    command: 'playwright show-report',
    description: 'Показать последний отчет о тестировании'
  }
};

// Функция для запуска команды
async function runCommand(command) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Команда завершилась с кодом ${code}`));
      }
    });

    child.on('error', reject);
  });
}

// Функция для создания директорий для результатов
async function createResultDirectories() {
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/lighthouse',
    'test-results/responsive',
    'tests/.auth'
  ];

  for (const dir of dirs) {
    await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
  }
}

// Функция для очистки старых результатов
async function cleanOldResults() {
  const testResultsDir = path.join(process.cwd(), 'test-results');
  try {
    const files = await fs.readdir(testResultsDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней

    for (const file of files) {
      const filePath = path.join(testResultsDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Удален старый файл: ${file}`);
      }
    }
  } catch (error) {
    // Игнорируем ошибки, если директория не существует
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  console.log('🚀 E2E Test Runner');
  console.log('==================\n');

  // Показываем справку
  if (testType === 'help' || testType === '--help' || testType === '-h') {
    console.log('Использование: npm run e2e:[тип]\n');
    console.log('Доступные типы тестов:');
    for (const [key, config] of Object.entries(testConfigs)) {
      console.log(`  ${key.padEnd(20)} - ${config.description}`);
    }
    return;
  }

  // Проверяем, существует ли конфигурация
  if (!testConfigs[testType]) {
    console.error(`❌ Неизвестный тип теста: ${testType}`);
    console.log('\nИспользуйте "npm run e2e:help" для просмотра доступных опций');
    process.exit(1);
  }

  try {
    // Создаем необходимые директории
    await createResultDirectories();
    
    // Очищаем старые результаты
    await cleanOldResults();

    const config = testConfigs[testType];
    console.log(`📋 Запуск: ${config.description}`);
    console.log(`📝 Команда: ${config.command}\n`);

    // Запускаем тесты
    await runCommand(config.command);

    console.log('\n✅ Тесты успешно завершены!');
    
    // Предлагаем открыть отчет
    if (testType !== 'report') {
      console.log('\n💡 Для просмотра отчета выполните: npm run e2e:report');
    }
  } catch (error) {
    console.error('\n❌ Ошибка при выполнении тестов:', error.message);
    process.exit(1);
  }
}

// Запускаем основную функцию
main().catch(error => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
});
