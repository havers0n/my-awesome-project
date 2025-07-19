# Краткая памятка по переводам

## Быстрое добавление переводов

### 1. Добавить ключи в файлы переводов

**Английский** (`public/locales/en/translation.json`):
```json
{
  "page": {
    "yourPage": {
      "title": "Your Page Title",
      "subtitle": "Your page description"
    }
  }
}
```

**Русский** (`public/locales/ru/translation.json`):
```json
{
  "page": {
    "yourPage": {
      "title": "Заголовок вашей страницы",
      "subtitle": "Описание вашей страницы"
    }
  }
}
```

### 2. Использовать в компоненте

```typescript
import { useTranslation } from 'react-i18next';

const YourPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('page.yourPage.title')}</h1>
      <p>{t('page.yourPage.subtitle')}</p>
    </div>
  );
};
```

## Структура ключей

```
page.{pageName}.{section}.{element}
```

**Примеры:**
- `page.inventory.management.title`
- `page.inventory.management.stats.totalSKU`
- `page.inventory.management.buttons.add`

## Отладка

### Добавить компонент отладки
```typescript
import TranslationDebug from '@/components/common/TranslationDebug';

// В компоненте
<TranslationDebug />
```

### Проверить консоль браузера
- Ошибки "missingKey" = ключ не найден
- Логи загрузки переводов

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| Показываются ключи вместо текста | Проверить структуру ключей в файлах переводов |
| Переводы не загружаются | Проверить файлы в `public/locales/{lang}/translation.json` |
| TypeScript ошибки | Убедиться, что `src/types/json.d.ts` существует |

## Команды

```powershell
# Заменить ключи в файле
(Get-Content src\pages\PageName.tsx) -replace "old\.key\.", "new.key." | Set-Content src\pages\PageName.tsx

# Найти все использования ключа
grep -r "page.yourPage" src/
```

## Переключение языков

```typescript
const { i18n } = useTranslation();

// Переключить на английский
i18n.changeLanguage('en');

// Переключить на русский
i18n.changeLanguage('ru');
``` 