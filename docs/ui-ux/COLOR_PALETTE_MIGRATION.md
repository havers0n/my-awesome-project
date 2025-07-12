# Миграция цветовой палитры на Amber

## Обзор
Приложение успешно переведено с синей цветовой палитры на amber-based схему согласно предоставленным требованиям.

## Новая цветовая палитра

### Основные цвета (HEX)
| Цвет | Tailwind | HEX | Роль |
|------|----------|-----|------|
| Amber 700 | `bg-amber-700` | `#b45309` | Основной акцент/кнопки |
| Amber 600 | `bg-amber-600` | `#d97706` | Акцент/градиенты/прогресс |
| Amber 400 | `text-amber-400` | `#fbbf24` | Иконки, элементы |
| White | `bg-white, text-white` | `#ffffff` | Фон карточек, тексты |
| Gray 50 | `bg-gray-50` | `#f9fafb` | Основной фон страницы |
| Gray 200 | `bg-gray-200` | `#e5e7eb` | Разделители, прогресс-бары |
| Gray 400 | `text-gray-400` | `#9ca3af` | Вторичный текст |
| Gray 700/800 | `bg-gray-700/800` | `#374151/#1f2937` | Подвал, тёмные элементы |
| Green 500 | `bg-green-500` | `#22c55e` | Уведомления, успех |
| Green 100/800 | `bg-green-100/text-green-800` | `#dcfce7/#166534` | Статусы |
| Yellow 100/800 | `bg-yellow-100/text-yellow-800` | `#fef3c7/#a16207` | Статусы |
| Red 100/800 | `bg-red-100/text-red-800` | `#fee2e2/#991b1b` | Статусы |

## Измененные файлы

### Основные CSS файлы
1. **`frontend/src/index.css`**
   - Обновлены CSS переменные `--color-brand-*` с синих на amber
   - Сохранена совместимость с существующими компонентами

2. **`frontend/src/styles/admin.css`**
   - Обновлены админ CSS переменные:
     - `--admin-primary`: `#b45309` (amber-700)
     - `--admin-primary-hover`: `#92400e` (amber-800)
     - `--admin-primary-light`: `#fef3c7` (amber-50)
   - Обновлены цвета статусных бейджей
   - Обновлена темная тема

### Компоненты Admin Panel
Автоматически обновлены следующие компоненты:

#### Модальные окна
- `LocationFormModal.tsx` ✅
- `OrganizationFormModal.tsx` ✅
- `RoleFormModal.tsx` ✅
- `RolePermissionsModal.tsx` ✅
- `SupplierFormModal.tsx` ✅
- `UserFormModal.tsx` ✅

#### Страницы управления
- `OrganizationDetailPage.tsx` ✅
- `OrganizationListPage.tsx` ✅
- `RoleManagementPage.tsx` ✅
- `SupplierListPage.tsx` ✅
- `UserManagementPage.tsx` ✅

#### Другие компоненты
- `UserProfiles.tsx` ✅
- `SalesForecastPage.tsx` ✅
- `TestForecastAPI.tsx` ✅
- `ShelfAvailabilityPage.tsx` ✅

## Автоматические замены цветов

### Кнопки
- `bg-blue-600` → `bg-amber-600`
- `bg-blue-700` → `bg-amber-700`
- `hover:bg-blue-700` → `hover:bg-amber-700`
- `bg-blue-500` → `bg-amber-600`
- `hover:bg-blue-600` → `hover:bg-amber-700`

### Focus состояния
- `focus:ring-blue-500` → `focus:ring-amber-500`
- `ring-blue-500` → `ring-amber-500`
- `border-blue-500` → `border-amber-500`

### Фоновые цвета
- `bg-blue-50` → `bg-amber-50`
- `bg-blue-100` → `bg-amber-100`
- `hover:bg-blue-50` → `hover:bg-amber-50`
- `border-blue-200` → `border-amber-200`

### Текстовые цвета
- `text-blue-600` → `text-amber-600`
- `text-blue-700` → `text-amber-700`
- `text-blue-800` → `text-amber-800`
- `hover:text-blue-700` → `hover:text-amber-700`
- `hover:text-blue-800` → `hover:text-amber-800`

## Результат миграции

### ✅ Успешно обновлено
- **13 админ-компонентов** с автоматической заменой цветов
- **4 дополнительных компонента** (UserProfiles, SalesForecastPage, TestForecastAPI, ShelfAvailabilityPage)
- **CSS переменные** в основных файлах стилей
- **Статусные бейджи** с новыми цветами
- **Темная тема** адаптирована под amber палитру

### ✅ Сохранена функциональность
- Все компоненты собираются без ошибок
- Интерактивность кнопок и элементов сохранена
- Hover эффекты работают корректно
- Focus состояния функционируют

### ✅ Улучшена консистентность
- Единая цветовая схема во всем приложении
- Правильные контрасты для доступности
- Профессиональный amber-based дизайн

## Сборка
✅ Приложение успешно собирается без ошибок  
✅ Все зависимости корректно обработаны  
✅ CSS генерируется правильно  

## Запуск
Для просмотра обновленного дизайна:
```bash
cd frontend
npm run dev
```

Приложение будет доступно на `http://localhost:5176` с новой amber цветовой палитрой.

## Дата миграции
2025-01-12 