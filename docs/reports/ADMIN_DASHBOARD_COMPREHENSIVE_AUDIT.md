# Исчерпывающий функциональный аудит веб-интерфейса "Admin Dashboard"

**Дата аудита:** 2025-01-16  
**Цель:** Провести комплексный анализ UX/UI, бэкенд-архитектуры, API эндпоинтов и структуры базы данных админ-панели

---

## Часть 1: UX/UI Аудит

### 1.1 Общее впечатление и навигация

#### Текущая структура:
- ✅ **Классическая админ-панель** с боковой навигационной панелью (sidebar) слева
- ✅ **Адаптивный дизайн** с возможностью сворачивания сайдбара
- ✅ **Логическое группирование** меню на "Основное меню" и "Дополнительно"
- ✅ **Иконки Lucide React** для улучшения визуального восприятия

#### Структура навигации:
```typescript
// Основное меню
- Dashboard (Общий обзор, Настройка виджетов)
- Прогнозирование продаж
- Тест API прогноза
- Доступность товаров на полке
- Отчеты (По продажам, товарам, локациям)
- Товары (Управление, категории, группы, виды, производители)
- Организации/Точки (Управление организациями, точками, поставщиками)
- Административная панель (Пользователи, организации, роли, поставщики)
- Настройки (Организации, системы)

// Дополнительно
- Интеграции (API подключения, импорт/экспорт)
- Помощь (Документация, поддержка)
```

#### Сильные стороны:
- ✅ **Четкая навигация** с логическим разделением функций
- ✅ **Hover-эффекты** для улучшения интерактивности
- ✅ **Состояние активного пункта** меню
- ✅ **Мобильная адаптивность** с "бургер-меню"

#### Проблемы и рекомендации:

1. **Дублирование разделов:**
   - ❌ "Организации/Точки" и "Административная панель" содержат похожие функции
   - 🔧 **Рекомендация:** Объединить в единый раздел "Управление системой"

2. **Отсутствие глобального поиска:**
   - ❌ Нет глобального поиска в хедере
   - 🔧 **Рекомендация:** Добавить поиск по всем сущностям системы

3. **Кастомизация дашборда:**
   - ⚠️ Есть пункт "Настройка виджетов", но функциональность не реализована
   - 🔧 **Рекомендация:** Реализовать drag-and-drop настройку виджетов

### 1.2 Главная страница дашборда

#### Текущее состояние:
```typescript
// Компоненты дашборда
<EcommerceMetrics />      // Основные метрики
<MonthlySalesChart />     // График продаж
<MonthlyTarget />         // Целевые показатели
<StatisticsChart />       // Статистика
<DemographicCard />       // Демография
<RecentOrders />          // Последние заказы
```

#### Анализ виджетов:
- ✅ **Информативный дашборд** с ключевыми метриками
- ✅ **Адаптивная сетка** для различных размеров экранов
- ⚠️ **Статичные виджеты** без возможности настройки

#### Рекомендации по улучшению:
1. **Настраиваемые виджеты:**
   ```typescript
   interface DashboardWidget {
     id: string;
     type: 'metric' | 'chart' | 'table';
     title: string;
     position: { x: number; y: number };
     size: { width: number; height: number };
     config: Record<string, any>;
   }
   ```

2. **Фильтрация по периодам:**
   - Добавить глобальный фильтр даты для всех виджетов
   - Сохранение выбранного периода в localStorage

3. **Роль-ориентированные дашборды:**
   - Разные наборы виджетов для разных ролей
   - Персонализация на основе organization_id

### 1.3 Доступность (Accessibility)

#### Текущее состояние:
- ❌ **Отсутствуют ARIA-атрибуты** для интерактивных элементов
- ❌ **Нет полной навигации с клавиатуры**
- ❌ **Недостаточный контраст** в некоторых элементах

#### Рекомендации:
```typescript
// Добавить ARIA-атрибуты
<nav aria-label="Основная навигация">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" aria-expanded="false" aria-haspopup="true">
        Dashboard
      </a>
    </li>
  </ul>
</nav>

// Обеспечить навигацию с клавиатуры
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    toggleSubmenu();
  }
};
```

---

## Часть 2: Бэкенд-логика и функциональность

### 2.1 Аутентификация и Авторизация (RBAC)

#### Текущее состояние:
```typescript
// Middleware для проверки ролей
export function rbacMiddleware(allowedRoles: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    // Простая проверка по ролям
    if (allowedRoles.length && !allowedRoles.includes(req.user.role || '')) {
      res.status(403).json({ error: 'Insufficient role' });
      return;
    }
    // TODO: Проверка по permissions
    next();
  };
}
```

#### Проблемы:
- ❌ **Неполная реализация RBAC** - отсутствует система разрешений
- ❌ **Нет проверки маршрутов на фронтенде** по ролям
- ❌ **Отсутствует аудит действий** администраторов

#### Рекомендации:

1. **Полноценная система RBAC:**
```sql
-- Расширенная схема RBAC
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  resource VARCHAR(50) NOT NULL, -- users, products, orders
  action VARCHAR(50) NOT NULL,   -- create, read, update, delete
  description TEXT
);

CREATE TABLE role_permissions (
  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

2. **Защита маршрутов на фронтенде:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = []
}) => {
  const { user, hasPermission, hasRole } = useAuth();
  
  if (!user) return <Navigate to="/signin" />;
  
  if (requiredRoles.length && !requiredRoles.some(role => hasRole(role))) {
    return <AccessDenied />;
  }
  
  if (requiredPermissions.length && !requiredPermissions.some(perm => hasPermission(perm))) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
};
```

3. **Система аудита:**
```typescript
// Логирование действий администраторов
export const auditLogger = {
  log: async (action: string, details: any) => {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [req.user.id, action, JSON.stringify(details), req.ip]
    );
  }
};
```

### 2.2 Управление данными (CRUD операции)

#### Текущее состояние:
- ✅ **Базовые CRUD операции** для пользователей реализованы
- ⚠️ **Отсутствует валидация** на бэкенде
- ❌ **Нет транзакций** для связанных операций
- ❌ **Физическое удаление** вместо "мягкого"

#### Рекомендации:

1. **Валидация на бэкенде:**
```typescript
import Joi from 'joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  full_name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('admin', 'manager', 'employee').required(),
  organization_id: Joi.number().integer().positive().required()
});

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

2. **Транзакции для связанных операций:**
```typescript
export const createUserWithProfile = async (userData: any) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Создание пользователя в Supabase
    const { data: supabaseUser } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });
    
    // Создание профиля в БД
    await client.query(
      'INSERT INTO users (id, email, full_name, organization_id, role) VALUES ($1, $2, $3, $4, $5)',
      [supabaseUser.user.id, userData.email, userData.full_name, userData.organization_id, userData.role]
    );
    
    await client.query('COMMIT');
    return supabaseUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

3. **Мягкое удаление:**
```sql
-- Добавить поля для soft delete
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMPTZ;

-- Представления для активных записей
CREATE VIEW active_users AS 
SELECT * FROM users WHERE deleted_at IS NULL;
```

### 2.3 Многоорганизационность

#### Текущее состояние:
- ✅ **Поддержка organization_id** в основных таблицах
- ⚠️ **Неполная фильтрация** по организации во всех запросах
- ❌ **Отсутствует изоляция данных** между организациями

#### Рекомендации:

1. **Middleware для фильтрации по организации:**
```typescript
export const organizationFilter = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.organization_id) {
    return res.status(403).json({ error: 'Organization not found' });
  }
  
  // Добавляем organization_id в контекст запроса
  req.organizationId = req.user.organization_id;
  next();
};
```

2. **Row Level Security (RLS) в Supabase:**
```sql
-- Включить RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Users can only see their organization data" ON users
  FOR ALL USING (organization_id = current_setting('app.current_organization_id')::bigint);
```

---

## Часть 3: API Эндпоинты

### 3.1 Текущие эндпоинты

#### Реализованные:
```typescript
// Аутентификация
POST /auth/login
POST /auth/logout
GET /auth/me

// Администрирование
POST /admin/users  // Создание пользователя
```

#### Отсутствующие критические эндпоинты:
- ❌ Управление пользователями (GET, PUT, DELETE)
- ❌ Управление ролями и разрешениями
- ❌ Дашборд статистики
- ❌ Настройки системы
- ❌ Аудит логи

### 3.2 Предлагаемая архитектура RESTful API

```typescript
// Аутентификация и авторизация
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET /api/auth/me

// Дашборд
GET /api/dashboard/stats
Response: {
  kpi: {
    totalUsers: number,
    totalProducts: number,
    totalOrganizations: number,
    monthlyRevenue: number,
    activeUsers: number
  },
  recentActivities: Array<{
    id: string,
    type: 'user_created' | 'product_updated' | 'order_placed',
    description: string,
    timestamp: string,
    user: string
  }>,
  stockAlerts: Array<{
    productId: string,
    productName: string,
    currentStock: number,
    threshold: number,
    location: string
  }>
}

// Управление пользователями
GET /api/admin/users?role={role}&organization_id={id}&q={query}&page={page}&limit={limit}
POST /api/admin/users
GET /api/admin/users/{id}
PUT /api/admin/users/{id}
DELETE /api/admin/users/{id} // Soft delete

// Управление ролями и разрешениями
GET /api/admin/roles
POST /api/admin/roles
PUT /api/admin/roles/{id}
DELETE /api/admin/roles/{id}
GET /api/admin/permissions
POST /api/admin/roles/{id}/permissions
DELETE /api/admin/roles/{id}/permissions/{permissionId}

// Управление организациями
GET /api/admin/organizations
POST /api/admin/organizations
GET /api/admin/organizations/{id}
PUT /api/admin/organizations/{id}
DELETE /api/admin/organizations/{id}

// Управление товарами
GET /api/admin/products?category={id}&organization_id={id}&q={query}&status={status}
POST /api/admin/products
GET /api/admin/products/{id}
PUT /api/admin/products/{id}
DELETE /api/admin/products/{id}

// Отчеты и аналитика
GET /api/admin/reports/sales?period={period}&organization_id={id}
GET /api/admin/reports/inventory?location_id={id}
GET /api/admin/reports/users?role={role}&activity={active|inactive}

// Логи аудита
GET /api/admin/audit-logs?user_id={id}&action={action}&date_from={date}&date_to={date}

// Настройки системы
GET /api/admin/settings
PUT /api/admin/settings
GET /api/admin/settings/{key}
PUT /api/admin/settings/{key}

// Интеграции
GET /api/admin/integrations
POST /api/admin/integrations
PUT /api/admin/integrations/{id}
DELETE /api/admin/integrations/{id}
```

### 3.3 Обработка ошибок и валидация

#### Рекомендуемая структура ответов:
```typescript
// Успешный ответ
{
  success: true,
  data: any,
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Ошибка
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND',
    message: string,
    details?: any
  }
}
```

---

## Часть 4: Структура Базы Данных

### 4.1 Текущая схема

#### Существующие таблицы:
- ✅ `organizations` - организации
- ✅ `users` - пользователи с привязкой к организации
- ✅ `roles` - роли (частично реализовано)
- ✅ `permissions` - разрешения (частично реализовано)
- ✅ `products` - товары
- ✅ `locations` - локации/точки продаж

### 4.2 Предлагаемые улучшения схемы

```sql
-- Расширение таблицы пользователей для soft delete
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMPTZ;

-- Полная реализация RBAC
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Связь пользователей с ролями (многие-ко-многим)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);

-- Таблица для аудита действий
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  organization_id BIGINT REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Настройки системы
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id),
  key VARCHAR(100) NOT NULL,
  value JSONB,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, key)
);

-- Сессии пользователей
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Уведомления
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id BIGINT REFERENCES organizations(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
```

### 4.3 Базовые роли и разрешения

```sql
-- Вставка системных ролей
INSERT INTO roles (organization_id, code, name, description, is_system) VALUES
(NULL, 'super_admin', 'Супер Администратор', 'Полный доступ ко всей системе', TRUE),
(NULL, 'admin', 'Администратор', 'Администратор организации', TRUE),
(NULL, 'manager', 'Менеджер', 'Менеджер с ограниченными правами', TRUE),
(NULL, 'employee', 'Сотрудник', 'Базовый пользователь', TRUE);

-- Вставка базовых разрешений
INSERT INTO permissions (code, name, resource, action, description) VALUES
-- Пользователи
('users.create', 'Создание пользователей', 'users', 'create', 'Создание новых пользователей'),
('users.read', 'Просмотр пользователей', 'users', 'read', 'Просмотр списка пользователей'),
('users.update', 'Редактирование пользователей', 'users', 'update', 'Редактирование данных пользователей'),
('users.delete', 'Удаление пользователей', 'users', 'delete', 'Удаление пользователей'),

-- Товары
('products.create', 'Создание товаров', 'products', 'create', 'Создание новых товаров'),
('products.read', 'Просмотр товаров', 'products', 'read', 'Просмотр каталога товаров'),
('products.update', 'Редактирование товаров', 'products', 'update', 'Редактирование данных товаров'),
('products.delete', 'Удаление товаров', 'products', 'delete', 'Удаление товаров'),

-- Организации
('organizations.create', 'Создание организаций', 'organizations', 'create', 'Создание новых организаций'),
('organizations.read', 'Просмотр организаций', 'organizations', 'read', 'Просмотр списка организаций'),
('organizations.update', 'Редактирование организаций', 'organizations', 'update', 'Редактирование данных организаций'),
('organizations.delete', 'Удаление организаций', 'organizations', 'delete', 'Удаление организаций'),

-- Отчеты
('reports.sales', 'Отчеты по продажам', 'reports', 'read', 'Просмотр отчетов по продажам'),
('reports.inventory', 'Отчеты по инвентарю', 'reports', 'read', 'Просмотр отчетов по инвентарю'),
('reports.financial', 'Финансовые отчеты', 'reports', 'read', 'Просмотр финансовых отчетов'),

-- Настройки
('settings.read', 'Просмотр настроек', 'settings', 'read', 'Просмотр настроек системы'),
('settings.update', 'Изменение настроек', 'settings', 'update', 'Изменение настроек системы'),

-- Аудит
('audit.read', 'Просмотр логов аудита', 'audit', 'read', 'Просмотр логов действий пользователей');
```

---

## Часть 5: Приоритетные улучшения

### 5.1 Критические (немедленные)

1. **Безопасность и авторизация:**
   - ✅ Реализовать полноценную систему RBAC с разрешениями
   - ✅ Добавить защиту маршрутов на фронтенде по ролям
   - ✅ Внедрить систему аудита действий администраторов
   - ✅ Реализовать мягкое удаление для критических сущностей

2. **Валидация и обработка ошибок:**
   - ✅ Добавить валидацию на бэкенде для всех API эндпоинтов
   - ✅ Реализовать транзакции для связанных операций
   - ✅ Стандартизировать формат ответов API

### 5.2 Высокий приоритет (краткосрочные)

1. **UX/UI улучшения:**
   - ✅ Добавить глобальный поиск по системе
   - ✅ Реализовать пакетные действия в таблицах
   - ✅ Добавить валидацию форм в реальном времени
   - ✅ Улучшить мобильную адаптивность

2. **Функциональность:**
   - ✅ Настраиваемые дашборды для разных ролей
   - ✅ Система уведомлений для администраторов
   - ✅ Экспорт данных в Excel/CSV

### 5.3 Средний приоритет (среднесрочные)

1. **Аналитика и отчеты:**
   - ✅ Расширенная аналитика пользовательской активности
   - ✅ Настраиваемые отчеты
   - ✅ Графики и диаграммы в реальном времени

2. **Интеграции:**
   - ✅ API для внешних интеграций
   - ✅ Webhooks для уведомлений
   - ✅ Импорт/экспорт данных

### 5.4 Низкий приоритет (долгосрочные)

1. **Продвинутые функции:**
   - ✅ Многоязычность интерфейса
   - ✅ Темная тема
   - ✅ Расширенная кастомизация интерфейса

---

## Часть 6: Метрики для оценки успеха

### 6.1 Производительность
- **Время загрузки дашборда:** < 2 секунд
- **Время выполнения CRUD операций:** < 500ms
- **Время отклика API:** < 200ms для простых запросов

### 6.2 Безопасность
- **Покрытие RBAC:** 100% защищенных эндпоинтов
- **Аудит действий:** 100% критических операций логируются
- **Валидация:** 0 незащищенных входных данных

### 6.3 Удобство использования
- **Сокращение времени на типовые задачи:** 50% улучшение
- **Снижение количества ошибок:** 70% уменьшение
- **Удовлетворенность пользователей:** > 8/10 в опросах

### 6.4 Техническое качество
- **Покрытие тестами:** > 80%
- **Время восстановления после сбоя:** < 5 минут
- **Доступность системы:** > 99.9%

---

## Заключение

Текущая реализация админ-панели имеет хорошую основу с правильной архитектурой, но требует значительных улучшений в области безопасности, валидации данных и пользовательского опыта. Приоритетные улучшения должны быть направлены на:

1. **Безопасность** - полноценная RBAC система и аудит
2. **Надежность** - валидация, транзакции и обработка ошибок  
3. **Удобство** - улучшение UX/UI и функциональности

Реализация предложенных улучшений позволит создать профессиональную, безопасную и удобную административную панель, соответствующую современным стандартам разработки. 

## Что дальше?

После запуска фронтенда вы можете:

1. **Посмотреть новый компонент**: 
   - Откройте браузер на `http://localhost:5173`
   - Перейдите к новому компоненту админ-панели

2. **Применить стили к существующей админ-панели**:
   ```bash
   cd scripts
   node migrate-admin-styles.js
   ```

3. **Добавить CSS-переменные в проект**:
   - Скопируйте CSS из `ADMIN_PANEL_INTEGRATION_GUIDE.md` 
   - Добавьте в `frontend/src/index.css`

## Основная идея

Проблема была в том, что у вас **два разных стиля** админ-панели:
- **Основная система**: сложная, с дизайн-токенами
- **Импортированная панель**: простая, с базовыми стилями

Я создал **унифицированную систему стилей** с префиксом `admin-*`, которая:
- Объединяет оба подхода
- Автоматически мигрирует старые стили
- Обеспечивает единообразие

Хотите, чтобы я показал, как интегрировать эти стили в ваш текущий проект? 