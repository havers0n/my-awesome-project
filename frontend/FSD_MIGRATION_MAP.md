# Детальная карта миграции на FSD архитектуру

## 1. Аудит компонентов по уровням

### 1.1 Atoms - Анализ истинных атомов

**Правильно классифицированные атомы (остаются):**
- ✅ `Button.tsx` - базовый элемент интерфейса
- ✅ `Input.tsx` - базовый элемент формы
- ✅ `Badge.tsx` - базовый элемент отображения
- ✅ `Label.tsx` - базовый текстовый элемент
- ✅ `Checkbox.tsx` - базовый элемент формы
- ✅ `Switch.tsx` - базовый элемент переключения
- ✅ `Spinner.tsx` - базовый элемент загрузки
- ✅ `Avatar.tsx` - базовый элемент отображения пользователя
- ✅ `Icon/*` - базовые иконки
- ✅ `Typography/*` - базовые текстовые элементы

**Неправильно классифицированные атомы (требуют перемещения):**
- ❌ `FormField.tsx` → должен быть в molecules (композитный компонент)
- ❌ `Dropdown.tsx` → должен быть в molecules (сложное поведение)
- ❌ `Card.tsx` → должен быть в molecules (контейнер для контента)

### 1.2 Molecules - Анализ композитных компонентов

**Правильно классифицированные molecules:**
- ✅ `Alert.tsx` - композитный компонент
- ✅ `Modal.tsx` - композитный компонент
- ✅ `MetricCard.tsx` - композитный компонент
- ✅ `SearchBar.tsx` - композитный компонент
- ✅ `SnapshotCard.tsx` - композитный компонент
- ✅ `MultiSelectDropdown.tsx` - композитный компонент
- ✅ `PhoneField.tsx` - композитный компонент
- ✅ `StatusBadge.tsx` - композитный компонент
- ✅ `ProductCell.tsx` - композитный компонент
- ✅ `FilterButton.tsx` - композитный компонент
- ✅ `Pagination.tsx` - композитный компонент

**Компоненты для перемещения из atoms:**
- ⬆️ `FormField.tsx` (из atoms)
- ⬆️ `Dropdown.tsx` (из atoms)
- ⬆️ `Card.tsx` (из atoms)

### 1.3 Organisms - Анализ сложных компонентов

**Правильно классифицированные organisms:**
- ✅ `OrdersTable/*` - сложная таблица с логикой
- ✅ `MetricsGrid.tsx` - сложная сетка метрик
- ✅ `ForecastCreationPanel.tsx` - сложная панель создания
- ✅ `ProductTable.tsx` - сложная таблица продуктов
- ✅ `CountryList.tsx` - сложный список стран
- ✅ `ChartContainer.tsx` - сложный контейнер графиков
- ✅ `TopProductsList.tsx` - сложный список продуктов
- ✅ `ForecastHistoryTable.tsx` - сложная таблица истории

### 1.4 Templates - Анализ шаблонов

**Существующие шаблоны:**
- ✅ `AuthTemplate.tsx` - шаблон аутентификации
- ✅ `DashboardTemplate.tsx` - шаблон дашборда
- ✅ `RecentOrdersWidget.tsx` - шаблон виджета заказов
- ✅ `ExampleDashboardPage.tsx` - пример страницы дашборда

## 2. Маппинг компонентов на FSD структуру

### 2.1 Текущая структура → FSD структура

```
Текущая структура                  → FSD структура
├── atoms/                        → shared/ui/atoms/
│   ├── Button.tsx               → shared/ui/atoms/Button/
│   ├── Input.tsx                → shared/ui/atoms/Input/
│   ├── Badge.tsx                → shared/ui/atoms/Badge/
│   ├── FormField.tsx            → shared/ui/molecules/FormField/
│   ├── Dropdown.tsx             → shared/ui/molecules/Dropdown/
│   └── Card.tsx                 → shared/ui/molecules/Card/

├── molecules/                    → shared/ui/molecules/
│   ├── Alert.tsx                → shared/ui/molecules/Alert/
│   ├── Modal.tsx                → shared/ui/molecules/Modal/
│   ├── MetricCard.tsx           → shared/ui/molecules/MetricCard/
│   ├── SearchBar.tsx            → shared/ui/molecules/SearchBar/
│   └── FormField.tsx            → shared/ui/molecules/FormField/

├── organisms/                    → widgets/ или features/
│   ├── OrdersTable/             → features/orders/ui/OrdersTable/
│   ├── MetricsGrid.tsx          → widgets/MetricsGrid/
│   ├── ProductTable.tsx         → features/products/ui/ProductTable/
│   ├── CountryList.tsx          → features/geography/ui/CountryList/
│   └── ChartContainer.tsx       → widgets/ChartContainer/

├── templates/                    → app/layouts/
│   ├── AuthTemplate.tsx         → app/layouts/AuthLayout/
│   ├── DashboardTemplate.tsx    → app/layouts/DashboardLayout/
│   └── RecentOrdersWidget.tsx   → widgets/RecentOrdersWidget/

├── pages/                        → pages/
│   ├── Dashboard/               → pages/dashboard/
│   ├── Admin/                   → pages/admin/
│   ├── Inventory/               → pages/inventory/
│   └── AuthPages/               → pages/auth/

├── components/auth/              → features/auth/
│   ├── ProtectedRoute.tsx       → features/auth/ui/ProtectedRoute/
│   ├── SignInForm.tsx           → features/auth/ui/SignInForm/
│   └── SignUpForm.tsx           → features/auth/ui/SignUpForm/

├── components/admin/             → features/admin/
│   ├── AdminPageWrapper.tsx     → features/admin/ui/AdminPageWrapper/
│   └── UnifiedAdminExample.tsx  → features/admin/ui/UnifiedAdminExample/

├── context/                      → app/providers/
│   ├── AuthContext.tsx          → app/providers/AuthProvider/
│   ├── DataContext.tsx          → app/providers/DataProvider/
│   ├── SidebarContext.tsx       → app/providers/SidebarProvider/
│   └── ThemeContext.tsx         → app/providers/ThemeProvider/

├── services/                     → shared/api/
│   ├── api.ts                   → shared/api/base/
│   ├── outOfStockService.ts     → shared/api/inventory/
│   ├── supabaseClient.ts        → shared/api/supabase/
│   └── warehouseApi.ts          → shared/api/warehouse/

├── charts/                       → widgets/charts/
│   ├── BarChart.tsx             → widgets/charts/BarChart/
│   ├── LineChart.tsx            → widgets/charts/LineChart/
│   └── StatisticsChart.tsx      → widgets/charts/StatisticsChart/

├── dashboard/                    → widgets/dashboard/
│   ├── Header.tsx               → widgets/dashboard/Header/
│   ├── ProductList.tsx          → widgets/dashboard/ProductList/
│   └── QuickActions.tsx         → widgets/dashboard/QuickActions/

├── ecommerce/                    → features/ecommerce/
│   ├── EcommerceMetrics.tsx     → features/ecommerce/ui/EcommerceMetrics/
│   ├── MonthlySalesChart.tsx    → features/ecommerce/ui/MonthlySalesChart/
│   └── RecentOrders.tsx         → features/ecommerce/ui/RecentOrders/

├── form/                         → shared/ui/form/
│   ├── Form.tsx                 → shared/ui/form/Form/
│   ├── Select.tsx               → shared/ui/form/Select/
│   └── date-picker.tsx          → shared/ui/form/DatePicker/

├── header/                       → widgets/header/
│   ├── Header.tsx               → widgets/header/Header/
│   ├── NotificationDropdown.tsx → widgets/header/NotificationDropdown/
│   └── UserDropdown.tsx         → widgets/header/UserDropdown/

├── inventory/                    → features/inventory/
│   ├── ShelfAvailabilityMenu.tsx → features/inventory/ui/ShelfAvailabilityMenu/
│   └── ShelfAvailabilityWidget.tsx → features/inventory/ui/ShelfAvailabilityWidget/

├── forecast/                     → features/forecast/
│   ├── ForecastComparison.tsx   → features/forecast/ui/ForecastComparison/
│   ├── ForecastResults.tsx      → features/forecast/ui/ForecastResults/
│   └── ForecastErrorDisplay.tsx → features/forecast/ui/ForecastErrorDisplay/

└── common/                       → shared/ui/common/
    ├── ErrorBoundary.tsx        → shared/ui/common/ErrorBoundary/
    ├── Icon.tsx                 → shared/ui/common/Icon/
    ├── Tooltip.tsx              → shared/ui/common/Tooltip/
    └── ThemeToggleButton.tsx    → shared/ui/common/ThemeToggleButton/
```

### 2.2 Новая FSD структура

```
src/
├── app/                          # Слой приложения
│   ├── layouts/                  # Макеты страниц
│   │   ├── AuthLayout/
│   │   ├── DashboardLayout/
│   │   └── AdminLayout/
│   ├── providers/                # Провайдеры контекста
│   │   ├── AuthProvider/
│   │   ├── DataProvider/
│   │   ├── SidebarProvider/
│   │   └── ThemeProvider/
│   ├── styles/                   # Глобальные стили
│   └── App.tsx                   # Корневой компонент

├── pages/                        # Слой страниц
│   ├── dashboard/
│   ├── admin/
│   ├── inventory/
│   ├── auth/
│   ├── analytics/
│   └── reports/

├── widgets/                      # Слой виджетов
│   ├── MetricsGrid/
│   ├── ChartContainer/
│   ├── RecentOrdersWidget/
│   ├── charts/
│   ├── dashboard/
│   └── header/

├── features/                     # Слой функций
│   ├── auth/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── admin/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── orders/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── products/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── inventory/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── forecast/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── ecommerce/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   └── geography/
│       ├── ui/
│       ├── model/
│       └── api/

├── entities/                     # Слой сущностей
│   ├── user/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── order/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── product/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   ├── organization/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   └── warehouse/
│       ├── ui/
│       ├── model/
│       └── api/

└── shared/                       # Слой общих ресурсов
    ├── ui/                       # UI компоненты
    │   ├── atoms/
    │   ├── molecules/
    │   ├── form/
    │   └── common/
    ├── api/                      # API клиенты
    │   ├── base/
    │   ├── supabase/
    │   ├── inventory/
    │   └── warehouse/
    ├── lib/                      # Утилиты
    │   ├── utils/
    │   ├── hooks/
    │   └── constants/
    └── assets/                   # Статические ресурсы
        ├── images/
        ├── icons/
        └── fonts/
```

## 3. Анализ зависимостей

### 3.1 Выявленные циклические зависимости

**Проблемные зависимости:**
1. `atoms/FormField.tsx` и `molecules/FormField.tsx` - дублирование
2. `organisms/OrdersTable` → `molecules/OrdersTableRow` → `atoms/Typography`
3. `templates/RecentOrdersWidget` → `organisms/OrdersTable` → `molecules/OrdersTableRow`

**Решения:**
- Удалить дубликат `FormField` из atoms
- Переместить `Typography` в shared/ui/atoms
- Создать четкую иерархию зависимостей

### 3.2 Общие компоненты для shared/ui

**Компоненты для shared/ui/atoms:**
- Button, Input, Badge, Label, Checkbox, Switch, Spinner, Avatar
- Icon, Typography, Link, Skeleton, Toast, Toaster
- RadioGroup, RadioGroupItem

**Компоненты для shared/ui/molecules:**
- FormField, Dropdown, Card, Alert, Modal, Pagination
- SearchBar, StatusBadge, FilterButton, PhoneField
- ProgressIndicator, ChartHeader, DataTable

**Компоненты для shared/ui/form:**
- Form, Select, MultiSelect, DatePicker, FileInput
- InputField, TextArea, ToggleSwitch, CheckboxComponents
- RadioButtons, SelectInputs, InputGroup

**Компоненты для shared/ui/common:**
- ErrorBoundary, Icon, Tooltip, ThemeToggleButton
- ScrollToTop, Separator, Text, ProgressBar
- MetricValue, CountryFlag, AnimatedTransition

### 3.3 Бизнес-логика для entities

**Сущности для выделения:**

1. **User Entity** (`entities/user/`)
   - Модель пользователя
   - Профиль пользователя
   - Роли и разрешения

2. **Order Entity** (`entities/order/`)
   - Модель заказа
   - Статусы заказов
   - Элементы заказа

3. **Product Entity** (`entities/product/`)
   - Модель продукта
   - Категории продуктов
   - Характеристики продуктов

4. **Organization Entity** (`entities/organization/`)
   - Модель организации
   - Локации организации
   - Настройки организации

5. **Warehouse Entity** (`entities/warehouse/`)
   - Модель склада
   - Инвентарь склада
   - Операции склада

### 3.4 Карта зависимостей

```
shared/ui/atoms (базовые компоненты)
    ↑
shared/ui/molecules (композитные компоненты)
    ↑
entities/*/ui (UI компоненты сущностей)
    ↑
features/*/ui (UI компоненты функций)
    ↑
widgets/ (UI виджеты)
    ↑
pages/ (страницы)
    ↑
app/ (приложение)
```

## 4. План поэтапной миграции

### Этап 1: Подготовка
- Создание новой FSD структуры папок
- Настройка alias для новых путей
- Создание индексных файлов

### Этап 2: Миграция shared
- Перемещение atoms компонентов
- Перемещение molecules компонентов
- Перемещение API сервисов
- Перемещение утилит

### Этап 3: Создание entities
- Выделение сущностей пользователя
- Выделение сущностей заказов
- Выделение сущностей продуктов
- Выделение сущностей организации

### Этап 4: Миграция features
- Перемещение auth компонентов
- Перемещение admin компонентов
- Перемещение inventory компонентов
- Перемещение forecast компонентов

### Этап 5: Миграция widgets
- Перемещение dashboard виджетов
- Перемещение chart виджетов
- Перемещение header виджетов

### Этап 6: Миграция pages
- Перемещение страниц
- Обновление роутинга
- Обновление импортов

### Этап 7: Миграция app
- Перемещение провайдеров
- Перемещение макетов
- Обновление корневого компонента

## 5. Критерии успешности миграции

1. **Соблюдение правил импорта FSD**
2. **Отсутствие циклических зависимостей**
3. **Четкое разделение ответственности**
4. **Переиспользуемость компонентов**
5. **Масштабируемость архитектуры**

## 6. Риски и их митигация

### Риски:
1. Поломка существующих импортов
2. Потеря функциональности
3. Увеличение времени сборки
4. Сложность отладки

### Митигация:
1. Постепенная миграция по слоям
2. Автоматизированное тестирование
3. Alias для совместимости
4. Детальная документация изменений

## 7. Инструменты для миграции

1. **ESLint plugin** для проверки FSD правил
2. **Codemods** для автоматического рефакторинга
3. **Dependency-cruiser** для анализа зависимостей
4. **Jest** для тестирования после миграции

## 8. Временная оценка

- **Этап 1-2**: 1-2 недели
- **Этап 3-4**: 2-3 недели  
- **Этап 5-6**: 1-2 недели
- **Этап 7**: 1 неделя
- **Тестирование и отладка**: 1-2 недели

**Общее время**: 6-10 недель
