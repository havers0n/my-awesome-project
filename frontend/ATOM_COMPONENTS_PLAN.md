# План создания атомарных компонентов

## Анализ текущего состояния

### Уже существующие компоненты:
- ✅ **Button** - базовый компонент уже есть (`src/components/atoms/Button.tsx`)
- ✅ **Icon** - базовый компонент есть (`src/components/common/Icon.tsx`)
- ✅ **Text** - базовый компонент есть (`src/components/common/Text.tsx`)
- ❌ **Image** - существуют только UI компоненты для галерей
- ❌ **Typography** - отсутствуют специализированные Heading и Caption компоненты

### Требуется доработка:
1. **Button** - добавить недостающие варианты
2. **Icon** - улучшить для работы с SVG
3. **Typography** - создать специализированные компоненты
4. **Image** - создать с lazy loading и fallback

---

## 1. Компонент Button

### Текущее состояние:
- ✅ Базовая функциональность есть
- ✅ Варианты: primary, secondary, ghost, outline, success, warning, danger
- ✅ Размеры: xs, sm, md, lg, xl
- ✅ Состояние loading
- ✅ Иконки startIcon/endIcon

### Необходимые улучшения:

#### 1.1 Приведение к стандартам Atomic Design
**Файл:** `src/components/atoms/Button.tsx`
**Изменения:**
- Убрать лишние варианты (success, warning, danger) - оставить только primary, secondary, ghost
- Добавить outline как четвертый базовый вариант
- Упростить API и улучшить типизацию
- Добавить лучшую поддержку accessibility

#### 1.2 Создание Button истории (Storybook)
**Файл:** `src/components/atoms/Button.stories.tsx`
**Содержание:**
- Все варианты кнопок
- Все размеры
- Состояния (disabled, loading)
- Примеры с иконками

---

## 2. Компонент Icon

### Текущее состояние:
- ✅ Базовая функциональность есть
- ❌ Работа только с растровыми изображениями
- ❌ Нет поддержки SVG
- ❌ Зависимость от хелпера icons

### Необходимые улучшения:

#### 2.1 Создание нового SVG Icon компонента
**Файл:** `src/components/atoms/Icon.tsx`
**Возможности:**
- Поддержка SVG иконок
- Интеграция с библиотекой иконок (например, Lucide React)
- Настройка размеров и цветов
- Accessibility поддержка

#### 2.2 Миграция с растровых на SVG
**Файлы:**
- `src/components/atoms/Icon.tsx` - новый SVG компонент
- `src/components/atoms/LegacyIcon.tsx` - старый для обратной совместимости
- `src/components/atoms/index.ts` - экспорт обоих компонентов

---

## 3. Компоненты Typography

### Текущее состояние:
- ✅ Базовый Text компонент есть
- ❌ Нет специализированных Heading и Caption

### Необходимые создания:

#### 3.1 Heading компонент
**Файл:** `src/components/atoms/Heading.tsx`
**Возможности:**
- Уровни: h1, h2, h3, h4, h5, h6
- Автоматическое масштабирование шрифтов
- Поддержка различных весов
- Семантическая корректность

#### 3.2 Caption компонент
**Файл:** `src/components/atoms/Caption.tsx`
**Возможности:**
- Мелкий текст для подписей
- Различные стили (muted, accent, error)
- Поддержка иконок
- Гибкое позиционирование

#### 3.3 Рефакторинг Text компонента
**Файл:** `src/components/atoms/Text.tsx`
**Изменения:**
- Упрощение API
- Фокус на параграфы и span элементы
- Убрать дублирование с Heading

---

## 4. Компонент Image

### Текущее состояние:
- ❌ Нет универсального Image компонента
- ❌ Существуют только UI компоненты для галерей

### Необходимые создания:

#### 4.1 Основной Image компонент
**Файл:** `src/components/atoms/Image.tsx`
**Возможности:**
- Lazy loading с Intersection Observer
- Fallback изображения при ошибке
- Placeholder во время загрузки
- Различные режимы масштабирования
- Поддержка WebP/AVIF форматов

#### 4.2 Дополнительные компоненты
**Файлы:**
- `src/components/atoms/Avatar.tsx` - для аватарок
- `src/components/atoms/Thumbnail.tsx` - для миниатюр
- `src/components/atoms/Hero.tsx` - для больших изображений

---

## Детальный план реализации

### Этап 1: Рефакторинг существующих компонентов (1-2 дня)

#### День 1: Button компонент
1. **Утро:** Анализ текущего Button компонента
2. **День:** Рефакторинг API и упрощение вариантов
3. **Вечер:** Тестирование и создание Storybook историй

#### День 2: Icon компонент
1. **Утро:** Создание нового SVG Icon компонента
2. **День:** Интеграция с Lucide React
3. **Вечер:** Миграционный гайд для старых иконок

### Этап 2: Создание Typography компонентов (2-3 дня)

#### День 3: Heading компонент
1. **Утро:** Проектирование API
2. **День:** Реализация базовой функциональности
3. **Вечер:** Responsive поведение и accessibility

#### День 4: Caption и Text рефакторинг
1. **Утро:** Создание Caption компонента
2. **День:** Рефакторинг Text компонента
3. **Вечер:** Интеграция всех Typography компонентов

#### День 5: Документация и тестирование
1. **Утро:** Создание документации
2. **День:** Unit тесты
3. **Вечер:** Storybook истории

### Этап 3: Создание Image компонента (2-3 дня)

#### День 6: Базовый Image компонент
1. **Утро:** Проектирование архитектуры
2. **День:** Реализация lazy loading
3. **Вечер:** Fallback механизмы

#### День 7: Дополнительные возможности
1. **Утро:** Placeholder и loading состояния
2. **День:** Оптимизация производительности
3. **Вечер:** Тестирование на разных устройствах

#### День 8: Специализированные компоненты
1. **Утро:** Avatar компонент
2. **День:** Thumbnail компонент
3. **Вечер:** Hero компонент

---

## Структура файлов после реализации

```
src/components/atoms/
├── Button.tsx                 # ✅ Обновленный
├── Button.stories.tsx         # 🆕 Новый
├── Icon.tsx                   # 🆕 Новый SVG компонент
├── LegacyIcon.tsx            # 🆕 Старый для совместимости
├── Heading.tsx               # 🆕 Новый
├── Heading.stories.tsx       # 🆕 Новый
├── Caption.tsx               # 🆕 Новый
├── Caption.stories.tsx       # 🆕 Новый
├── Text.tsx                  # ✅ Обновленный (перемещен из common)
├── Text.stories.tsx          # 🆕 Новый
├── Image.tsx                 # 🆕 Новый
├── Image.stories.tsx         # 🆕 Новый
├── Avatar.tsx                # 🆕 Новый
├── Thumbnail.tsx             # 🆕 Новый
├── Hero.tsx                  # 🆕 Новый
├── index.ts                  # ✅ Обновленный
└── README.md                 # ✅ Обновленный
```

---

## API Specifications

### Button Component
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Icon Component
```typescript
interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: 'primary' | 'secondary' | 'danger' | 'success' | string;
  strokeWidth?: number;
  className?: string;
}
```

### Heading Component
```typescript
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
  children: React.ReactNode;
}
```

### Caption Component
```typescript
interface CaptionProps {
  variant?: 'default' | 'muted' | 'accent' | 'error';
  size?: 'xs' | 'sm';
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}
```

### Image Component
```typescript
interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: string;
  lazy?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}
```

---

## Зависимости

### Новые зависимости:
```json
{
  "lucide-react": "^0.263.1",
  "react-intersection-observer": "^9.4.3"
}
```

### Dev зависимости:
```json
{
  "@storybook/react": "^7.0.0",
  "@testing-library/react": "^13.4.0",
  "@testing-library/jest-dom": "^5.16.5"
}
```

---

## Критерии готовности

### Для каждого компонента:
- [ ] Реализован базовый функционал
- [ ] Добавлены TypeScript типы
- [ ] Создана Storybook история
- [ ] Написаны unit тесты
- [ ] Добавлена документация
- [ ] Проверена accessibility
- [ ] Тестирование на мобильных устройствах

### Для всего проекта:
- [ ] Обновлен главный index.ts
- [ ] Обновлена документация README
- [ ] Создан миграционный гайд
- [ ] Проведен код-ревью
- [ ] Интеграционные тесты

---

## Риски и митигация

### Основные риски:
1. **Breaking changes** - могут сломать существующий код
   - *Митигация:* Создание LegacyIcon компонента для совместимости

2. **Производительность** - lazy loading может замедлить загрузку
   - *Митигация:* Оптимизация с помощью Intersection Observer

3. **Большой bundle size** - добавление новых зависимостей
   - *Митигация:* Tree-shaking и выборочный импорт

### Меры предосторожности:
- Создание feature flags для новых компонентов
- Постепенный rollout с A/B тестированием
- Детальное тестирование перед продакшеном

---

## Следующие шаги

1. **Подтверждение плана** - обсуждение с командой
2. **Установка зависимостей** - добавление необходимых пакетов
3. **Создание базовой структуры** - файлы и папки
4. **Поэтапная реализация** - согласно временному плану
5. **Тестирование и документирование** - финальные штрихи

Этот план обеспечивает создание качественных, переиспользуемых атомарных компонентов, которые будут служить основой для более сложных UI элементов в dashboard приложении.
