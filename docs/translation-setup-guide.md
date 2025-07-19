# Руководство по настройке переводов (i18n)

## Проблема и решение

### Проблема
При попытке перевести страницу управления инвентарем на английский язык отображались ключи переводов вместо переведенного текста:
```
inventory.management.title: inventory.management.title
inventory.management.subtitle: inventory.management.subtitle
```

### Причина
1. **Неправильная структура ключей**: Код использовал ключи `inventory.management.*`, но в файлах переводов они находились в структуре `page.inventory.management.*`
2. **Проблемы с загрузкой файлов**: Изначально пытались импортировать JSON файлы из папки `public`, что не поддерживается Vite

### Решение
1. **Исправили структуру ключей**: Обновили все ключи с `inventory.management.*` на `page.inventory.management.*`
2. **Настроили HTTP backend**: Используем `i18next-http-backend` для загрузки переводов из папки `public/locales`
3. **Добавили типы для JSON**: Создали файл `src/types/json.d.ts` для поддержки импорта JSON файлов

## Текущая архитектура переводов

### Структура файлов
```
frontend/
├── public/
│   └── locales/
│       ├── en/
│       │   └── translation.json
│       └── ru/
│           └── translation.json
├── src/
│   ├── i18n.ts                    # Конфигурация i18next
│   ├── types/
│   │   └── json.d.ts              # Типы для JSON файлов
│   └── components/common/
│       └── TranslationDebug.tsx   # Компонент отладки
```

### Конфигурация i18n (`src/i18n.ts`)
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });
```

### Vite конфигурация
В `vite.config.ts` настроено копирование папки locales:
```typescript
viteStaticCopy({
  targets: [
    {
      src: 'public/locales',
      dest: ''
    }
  ]
})
```

## Как добавлять новые переводы

### 1. Добавление новых ключей переводов

#### Шаг 1: Добавить ключи в файлы переводов
В `public/locales/en/translation.json`:
```json
{
  "page": {
    "newPage": {
      "title": "New Page Title",
      "subtitle": "New page description",
      "buttons": {
        "save": "Save",
        "cancel": "Cancel"
      }
    }
  }
}
```

В `public/locales/ru/translation.json`:
```json
{
  "page": {
    "newPage": {
      "title": "Заголовок новой страницы",
      "subtitle": "Описание новой страницы",
      "buttons": {
        "save": "Сохранить",
        "cancel": "Отмена"
      }
    }
  }
}
```

#### Шаг 2: Использовать переводы в компоненте
```typescript
import { useTranslation } from 'react-i18next';

const NewPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('page.newPage.title')}</h1>
      <p>{t('page.newPage.subtitle')}</p>
      <button>{t('page.newPage.buttons.save')}</button>
      <button>{t('page.newPage.buttons.cancel')}</button>
    </div>
  );
};
```

### 2. Структура ключей переводов

#### Рекомендуемая структура:
```
page.{pageName}.{section}.{element}
```

Примеры:
- `page.inventory.management.title` - заголовок страницы управления инвентарем
- `page.inventory.management.stats.totalSKU` - статистика "Всего SKU"
- `page.inventory.management.buttons.add` - кнопка "Добавить"
- `page.inventory.management.filters.category` - фильтр "Категория"

#### Вложенные структуры:
```json
{
  "page": {
    "inventory": {
      "management": {
        "title": "Warehouse Management System",
        "stats": {
          "totalSKU": "Total SKU",
          "inStock": "In Stock"
        },
        "buttons": {
          "add": "Add Product",
          "edit": "Edit"
        }
      }
    }
  }
}
```

### 3. Отладка переводов

#### Компонент отладки
Используйте `TranslationDebug` для диагностики проблем:
```typescript
import TranslationDebug from '@/components/common/TranslationDebug';

// В компоненте
<TranslationDebug />
```

Компонент показывает:
- Текущий язык
- Статус инициализации i18next
- Загруженные ресурсы
- Тестовые переводы
- Сырые данные переводов

#### Консоль браузера
Включен debug режим в i18n конфигурации, поэтому в консоли будут видны:
- Логи загрузки переводов
- Ошибки "missingKey" для отсутствующих ключей
- Информация об инициализации

### 4. Переключение языков

#### Программное переключение:
```typescript
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ru')}>Русский</button>
    </div>
  );
};
```

#### Автоматическое определение:
Система автоматически определяет язык браузера и сохраняет выбор в localStorage.

## Частые проблемы и решения

### 1. Ключи не переводятся
**Симптомы**: Отображаются ключи вместо переведенного текста
**Решение**: 
- Проверить правильность структуры ключей
- Убедиться, что ключи существуют в файлах переводов
- Проверить консоль на ошибки "missingKey"

### 2. Файлы переводов не загружаются
**Симптомы**: Пустые переводы, ошибки 404
**Решение**:
- Проверить, что файлы находятся в `public/locales/{lang}/translation.json`
- Убедиться, что Vite копирует папку locales
- Проверить сетевые запросы в DevTools

### 3. Переводы загружаются, но не применяются
**Симптомы**: Переводы в ресурсах есть, но компоненты не обновляются
**Решение**:
- Проверить, что компонент использует `useTranslation()`
- Убедиться, что ключи написаны правильно
- Проверить, что i18next инициализирован

### 4. Проблемы с TypeScript
**Симптомы**: Ошибки типизации при импорте JSON
**Решение**:
- Убедиться, что файл `src/types/json.d.ts` существует
- Проверить, что TypeScript видит декларации типов

## Лучшие практики

### 1. Организация ключей
- Используйте иерархическую структуру: `page.section.element`
- Группируйте связанные ключи в объекты
- Используйте описательные имена ключей

### 2. Поддержка множественных форм
```typescript
// В переводе
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}

// В компоненте
{t('items', { count: itemCount })}
```

### 3. Интерполяция переменных
```typescript
// В переводе
{
  "welcome": "Welcome, {{name}}!"
}

// В компоненте
{t('welcome', { name: userName })}
```

### 4. Условные переводы
```typescript
// В переводе
{
  "status": {
    "active": "Active",
    "inactive": "Inactive"
  }
}

// В компоненте
{t(`status.${isActive ? 'active' : 'inactive'}`)}
```

## Команды для работы с переводами

### Обновление ключей переводов
```powershell
# Заменить все вхождения ключа в файле
(Get-Content src\pages\PageName.tsx) -replace "old\.key\.", "new.key." | Set-Content src\pages\PageName.tsx
```

### Проверка ключей
```powershell
# Найти все использования ключа
grep -r "translation.key" src/
```

### Создание коммита
```bash
git add .
git commit -m "Add translations for new page"
git push
```

## Заключение

Система переводов настроена и работает корректно. Основные принципы:

1. **Структура ключей**: `page.{pageName}.{section}.{element}`
2. **Файлы переводов**: `public/locales/{lang}/translation.json`
3. **HTTP backend**: Автоматическая загрузка переводов
4. **Отладка**: Компонент TranslationDebug для диагностики
5. **TypeScript**: Поддержка типизации JSON файлов

При добавлении новых переводов следуйте этой структуре и используйте компонент отладки для проверки корректности работы. 