
# Документация по компонентам системы управления складом

Этот документ предоставляет подробное описание каждого компонента, используемого в приложении, их назначение, принимаемые `props`, внутреннее состояние и взаимодействия.

---

## Содержание

1.  [**Основная структура (`App.tsx`, `index.tsx`)**](#1-основная-структура-apptsx-indextsx)
2.  [**Провайдеры контекста (`contexts/`)**](#2-провайдеры-контекста-contexts)
    *   [ToastProvider](#toastprovider)
3.  [**Общие компоненты (`components/shared/`)**](#3-общие-компоненты-componentsshared)
    *   [Header](#header)
    *   [StatCard](#statcard)
    *   [AddProductModal](#addproductmodal)
    *   [ProductDetailModal](#productdetailmodal)
    *   [ToastContainer](#toastcontainer)
    *   [icons](#icons)
4.  [**Компоненты Дашборда (`components/dashboard/`)**](#4-компоненты-дашборда-componentsdashboard)
    *   [DashboardSkeleton](#dashboardskeleton)
    *   [QuickActions](#quickactions)
    *   [DonutChart](#donutchart)
    *   [ReportForm](#reportform)
    *   [ProductList](#productlist)
    *   [ProductItem](#productitem)
5.  [**Компоненты Отчетов (`components/reports/`)**](#5-компоненты-отчетов-componentsreports)
    *   [ReportsPage](#reportspage)
6.  [**Компоненты Аналитики (`components/analytics/`)**](#6-компоненты-аналитики-componentsanalytics)
    *   [AnalyticsPage](#analyticspage)
7.  [**Компоненты Прогноза Продаж (`components/sales-forecast/`)**](#7-компоненты-прогноза-продаж-componentssales-forecast)
    *   [SalesForecastPage](#salesforecastpage)
    *   [MultiSelectDropdown](#multiselectdropdown)
8.  [**API-симуляция (`api.ts`)**](#8-api-симуляция-apits)

---

## 1. Основная структура (`App.tsx`, `index.tsx`)

### `index.tsx`
- **Путь:** `index.tsx`
- **Назначение:** Точка входа в приложение. Отвечает за рендеринг корневого компонента `App` в DOM. Оборачивает `App` в `ToastProvider` для обеспечения глобальной системы уведомлений.

### `App.tsx`
- **Путь:** `App.tsx`
- **Назначение:** Главный компонент приложения, управляющий состоянием, данными и навигацией.
- **Состояние (State):**
  - `products`: `Product[]` - Основной массив всех товаров.
  - `isInitialLoading`: `boolean` - Флаг для отображения скелетона во время первоначальной загрузки данных.
  - `activeFilter`: `ProductStatus | null` - Текущий активный фильтр по статусу товара.
  - `selectedProduct`: `Product | null` - Товар, выбранный для просмотра в модальном окне.
  - `currentView`: `View` - Текущая активная страница ('dashboard', 'reports', 'analytics', 'sales-forecast').
  - `searchQuery`: `string` - Поисковый запрос для фильтрации списка товаров.
  - `isAddModalOpen`: `boolean` - Флаг для открытия/закрытия модального окна добавления товара.
  - `sortConfig`: `SortConfig | null` - Конфигурация сортировки для списка товаров.
- **Логика и Поведение:**
  - **Загрузка данных:** В `useEffect` асинхронно загружает список товаров через `api.fetchProducts`.
  - **Управление данными:** Содержит все функции-обработчики (`handle...`) для CRUD-операций с товарами (добавление, обновление количества и деталей, удаление). Эти функции передаются дочерним компонентам в качестве `props`.
  - **Фильтрация и сортировка:** `useMemo` используется для вычисления `filteredProducts` на основе `activeFilter`, `searchQuery` и `sortConfig`, что обеспечивает высокую производительность.
  - **Навигация:** Управляет отображением различных страниц (`Dashboard`, `ReportsPage` и т.д.) в зависимости от `currentView`.
  - **Управление модальными окнами:** Контролирует открытие и закрытие `ProductDetailModal` и `AddProductModal`.

---

## 2. Провайдеры контекста (`contexts/`)

### `ToastProvider`
- **Путь:** `contexts/ToastProvider.tsx`
- **Назначение:** Предоставляет глобальный доступ к функции `addToast` для отображения всплывающих уведомлений (тостов) из любого компонента в приложении.
- **Контекст:** `ToastContext` предоставляет `addToast(message, type)`.
- **Логика:** Управляет состоянием массива `toasts`. `addToast` добавляет новый тост, а `removeToast` (передаваемый в `ToastContainer`) удаляет его.

---

## 3. Общие компоненты (`components/shared/`)

### `Header`
- **Путь:** `components/shared/Header.tsx`
- **Назначение:** Отображает "шапку" приложения с заголовком и четырьмя карточками статистики.
- **Props:**
  - `stats`: `object` (Required) - Объект со статистикой: `{ total, inStock, lowStock, outOfStock }`.
- **Зависимости:** `StatCard`, `WarehouseIcon`.

### `StatCard`
- **Путь:** `components/shared/StatCard.tsx`
- **Назначение:** Небольшая карточка для отображения одного статистического показателя (название и значение).
- **Props:**
  - `label`: `string` (Required) - Название метрики.
  - `value`: `number` (Required) - Значение метрики.
  - `color`: `string` (Optional) - CSS-класс для цвета значения (например, `text-green-500`).

### `AddProductModal`
- **Путь:** `components/shared/AddProductModal.tsx`
- **Назначение:** Модальное окно с формой для добавления нового товара.
- **Props:**
  - `onClose`: `() => void` (Required) - Функция для закрытия модального окна.
  - `onAddProduct`: `(newProductData) => Promise<void>` (Required) - Callback, вызываемый для сохранения нового товара.
  - `allCategories`: `string[]` (Required) - Массив существующих категорий для автодополнения в поле ввода.
- **Логика:** Управляет состоянием полей формы. При отправке выполняет валидацию, показывает спиннер на кнопке и вызывает `onAddProduct`.

### `ProductDetailModal`
- **Путь:** `components/shared/ProductDetailModal.tsx`
- **Назначение:** Модальное окно для просмотра и редактирования деталей существующего товара.
- **Props:**
  - `product`: `Product` (Required) - Объект товара для отображения.
  - `onClose`: `() => void` (Required) - Функция для закрытия.
  - `onQuantityChange`: `(id, quantity, type) => Promise<void>` (Required) - Callback для изменения количества.
  - `onUpdate`: `(id, updates) => Promise<void>` (Required) - Callback для обновления полей (имя, полка, цена).
  - `onDelete`: `(id) => Promise<void>` (Required) - Callback для удаления товара.
- **Логика:**
  - Имеет два режима: просмотр и редактирование (`isEditing`).
  - В режиме редактирования поля становятся инпутами.
  - `handleSave` собирает все изменения и отправляет их через `Promise.all`.
  - `handleDelete` запрашивает подтверждение через `window.confirm`.
  - Отображает историю операций по товару в прокручиваемом списке.

### `ToastContainer`
- **Путь:** `components/shared/ToastContainer.tsx`
- **Назначение:** Контейнер, который отображает все активные всплывающие уведомления.
- **Props:**
  - `toasts`: `Toast[]` (Required) - Массив объектов тостов для отображения.
  - `onRemove`: `(id) => void` (Required) - Функция для удаления тоста.
- **Логика:** Каждый `ToastMessage` имеет таймер самоуничтожения (5 секунд) и анимацию появления/исчезновения.

### `icons`
- **Путь:** `components/shared/icons.tsx`
- **Назначение:** Файл, экспортирующий все SVG-иконки приложения в виде React-компонентов для удобного переиспользования и стилизации.

---

## 4. Компоненты Дашборда (`components/dashboard/`)

### `DashboardSkeleton`
- **Путь:** `components/dashboard/DashboardSkeleton.tsx`
- **Назначение:** Отображает "скелет" интерфейса (серые анимированные блоки) во время загрузки основных данных. Улучшает UX, показывая, что контент скоро появится.

### `QuickActions`
- **Путь:** `components/dashboard/QuickActions.tsx`
- **Назначение:** Виджет, который показывает круговую диаграмму (`DonutChart`) распределения товаров по статусам и позволяет фильтровать основной список по клику на статус.
- **Props:**
  - `products`: `Product[]` (Required) - Массив всех товаров для расчета статистики.
  - `onFilterChange`: `(status | null) => void` (Required) - Callback для установки фильтра в `App.tsx`.
  - `activeFilter`: `ProductStatus | null` (Required) - Текущий активный фильтр для подсветки.

### `DonutChart`
- **Путь:** `components/dashboard/DonutChart.tsx`
- **Назначение:** Переиспользуемый компонент для отображения круговой диаграммы с "дыркой" в центре. Использует библиотеку `recharts`.
- **Props:**
  - `data`: `object[]` (Required) - Массив данных для диаграммы.
  - `total`: `number` (Required) - Общее число, отображаемое в центре.
  - `onSliceClick`: `(payload) => void` (Optional) - Callback при клике на сектор диаграммы.

### `ReportForm`
- **Путь:** `components/dashboard/ReportForm.tsx`
- **Назначение:** Форма для отправки "отчета о нехватке" товара.
- **Props:**
  - `products`: `Product[]` (Required) - Список товаров для выпадающего меню.
  - `onReportSubmit`: `(productId) => Promise<void>` (Required) - Callback для отправки отчета.
- **Логика:** Позволяет выбрать товар, указать дату/время и отправить отчет.

### `ProductList`
- **Путь:** `components/dashboard/ProductList.tsx`
- **Назначение:** Основной компонент дашборда, отображающий список товаров в виде таблицы с поиском, сортировкой и кнопкой добавления.
- **Props:**
  - `products`: `Product[]` (Required) - Отфильтрованный и отсортированный список товаров для отображения.
  - `onSelectProduct`: `(product) => void` (Required) - Callback при клике на строку товара.
  - `filter`, `searchQuery`, `sortConfig`: Состояние фильтров/сортировки для отображения информации пользователю.
  - `onSearchChange`, `onAddProductClick`, `onSort`: Функции-обработчики для взаимодействия с пользователем.
- **Зависимости:** `ProductItem`, `SortableHeader` (внутренний компонент).

### `ProductItem`
- **Путь:** `components/dashboard/ProductItem.tsx`
- **Назначение:** Одна строка (`<tr>`) в таблице `ProductList`, представляющая один товар.
- **Props:**
  - `product`: `Product` (Required) - Данные товара для отображения.
  - `onSelect`: `(product) => void` (Required) - Callback, вызываемый при клике на строку.
- **Логика:** Применяет разный цвет для статуса товара (`getStatusClasses`).

---

## 5. Компоненты Отчетов (`components/reports/`)

### `ReportsPage`
- **Путь:** `components/reports/ReportsPage.tsx`
- **Назначение:** Страница для просмотра полной истории всех операций по всем товарам.
- **Props:**
  - `products`: `Product[]` (Required) - Полный список товаров для извлечения истории.
- **Логика:**
  - **Агрегация:** `useMemo` используется для создания единого плоского массива `filteredHistory` из историй всех товаров.
  - **Фильтрация:** Позволяет фильтровать историю по периоду (7/30 дней) и типу операции.
  - **Экспорт в CSV:** Реализована функция `handleDownloadCSV` для скачивания отфильтрованного отчета.

---

## 6. Компоненты Аналитики (`components/analytics/`)

### `AnalyticsPage`
- **Путь:** `components/analytics/AnalyticsPage.tsx`
- **Назначение:** Главный контейнер для страниц аналитики с навигацией по вкладкам.
- **Props:**
  - `products`: `Product[]` (Required) - Все товары для проведения анализа.
- **Логика:** Управляет состоянием `activeTab` для переключения между "Детальным анализом", "ABC-анализом" и "XYZ-анализом".
- **Внутренние компоненты:**
  - **`DetailedAnalysis`**: Позволяет выбрать один товар и просмотреть график динамики его остатков и ключевые KPI (средний расход, прогноз остатка и т.д.).
  - **`AbcAnalysis`**: Автоматически рассчитывает и отображает ABC-анализ на основе объема продаж. Включает гистограмму и детальную таблицу.
  - **`XyzAnalysis`**: Асинхронно запрашивает метрики через `api.fetchItemMetrics` и проводит XYZ-анализ по стабильности спроса (на основе MAPE).

---

## 7. Компоненты Прогноза Продаж (`components/sales-forecast/`)

### `SalesForecastPage`
- **Путь:** `components/sales-forecast/SalesForecastPage.tsx`
- **Назначение:** Интерактивная страница для создания и анализа прогнозов продаж.
- **Props:**
  - `products`: `Product[]` (Required) - Список товаров.
- **Логика:**
  - **Два режима:** "Детальный анализ" (прогноз для одного товара с "what-if" анализом цены) и "Сравнительный анализ" (прогноз для нескольких товаров).
  - **Взаимодействие с API:** Вызывает функции `api.requestSalesForecast`, `api.requestComparativeForecast`, `api.fetchProductSnapshot`.
  - **Контекст прогноза:** Перед созданием прогноза для товара загружает его "снимок" (недавние продажи), чтобы дать пользователю контекст.
  - **Предупреждения:** Показывает предупреждение о низкой точности, если у товара недостаточно истории продаж.
  - **История прогнозов:** Сохраняет и отображает историю созданных прогнозов с пагинацией.

### `MultiSelectDropdown`
- **Путь:** `components/sales-forecast/MultiSelectDropdown.tsx`
- **Назначение:** Переиспользуемый выпадающий список с возможностью множественного выбора. Используется в сравнительном анализе.
- **Props:**
  - `options`: `Option[]` (Required) - Все доступные варианты для выбора.
  - `selectedIds`: `string[]` (Required) - Массив ID выбранных элементов.
  - `onChange`: `(ids) => void` (Required) - Callback при изменении выбора.
- **UI/UX:** Отображает выбранные элементы в виде тегов внутри поля ввода.

---

## 8. API-симуляция (`api.ts`)

- **Путь:** `api.ts`
- **Назначение:** Модуль, имитирующий бэкенд-API. Отвечает за всю логику работы с данными: чтение и запись в `localStorage`, симуляция задержек сети и ошибок.
- **Ключевые функции:**
  - `fetchProducts`: Загружает товары из `localStorage`.
  - `addProduct`, `updateProductDetails`, `updateProductQuantity`, `deleteProduct`: CRUD-операции.
  - `requestSalesForecast`, `requestComparativeForecast`: Имитация запросов к AI-модели для прогнозирования. Логика включает симуляцию ценовой эластичности.
  - `fetchItemMetrics`, `fetchOverallMetrics`: Имитация получения метрик качества модели.
- **Особенности:**
  - Все функции обернуты в `simulateApi` для имитации асинхронности и случайных ошибок, что помогает тестировать обработку ошибок в UI.
  - Использует `localStorage` для персистентности данных между сессиями.
  - Инициализирует склад начальными данными из `constants.ts`, если `localStorage` пуст.
