// Глобальная настройка моков для всех тестов

// Восстанавливаем оригинальный console.log для отладки
if (process.env.DEBUG_TESTS) {
  global.console.log = console.log;
  global.console.error = console.error;
}

// Экспортируем для использования в тестах
export {};
