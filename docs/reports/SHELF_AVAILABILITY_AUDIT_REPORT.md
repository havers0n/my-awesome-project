# Исчерпывающий функциональный аудит веб-интерфейса "Shelf Availability"

**Дата аудита:** 2025-01-16  
**URL интерфейса:** http://localhost:5174/inventory/shelf-availability  
**Цель:** Провести комплексный анализ UX/UI, бэкенд-архитектуры, API эндпоинтов и структуры базы данных

---

## Часть 1: UX/UI Аудит

### 1.1 Общее впечатление и навигация

#### Сильные стороны:
- ✅ **Четкая структура страницы** с логическим разделением на блоки: сводка, отчеты, статус товаров
- ✅ **Эффективная цветовая схема** с семантическим значением:
  - Синий (brand-500) для общих показателей
  - Зеленый (success-500) для товаров в наличии
  - Желтый (warning-500) для заканчивающихся товаров
  - Красный (error-500) для отсутствующих товаров
- ✅ **Использование иконок Lucide React** для улучшения визуального восприятия
- ✅ **Адаптивный дизайн** с grid-системой для различных размеров экранов

#### Проблемы и рекомендации:
- ⚠️ **Дублирование информации** между верхними карточками и статистикой не критично, но может быть оптимизировано
- ❌ **Отсутствует индикация обновления** данных в реальном времени
- ❌ **Нет визуальной обратной связи** о состоянии загрузки данных в основном интерфейсе
- 🔧 **Рекомендация:** Добавить индикаторы последнего обновления и статуса соединения

### 1.2 Блок "Сообщить об отсутствии товара"

#### Анализ юзабилити:
- ✅ **Интуитивно понятная форма** с четким разделением между выбором из списка и ручным вводом
- ✅ **Гибкость выбора** через чекбокс "Ввести название вручную"
- ⚠️ **Раздельные поля для часов и минут** могут быть неудобными для пользователей

#### Рекомендации по улучшению:
1. **Валидация формы:**
   ```typescript
   // Добавить клиентскую валидацию
   const validateForm = () => {
     if (!productName) return "Выберите или введите название товара";
     if (hours === 0 && minutes === 0) return "Укажите время отсутствия";
     if (minutes > 59) return "Минуты не могут быть больше 59";
     return null;
   };
   ```

2. **Улучшенный UX:**
   - Добавить автокомплит для ручного ввода названий товаров
   - Рассмотреть единое поле времени или кнопку "Сообщить сейчас"
   - Реализовать немедленное отображение успешной отправки

3. **Обратная связь:**
   ```typescript
   // Добавить состояния для обратной связи
   const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
   const [message, setMessage] = useState('');
   ```

### 1.3 Блок "Product Status"

#### Эффективность поиска и фильтрации:
- ✅ **Поиск работает** по названию товара и полке - функциональность достаточная
- ✅ **Фильтр по статусам** предоставляет необходимые опции
- ❌ **Отсутствует сортировка** по различным критериям

#### Доступность (Accessibility):
- ✅ **Цветовая кодировка дополнена текстовыми метками** - хорошо для accessibility
- ❌ **Отсутствуют ARIA-метки** для screen readers
- 🔧 **Рекомендация:** Добавить ARIA-описания для статусов товаров

#### Возможные улучшения:
- **Действия для каждой строки товара:**
  - Кнопка "Редактировать количество"
  - Кнопка "Запросить пополнение"
  - Кнопка "Просмотр истории"
- **Bulk-операции** для множественного выбора товаров
- **Экспорт данных** в Excel/CSV формате

---

## Часть 2: Бэкенд-логика и функциональность

### 2.1 Логика статусов товаров

#### Текущая реализация:
```sql
-- Из database/20250708_create_api_get_shelf_availability.sql
CASE
  WHEN available_stock <= 0 THEN 'out_of_stock'
  WHEN available_stock < (total_stock * 0.1) THEN 'critical'
  WHEN available_stock < (total_stock * 0.3) THEN 'low_stock'
  ELSE 'available'
END AS status
```

#### Рекомендации по улучшению:
1. **Настраиваемые пороги на уровне организации:**
   ```sql
   -- Добавить таблицу для настройки порогов
   CREATE TABLE inventory_thresholds (
     organization_id BIGINT,
     product_id BIGINT,
     low_stock_threshold DECIMAL DEFAULT 0.3,
     critical_stock_threshold DECIMAL DEFAULT 0.1
   );
   ```

2. **Учет времени с момента последнего пополнения**
3. **Предиктивная логика на основе скорости продаж**

### 2.2 Обработка отчетов об отсутствии

#### Текущий процесс:
1. Создание записи в `out_of_stock_items`
2. Расчет времени отсутствия через функцию `api_get_shelf_availability`
3. Обновление статуса товара

#### Необходимые улучшения:
- **Автоматическое создание задач** для менеджеров
- **Интеграция с системой уведомлений**
- **Workflow для обработки и закрытия отчетов**
- **Эскалация критических случаев**

### 2.3 Обновления в реальном времени

#### Текущее состояние: 
❌ **Отсутствует real-time функциональность**

#### Рекомендации:
```typescript
// Реализовать WebSocket соединения
const useRealtimeInventory = () => {
  useEffect(() => {
    const channel = supabase
      .channel('inventory-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'operations'
      }, (payload) => {
        // Обновить состояние товаров
        updateInventoryState(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
```

---

## Часть 3: API Эндпоинты

### 3.1 Предлагаемая архитектура RESTful API

#### Основные эндпоинты:

```typescript
// 1. Получение статистики инвентаря
GET /api/inventory/stats
Response: {
  totalProducts: number,
  availableCount: number,
  lowStockCount: number,
  criticalCount: number,
  outOfStockCount: number,
  lastUpdated: string
}

// 2. Получение списка товаров для выпадающего меню
GET /api/products?organization_id={id}
Response: {
  products: Array<{
    id: string,
    name: string,
    sku: string,
    category: string
  }>
}

// 3. Получение товаров с фильтрацией и поиском
GET /api/inventory/products?status={status}&q={query}&page={page}&limit={limit}&sort={field}&order={asc|desc}
Response: {
  data: Array<ProductAvailability>,
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  filters: {
    availableStatuses: string[],
    availableLocations: string[]
  }
}

// 4. Отправка отчета об отсутствии товара
POST /api/inventory/report-out-of-stock
Request Body: {
  productId?: string,
  manualProductName?: string,
  hoursOutOfStock: number,
  minutesOutOfStock: number,
  reportedAt: string,
  locationId?: string,
  notes?: string
}
Response: {
  success: boolean,
  reportId: string,
  message: string,
  taskId?: string // ID созданной задачи для менеджера
}

// 5. Получение зарегистрированных отчетов
GET /api/inventory/out-of-stock-reports?status={status}&page={page}&limit={limit}
Response: {
  reports: Array<{
    id: string,
    productName: string,
    hoursOutOfStock: number,
    minutesOutOfStock: number,
    reportedAt: string,
    status: 'pending' | 'in_progress' | 'resolved',
    reporterId: string,
    reporterName: string,
    assignedTo?: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  }>,
  pagination: PaginationInfo
}

// 6. Обновление статуса товара
PUT /api/inventory/products/{id}/status
Request Body: {
  status: ProductStatus,
  quantity?: number,
  notes?: string,
  reason: string
}
Response: {
  success: boolean,
  product: ProductAvailability,
  historyId: string
}

// 7. Получение истории изменений товара
GET /api/inventory/products/{id}/history?page={page}&limit={limit}
Response: {
  history: Array<{
    id: string,
    oldStatus: string,
    newStatus: string,
    oldQuantity: number,
    newQuantity: number,
    changedBy: string,
    changedAt: string,
    reason: string
  }>,
  pagination: PaginationInfo
}

// 8. Массовые операции
POST /api/inventory/products/bulk-update
Request Body: {
  productIds: string[],
  action: 'update_status' | 'request_restock' | 'mark_audited',
  params: Record<string, any>
}

// 9. Экспорт данных
GET /api/inventory/export?format={csv|xlsx}&filters={encoded_filters}
Response: File download

// 10. WebSocket для real-time обновлений
WS /api/inventory/realtime
Events: {
  'product_updated': ProductAvailability,
  'stock_alert': StockAlert,
  'out_of_stock_reported': OutOfStockReport,
  'task_created': InventoryTask,
  'notification': InventoryNotification
}
```

### 3.2 Структуры данных

```typescript
interface ProductAvailability {
  id: string;
  product_name: string;
  sku: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  last_restock_date: string;
  out_of_stock_hours: number | null;
  status: 'available' | 'low_stock' | 'critical' | 'out_of_stock';
  shelf_location: string;
  category: string;
  supplier: string;
  last_updated: string;
}

interface StockAlert {
  id: string;
  product_id: string;
  product_name: string;
  alert_type: 'low_stock' | 'critical' | 'out_of_stock';
  current_stock: number;
  threshold: number;
  created_at: string;
}

interface InventoryTask {
  id: string;
  product_id: string;
  task_type: 'restock' | 'investigate' | 'audit';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  due_date: string;
  created_at: string;
}
```

---

## Часть 4: Структура Базы Данных

### 4.1 Существующие таблицы (анализ)

#### Основные таблицы:
- ✅ `products` - базовая информация о товарах
- ✅ `locations` - информация о местоположениях/полках
- ✅ `operations` - операции с товарами (покупка, продажа)
- ✅ `out_of_stock_items` - отчеты об отсутствии товаров

### 4.2 Предлагаемые дополнения к схеме

```sql
-- 1. Таблица для хранения настроек пороговых значений
CREATE TABLE inventory_thresholds (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  low_stock_threshold DECIMAL DEFAULT 0.3,
  critical_stock_threshold DECIMAL DEFAULT 0.1,
  auto_reorder_threshold DECIMAL DEFAULT 0.05,
  auto_reorder_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, product_id)
);

-- 2. Таблица для отслеживания истории изменений статусов
CREATE TABLE inventory_status_history (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  old_quantity INTEGER,
  new_quantity INTEGER,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  notes TEXT,
  source VARCHAR(50) DEFAULT 'manual' -- 'manual', 'automatic', 'import'
);

-- 3. Таблица для задач менеджеров
CREATE TABLE inventory_tasks (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  out_of_stock_report_id BIGINT REFERENCES out_of_stock_items(id),
  task_type VARCHAR(50) NOT NULL, -- 'restock', 'investigate', 'audit', 'relocate'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completion_notes TEXT
);

-- 4. Таблица для уведомлений
CREATE TABLE inventory_notifications (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES inventory_tasks(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- 'stock_alert', 'task_assigned', 'report_created'
  priority VARCHAR(20) DEFAULT 'medium',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 5. Таблица для алертов и автоматических уведомлений
CREATE TABLE inventory_alerts (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'critical', 'out_of_stock', 'overstock'
  current_value DECIMAL,
  threshold_value DECIMAL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Улучшенная таблица отчетов об отсутствии
ALTER TABLE out_of_stock_items 
ADD COLUMN IF NOT EXISTS reported_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reported_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS estimated_impact VARCHAR(20) DEFAULT 'low'; -- 'low', 'medium', 'high'

-- 7. Таблица для настроек уведомлений пользователей
CREATE TABLE user_notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  delivery_method VARCHAR(20) DEFAULT 'in_app', -- 'in_app', 'email', 'sms'
  frequency VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'hourly', 'daily'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id, notification_type)
);
```

### 4.3 Индексы для оптимизации

```sql
-- Индексы для производительности
CREATE INDEX idx_inventory_thresholds_org_product ON inventory_thresholds(organization_id, product_id);
CREATE INDEX idx_inventory_status_history_product ON inventory_status_history(product_id, changed_at DESC);
CREATE INDEX idx_inventory_tasks_assigned ON inventory_tasks(assigned_to, status, due_date);
CREATE INDEX idx_inventory_tasks_product ON inventory_tasks(product_id, status);
CREATE INDEX idx_inventory_notifications_user ON inventory_notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_inventory_alerts_product ON inventory_alerts(product_id, status, created_at DESC);
CREATE INDEX idx_out_of_stock_items_product ON out_of_stock_items(product_id, status, created_at DESC);

-- Составные индексы для сложных запросов
CREATE INDEX idx_products_org_status ON products(organization_id, name);
CREATE INDEX idx_operations_product_date ON operations(product_id, operation_date DESC);
CREATE INDEX idx_inventory_tasks_org_status_priority ON inventory_tasks(organization_id, status, priority, due_date);
```

### 4.4 Представления для упрощения запросов

```sql
-- Представление для текущего состояния товаров
CREATE OR REPLACE VIEW current_inventory_status AS
WITH stock_calculations AS (
  SELECT 
    p.id as product_id,
    p.organization_id,
    p.name as product_name,
    p.sku,
    COALESCE(SUM(CASE WHEN o.operation_type = 'purchase' THEN o.quantity ELSE 0 END), 0) as total_purchased,
    COALESCE(SUM(CASE WHEN o.operation_type = 'sale' THEN o.quantity ELSE 0 END), 0) as total_sold,
    COALESCE(SUM(CASE WHEN o.operation_type = 'purchase' THEN o.quantity ELSE 0 END) - 
             SUM(CASE WHEN o.operation_type = 'sale' THEN o.quantity ELSE 0 END), 0) as available_stock
  FROM products p
  LEFT JOIN operations o ON p.id = o.product_id
  GROUP BY p.id, p.organization_id, p.name, p.sku
),
threshold_info AS (
  SELECT 
    product_id,
    low_stock_threshold,
    critical_stock_threshold
  FROM inventory_thresholds
),
out_of_stock_duration AS (
  SELECT 
    product_id,
    EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 3600 as hours_out_of_stock
  FROM out_of_stock_items 
  WHERE status = 'pending'
  GROUP BY product_id
)
SELECT 
  sc.product_id,
  sc.organization_id,
  sc.product_name,
  sc.sku,
  sc.total_purchased,
  sc.total_sold,
  sc.available_stock,
  COALESCE(ti.low_stock_threshold, 0.3) as low_stock_threshold,
  COALESCE(ti.critical_stock_threshold, 0.1) as critical_stock_threshold,
  COALESCE(osd.hours_out_of_stock, 0) as hours_out_of_stock,
  CASE 
    WHEN sc.available_stock <= 0 THEN 'out_of_stock'
    WHEN sc.total_purchased > 0 AND sc.available_stock < (sc.total_purchased * COALESCE(ti.critical_stock_threshold, 0.1)) THEN 'critical'
    WHEN sc.total_purchased > 0 AND sc.available_stock < (sc.total_purchased * COALESCE(ti.low_stock_threshold, 0.3)) THEN 'low_stock'
    ELSE 'available'
  END as status
FROM stock_calculations sc
LEFT JOIN threshold_info ti ON sc.product_id = ti.product_id
LEFT JOIN out_of_stock_duration osd ON sc.product_id = osd.product_id;
```

---

## Финальные рекомендации

### Приоритетные улучшения:

#### 🚀 Немедленные (1-2 недели):
1. **Валидация форм и обработка ошибок**
   - Клиентская валидация полей
   - Отображение ошибок сервера
   - Состояния загрузки для всех форм

2. **Feedback после отправки отчетов**
   - Toast-уведомления об успешных операциях
   - Обновление списков без перезагрузки
   - Индикация прогресса

3. **Улучшение accessibility**
   - ARIA-метки для всех интерактивных элементов
   - Keyboard navigation
   - Screen reader support

#### ⚡ Краткосрочные (1 месяц):
1. **Real-time обновления**
   - WebSocket соединения через Supabase Realtime
   - Автоматическое обновление статистики
   - Уведомления о критических изменениях

2. **Настраиваемые пороги**
   - Интерфейс для настройки порогов по товарам
   - Организационные настройки по умолчанию
   - Автоматические алерты

3. **Система задач для менеджеров**
   - Автоматическое создание задач при критических ситуациях
   - Интерфейс управления задачами
   - Система приоритетов и дедлайнов

#### 🎯 Среднесрочные (2-3 месяца):
1. **Аналитика и отчеты**
   - Дашборд с ключевыми метриками
   - Исторические тренды
   - Экспорт данных в различных форматах

2. **Предиктивные алгоритмы**
   - Прогнозирование потребности в товарах
   - Оптимальные сроки заказов
   - Анализ сезонности

3. **Мобильная версия**
   - Responsive design для всех экранов
   - PWA функциональность
   - Offline-режим для критических операций

### Метрики для оценки успеха:

#### Технические метрики:
- **Производительность:** Время отклика интерфейса < 2 секунд
- **Надежность:** Uptime > 99.9%
- **Точность:** Точность отслеживания статусов > 95%

#### Бизнес-метрики:
- **Эффективность:** Снижение времени обработки отчетов об отсутствии на 50%
- **Удовлетворенность:** Пользовательский NPS > 8
- **Использование:** Ежедневная активность пользователей > 80%

#### Операционные метрики:
- **Время реакции:** Среднее время реакции на критические алерты < 15 минут
- **Качество данных:** Процент точных отчетов > 95%
- **Автоматизация:** Доля автоматически созданных задач > 70%

### Заключение

Текущая реализация веб-интерфейса "Shelf Availability" имеет **солидную техническую основу** и **хорошую архитектурную структуру**. Основные компоненты работают корректно, а пользовательский интерфейс интуитивно понятен.

**Ключевые области для улучшения:**
1. **Пользовательский опыт** - необходимо добавить больше интерактивности и обратной связи
2. **Real-time функциональность** - критически важно для мониторинга складских остатков
3. **Автоматизация процессов** - снизит нагрузку на менеджеров и повысит эффективность
4. **Аналитические возможности** - помогут принимать более обоснованные решения

Реализация предложенных улучшений позволит создать **современный, эффективный и удобный инструмент** для управления складскими запасами, который будет соответствовать лучшим практикам в области inventory management.

---

**Подготовлено:** AI Assistant  
**Дата:** 2025-01-16  
**Версия:** 1.0 