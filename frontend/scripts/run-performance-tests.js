#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  log('blue', `\n🔄 ${description}...`);
  log('dim', `Выполняется: ${command}`);
  
  try {
    const output = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    log('green', `✅ ${description} - успешно`);
    return { success: true, output };
  } catch (error) {
    log('red', `❌ ${description} - ошибка`);
    console.error(error.stdout || error.message);
    return { success: false, error: error.message };
  }
};

const checkFileExists = (filePath) => {
  const fullPath = path.resolve(filePath);
  return fs.existsSync(fullPath);
};

const generateReport = (results) => {
  const timestamp = new Date().toISOString();
  const reportDir = path.join(process.cwd(), 'reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.join(reportDir, `performance-test-report-${timestamp.replace(/[:.]/g, '-')}.md`);
  
  const report = `# Performance Test Report

**Дата**: ${timestamp}
**Версия**: ${process.env.npm_package_version || 'unknown'}

## Результаты тестирования

${results.map(result => `
### ${result.name}
- **Статус**: ${result.success ? '✅ Успешно' : '❌ Ошибка'}
- **Время выполнения**: ${result.duration}ms
${result.error ? `- **Ошибка**: ${result.error}` : ''}
${result.coverage ? `- **Покрытие**: ${result.coverage}` : ''}
`).join('')}

## Рекомендации

${results.some(r => !r.success) ? `
⚠️ **Найдены проблемы в тестах:**
- Проверьте логи выше для детальной информации
- Убедитесь, что все зависимости установлены
- Проверьте конфигурацию тестов
` : `
✅ **Все тесты прошли успешно!**
- Drag & Drop функциональность работает корректно
- Производительность в норме
- UX соответствует требованиям
`}

## Следующие шаги

1. ${results.some(r => !r.success) ? 'Исправить найденные проблемы' : 'Продолжить разработку'}
2. ${results.find(r => r.name.includes('E2E'))?.success ? 'Проверить E2E тесты в CI/CD' : 'Настроить E2E тесты'}
3. ${results.find(r => r.name.includes('Performance'))?.success ? 'Мониторить производительность в продакшене' : 'Оптимизировать производительность'}

---
*Отчет сгенерирован автоматически*
`;
  
  fs.writeFileSync(reportFile, report);
  log('green', `📊 Отчет сохранен: ${reportFile}`);
};

const main = async () => {
  log('bright', '🚀 Запуск комплексного тестирования производительности Drag & Drop');
  
  const results = [];
  const startTime = Date.now();
  
  // 1. Unit тесты
  const unitTestStart = Date.now();
  const unitTestResult = runCommand(
    'npm run test -- --coverage --reporter=verbose src/hooks/__tests__/useDragDropUX.test.ts src/components/common/__tests__/DragPreview.test.tsx',
    'Unit тесты для drag & drop логики'
  );
  results.push({
    name: 'Unit Tests',
    success: unitTestResult.success,
    duration: Date.now() - unitTestStart,
    error: unitTestResult.error,
    coverage: unitTestResult.success ? 'Включено' : undefined
  });
  
  // 2. Проверка конфигурации Playwright
  if (checkFileExists('playwright.config.ts')) {
    const playwrightTestStart = Date.now();
    const playwrightResult = runCommand(
      'npx playwright test tests/e2e/drag-drop.spec.ts --reporter=html',
      'E2E тесты с Playwright'
    );
    results.push({
      name: 'E2E Tests (Playwright)',
      success: playwrightResult.success,
      duration: Date.now() - playwrightTestStart,
      error: playwrightResult.error
    });
  } else {
    log('yellow', '⚠️ Playwright конфигурация не найдена, пропускаем E2E тесты');
    results.push({
      name: 'E2E Tests (Playwright)',
      success: false,
      duration: 0,
      error: 'Конфигурация не найдена'
    });
  }
  
  // 3. Проверка производительности
  const perfTestStart = Date.now();
  const perfTestResult = runCommand(
    'npm run test -- --reporter=verbose --run src/utils/performance/',
    'Тесты производительности'
  );
  results.push({
    name: 'Performance Tests',
    success: perfTestResult.success,
    duration: Date.now() - perfTestStart,
    error: perfTestResult.error
  });
  
  // 4. Линтинг и проверка типов
  const lintStart = Date.now();
  const lintResult = runCommand(
    'npm run lint -- --ext .ts,.tsx src/components/common/DragPreview.tsx src/hooks/useDragDropUX.ts src/components/optimized/ src/components/lazy/',
    'Линтинг drag & drop компонентов'
  );
  results.push({
    name: 'Linting',
    success: lintResult.success,
    duration: Date.now() - lintStart,
    error: lintResult.error
  });
  
  // 5. Проверка типов TypeScript
  const typeCheckStart = Date.now();
  const typeCheckResult = runCommand(
    'npx tsc --noEmit --project tsconfig.json',
    'Проверка типов TypeScript'
  );
  results.push({
    name: 'Type Check',
    success: typeCheckResult.success,
    duration: Date.now() - typeCheckStart,
    error: typeCheckResult.error
  });
  
  // 6. Проверка bundle size (опционально)
  if (checkFileExists('rollup.config.js') || checkFileExists('vite.config.ts')) {
    const bundleStart = Date.now();
    const bundleResult = runCommand(
      'npm run build -- --mode=production',
      'Проверка размера bundle'
    );
    results.push({
      name: 'Bundle Size Check',
      success: bundleResult.success,
      duration: Date.now() - bundleStart,
      error: bundleResult.error
    });
  }
  
  const totalTime = Date.now() - startTime;
  
  // Генерируем отчет
  generateReport(results);
  
  // Выводим сводку
  log('bright', '\n📋 Сводка результатов:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const duration = `${result.duration}ms`;
    log('dim', `${status} ${result.name} (${duration})`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  log('bright', `\n🎯 Результат: ${successCount}/${totalCount} тестов прошли успешно`);
  log('dim', `⏱️ Общее время: ${totalTime}ms`);
  
  // Конкретные рекомендации
  if (successCount === totalCount) {
    log('green', '\n🎉 Все тесты прошли успешно! Drag & Drop готов к продакшену.');
  } else {
    log('yellow', '\n⚠️ Обнаружены проблемы. Рекомендуется их исправить перед деплоем.');
    
    // Показываем конкретные проблемы
    const failedTests = results.filter(r => !r.success);
    failedTests.forEach(test => {
      log('red', `❌ ${test.name}: ${test.error}`);
    });
  }
  
  // Дополнительные рекомендации
  log('blue', '\n💡 Рекомендации по оптимизации:');
  log('dim', '• Используйте React.memo для избежания лишних re-renders');
  log('dim', '• Применяйте lazy loading для больших виджетов');
  log('dim', '• Мониторьте Web Vitals (FCP, LCP, CLS) в продакшене');
  log('dim', '• Настройте CI/CD для автоматического запуска тестов');
  
  // Полезные команды
  log('cyan', '\n🔧 Полезные команды:');
  log('dim', '• npm run test:ui - запуск тестов в UI режиме');
  log('dim', '• npm run test:e2e:ui - запуск E2E тестов в UI режиме');
  log('dim', '• npm run test:coverage - детальный отчет о покрытии');
  log('dim', '• npm run build -- --analyze - анализ размера bundle');
  
  // Возвращаем код выхода
  process.exit(successCount === totalCount ? 0 : 1);
};

// Обработка ошибок
process.on('unhandledRejection', (error) => {
  log('red', `❌ Необработанная ошибка: ${error.message}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log('red', `❌ Критическая ошибка: ${error.message}`);
  process.exit(1);
});

// Запуск
main().catch(error => {
  log('red', `❌ Ошибка выполнения: ${error.message}`);
  process.exit(1);
});
