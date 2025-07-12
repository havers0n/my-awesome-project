# Интеграция с SonarQube

## Что такое SonarQube?
SonarQube - это платформа для непрерывной инспекции качества кода. Она выполняет автоматический анализ кода для обнаружения багов, уязвимостей и "code smells".

## Установка и настройка

### 1. Локальная установка SonarQube (Docker)
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

### 2. Установка SonarQube Scanner
```bash
npm install --save-dev sonarqube-scanner
```

### 3. Конфигурация проекта
Создайте файл `sonar-project.properties` в корне проекта:

```properties
# Основные настройки
sonar.projectKey=tailwind-admin-dashboard
sonar.projectName=Tailwind Admin Dashboard
sonar.projectVersion=1.0.0

# Источники кода
sonar.sources=src
sonar.exclusions=**/*.test.ts,**/*.spec.ts,**/node_modules/**,**/coverage/**,**/dist/**

# Тесты
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.spec.ts

# TypeScript
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Качество кода
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts,**/test/**
```

### 4. Скрипт для анализа
Добавьте в `package.json`:
```json
{
  "scripts": {
    "sonar": "sonar-scanner"
  }
}
```

## Метрики SonarQube

### Основные метрики:
- **Bugs**: Ошибки, которые могут привести к неправильному поведению
- **Vulnerabilities**: Уязвимости безопасности
- **Code Smells**: Проблемы сопровождения кода
- **Coverage**: Покрытие кода тестами
- **Duplications**: Дублирование кода

### Quality Gates
Настройте пороговые значения для автоматической проверки качества:
- Coverage > 80%
- Duplicated Lines < 3%
- Maintainability Rating = A
- Reliability Rating = A
- Security Rating = A

## Интеграция с CI/CD

### GitHub Actions
```yaml
name: SonarQube Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

## Лучшие практики

### 1. Регулярный анализ
- Запускайте анализ при каждом PR
- Проверяйте новый код на соответствие стандартам

### 2. Исправление проблем
- Prioritize: Security Hotspots > Bugs > Code Smells
- Не игнорируйте предупреждения
- Используйте комментарии для объяснения сложного кода

### 3. Настройка правил
- Адаптируйте правила под ваш проект
- Исключите сгенерированный код
- Настройте правила для TypeScript

## Дашборд метрик
После настройки SonarQube, вы получите доступ к дашборду с:
- Обзором качества кода
- Историей изменений
- Детальным анализом проблем
- Рекомендациями по улучшению
