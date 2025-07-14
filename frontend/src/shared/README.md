# Shared Layer - Общий слой

## Описание

Shared слой содержит переиспользуемые компоненты, утилиты и сервисы, которые могут быть использованы в любом месте приложения.

## Структура

```
src/shared/
├── ui/                    # UI компоненты
│   ├── atoms/            # Атомарные компоненты
│   ├── molecules/        # Молекулярные компоненты
│   └── index.ts          # Единый экспорт UI компонентов
├── lib/                  # Библиотека утилит
│   ├── hooks/           # Переиспользуемые хуки
│   ├── types/           # Типы TypeScript
│   └── index.ts         # Экспорт утилит
├── api/                  # API сервисы
│   ├── supabase/        # Supabase клиент
│   ├── index.ts         # Основной API
│   └── apiIndex.ts      # Экспорт всех API сервисов
├── config/               # Конфигурация
│   ├── constants.ts     # Константы приложения
│   ├── env.ts           # Переменные окружения
│   └── index.ts         # Экспорт конфигурации
└── index.ts              # Главный экспорт shared слоя
```

## Миграция

### Выполненные этапы:

1. ✅ **Миграция UI компонентов**:
   - `components/atoms/` → `shared/ui/atoms/`
   - `components/molecules/` → `shared/ui/molecules/`
   - Создан единый `shared/ui/index.ts` для экспорта

2. ✅ **Миграция утилит и хелперов**:
   - `utils/` → `shared/lib/`
   - `hooks/` → `shared/lib/hooks/`
   - `types/` → `shared/lib/types/`

3. ✅ **Миграция API сервисов**:
   - `services/supabaseClient.ts` → `shared/api/supabase/client.ts`
   - `services/api.ts` → `shared/api/index.ts`
   - Созданы фасады для API вызовов

4. ✅ **Миграция конфигов**:
   - `constants.ts` → `shared/config/constants.ts`
   - Создан `shared/config/env.ts` для переменных окружения

## Использование

### Импорт UI компонентов

```typescript
// Импорт конкретных компонентов
import { Button, Input, Badge } from '@/shared/ui';

// Импорт из конкретных папок
import { Button } from '@/shared/ui/atoms';
import { Modal } from '@/shared/ui/molecules';
```

### Импорт утилит и хуков

```typescript
// Утилиты
import { cn, excelExport } from '@/shared/lib';

// Хуки
import { useTheme, useModal } from '@/shared/lib/hooks';

// Типы
import type { User, Product } from '@/shared/lib/types';
```

### Импорт API сервисов

```typescript
// Supabase
import { supabase } from '@/shared/api/supabase';

// Основной API
import { baseAPI, authAPI } from '@/shared/api';

// Специфические сервисы
import { shelfAvailabilityService } from '@/shared/api';
```

### Импорт конфигурации

```typescript
// Константы
import { ROLES, STATUS_CONFIG } from '@/shared/config';

// Переменные окружения
import { env, isDevelopment } from '@/shared/config';
```

## Принципы

1. **Переиспользуемость** - все компоненты и утилиты должны быть максимально переиспользуемыми
2. **Типизация** - все экспортируемые функции и компоненты должны быть типизированы
3. **Документация** - каждый публичный API должен быть задокументирован
4. **Тестирование** - критически важные утилиты должны быть покрыты тестами

## Миграция зависимостей

После перемещения файлов необходимо обновить импорты в существующих файлах:

```typescript
// Было
import { Button } from '@/components/atoms/Button';

// Стало
import { Button } from '@/shared/ui';
```

## Примечания

- Все экспорты организованы через индексные файлы для удобства импорта
- Создан типизированный конфиг для переменных окружения
- API сервисы организованы в фасады для удобства использования
- Сохранена обратная совместимость с существующими импортами
