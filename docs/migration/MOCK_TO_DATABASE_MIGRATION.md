# 🔄 Миграция от мок данных к реальной базе данных

## 📋 Обзор

Этот документ содержит полный план замены всех мок данных в приложении на реальные данные из базы данных. Включает анализ текущего состояния, пошаговый план миграции и необходимые изменения в коде и схеме БД.

---

## 🔍 Анализ текущих мок данных

### 1. **Пользователи и профили**

#### 📁 Файлы с мок данными:
- `frontend/src/components/UserProfile/UserInfoCard.tsx` - статичные данные профиля
- `frontend/src/constants.ts` - массив INITIAL_USERS
- `workedadminpanel/constants.ts` - массив INITIAL_USERS
- `frontend/src/components/admin/UnifiedAdminExample.tsx` - mockUsers
- `backend/src/test/factories/user.factory.ts` - фабрика тестовых пользователей
- `backend/src/seeds/test/seed.ts` - сиды для тестирования
- `backend/src/__tests__/helpers/testHelpers.ts` - мок пользователь Supabase

#### 🎭 Мок данные:
```typescript
// Имена и роли
{
  name: "Musharof Chowdhury", // UserInfoCard
  email: "randomuser@pimjo.com",
  phone: "+09 363 398 46",
  role: "Web Designer"
}

{
  full_name: "Иванов Иван Иванович", // constants.ts
  email: "ivanov.ii@techno.com",
  role: "MANAGER",
  organization: "ООО Техно"
}

{
  name: "Мария Сидорова", // UnifiedAdminExample
  email: "maria@example.com", 
  role: "Менеджер",
  status: "active"
}
```

#### 🖼️ Изображения пользователей:
- `frontend/public/images/user/user-01.jpg` до `user-38.jpg` (64 файла)
- `frontend/public/images/user/owner.jpg`
- Статичные пути в коде: `"/images/user/user-17.jpg"`

---

### 2. **Товары и инвентарь**

#### 📁 Файлы с мок данными:
- `frontend/src/components/inventory/ShelfAvailabilityMenu.tsx` - generateMockData()
- `frontend/src/modules/inventory/services/inventoryService.ts` - generateMockProductData()
- `frontend/src/modules/inventory/pages/ShelfAvailabilityPage.js` - mockProducts
- `frontend/src/components/inventory/goodversion.md` - документация с моками
- `todev/create.md` - примеры мок данных

#### 🛒 Мок товары:
```typescript
// Основные товары
{
  name: 'Хлеб белый', stock: 45, available: 35, shelf: 'A1-01'
  name: 'Молоко 3.2%', stock: 120, available: 89, shelf: 'B2-03'
  name: 'Масло сливочное', stock: 25, available: 15, shelf: 'C1-05'
  name: 'Яйца куриные', stock: 80, available: 65, shelf: 'D3-02'
  name: 'Сыр российский', stock: 12, available: 3, shelf: 'E2-04'
  name: 'Колбаса докторская', stock: 0, available: 0, shelf: 'F1-06'
}

// Расширенный список (20 товаров)
[
  'Колбаса докторская', 'Сыр российский', 'Молоко 3.2%', 'Хлеб белый',
  'Масло сливочное', 'Яйца куриные', 'Рис круглозерный', 'Гречка ядрица',
  'Чай черный', 'Кофе растворимый', 'Сахар белый', 'Соль поваренная',
  'Макароны спагетти', 'Мука пшеничная', 'Картофель', 'Лук репчатый',
  'Морковь', 'Капуста белокочанная', 'Помидоры', 'Огурцы'
]
```

#### 🏪 Мок полки и статусы:
```typescript
shelves: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2']
status: 'available' | 'low_stock' | 'critical' | 'out_of_stock'
```

---

### 3. **Таблицы и заказы**

#### 📁 Файлы с мок данными:
- `frontend/src/components/tables/BasicTables/BasicTableOne.tsx` - tableData
- `frontend/src/components/ecommerce/RecentOrders.tsx` - tableData

#### 📦 Мок заказы:
```typescript
// Проекты и пользователи
{
  user: {
    image: "/images/user/user-17.jpg",
    name: "Lindsey Curtis",
    role: "Web Designer"
  },
  projectName: "Agency Website",
  budget: "3.9K",
  status: "Active"
}

// Товары e-commerce
{
  name: "MacBook Pro 13"",
  category: "Laptop", 
  price: "$2399.00",
  status: "Delivered",
  image: "/images/product/product-01.jpg"
}
```

---

### 4. **Прогнозы и аналитика**

#### 📁 Файлы с мок данными:
- `backend/src/controllers/forecastController.ts` - мок данные при USE_MOCK_ML=true
- `frontend/INTEGRATION_TEST.md` - тестовые данные для интеграции
- `todev/forecasts1.md` - примеры HTML с моками
- `database/20250709_seed_forecasts_table.sql` - сиды для прогнозов

#### 📊 Мок прогнозы:
```typescript
// Тренды
{
  trend: {
    points: [
      { date: '2024-05-01', value: 120 },
      { date: '2024-05-02', value: 123 },
      { date: '2024-05-03', value: 130 }
    ]
  }
}

// Топ товары
{
  topProducts: [
    { name: 'Молоко', amount: 140, colorClass: 'bg-green-500' },
    { name: 'Хлеб', amount: 90, colorClass: 'bg-yellow-500' },
    { name: 'Яблоки', amount: 60, colorClass: 'bg-red-500' }
  ]
}

// Метрики качества
{
  r2: 0.85, mape: 12.3, mae: 5.4, rmse: 7.3
}
```

---

### 5. **Тестовые данные в базе**

#### 📁 Файлы с сидами:
- `backend/seed_test_data.sql` - основные тестовые данные
- `database/20250709_seed_forecasts_table.sql` - ~100 строк прогнозов
- `backend/src/seeds/test/seed.ts` - TypeScript сиды
- `backend/src/test/fixtures/common.fixtures.ts` - фикстуры для тестов

---

## 🎯 План миграции

### Этап 1: Подготовка базы данных

#### 1.1 Расширение схемы пользователей
```sql
-- Добавить поля для полного профиля пользователя
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ru';

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
```

#### 1.2 Создание таблицы для аватаров
```sql
CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  is_active BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_active_avatar_per_user 
    EXCLUDE (user_id WITH =) WHERE (is_active = true)
);

CREATE INDEX idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX idx_user_avatars_active ON user_avatars(is_active) WHERE is_active = true;
```

#### 1.3 Создание таблицы для остатков на полках
```sql
CREATE TABLE IF NOT EXISTS shelf_availability (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  shelf_location VARCHAR(20) NOT NULL,
  shelf_section VARCHAR(10), -- A, B, C, D
  shelf_level INTEGER, -- 1, 2, 3
  shelf_position INTEGER, -- 01, 02, 03
  
  total_stock INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER DEFAULT 10,
  maximum_stock INTEGER DEFAULT 1000,
  
  last_restock_date DATE,
  last_counted_date DATE,
  out_of_stock_since TIMESTAMPTZ,
  out_of_stock_hours INTEGER DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'available' 
    CHECK (status IN ('available', 'low_stock', 'critical', 'out_of_stock', 'discontinued')),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_stock_consistency 
    CHECK (available_stock + reserved_stock <= total_stock),
  CONSTRAINT check_positive_stock 
    CHECK (total_stock >= 0 AND available_stock >= 0 AND reserved_stock >= 0),
  CONSTRAINT unique_product_location_shelf 
    UNIQUE (product_id, location_id, shelf_location)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_shelf_availability_product_id ON shelf_availability(product_id);
CREATE INDEX idx_shelf_availability_location_id ON shelf_availability(location_id);
CREATE INDEX idx_shelf_availability_status ON shelf_availability(status);
CREATE INDEX idx_shelf_availability_shelf_location ON shelf_availability(shelf_location);
CREATE INDEX idx_shelf_availability_low_stock ON shelf_availability(available_stock) 
  WHERE status IN ('low_stock', 'critical', 'out_of_stock');
```

#### 1.4 Расширение таблицы товаров
```sql
-- Добавить поля для изображений и дополнительной информации
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(20) DEFAULT 'шт';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
```

#### 1.5 Создание таблицы для файлов
```sql
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'product', 'organization'
  entity_id VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  file_category VARCHAR(50), -- 'avatar', 'product_image', 'document'
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_entity_type 
    CHECK (entity_type IN ('user', 'product', 'organization', 'location'))
);

CREATE INDEX idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX idx_file_uploads_category ON file_uploads(file_category);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
```

### Этап 2: Создание API эндпоинтов

#### 2.1 Пользователи
```typescript
// backend/src/routes/userRoutes.ts
GET    /api/users/profile          - получить профиль текущего пользователя
PUT    /api/users/profile          - обновить профиль
POST   /api/users/avatar           - загрузить аватар
DELETE /api/users/avatar           - удалить аватар
GET    /api/users/avatar/:userId   - получить аватар пользователя

// backend/src/routes/adminRoutes.ts  
GET    /api/admin/users            - список пользователей (с фильтрами)
POST   /api/admin/users            - создать пользователя
PUT    /api/admin/users/:id        - обновить пользователя
DELETE /api/admin/users/:id        - удалить пользователя
GET    /api/admin/users/:id        - получить пользователя по ID
```

#### 2.2 Инвентарь
```typescript
// backend/src/routes/inventoryRoutes.ts
GET    /api/inventory/products                    - список товаров
GET    /api/inventory/products/:id                - товар по ID
GET    /api/inventory/shelf-availability          - остатки на полках
GET    /api/inventory/shelf-availability/:id      - остатки конкретного товара
PUT    /api/inventory/shelf-availability/:id      - обновить остатки
POST   /api/inventory/restock                     - пополнить товар
GET    /api/inventory/low-stock                   - товары с низким остатком
GET    /api/inventory/out-of-stock                - товары не в наличии
```

#### 2.3 Прогнозы
```typescript
// backend/src/routes/forecastRoutes.ts
GET    /api/forecasts                 - получить прогнозы
GET    /api/forecasts/trends          - трендовые данные
GET    /api/forecasts/top-products    - топ товары
GET    /api/forecasts/history         - история прогнозов
GET    /api/forecasts/quality-metrics - метрики качества
POST   /api/forecasts/generate        - запустить генерацию прогнозов
```

### Этап 3: Замена мок данных в коде

#### 3.1 Пользователи
```typescript
// ❌ Убрать из frontend/src/components/UserProfile/UserInfoCard.tsx
const mockUserData = {
  name: "Musharof",
  lastName: "Chowdhury", 
  email: "randomuser@pimjo.com",
  phone: "+09 363 398 46"
};

// ✅ Заменить на
const { data: userProfile, loading, error } = useQuery({
  queryKey: ['userProfile'],
  queryFn: () => api.get('/api/users/profile')
});

if (loading) return <UserProfileSkeleton />;
if (error) return <ErrorMessage message="Ошибка загрузки профиля" />;

return (
  <div>
    <p>{userProfile.full_name}</p>
    <p>{userProfile.email}</p>
    <p>{userProfile.phone}</p>
    <img src={userProfile.avatar_url || '/images/user/default-avatar.png'} />
  </div>
);
```

#### 3.2 Товары и инвентарь
```typescript
// ❌ Убрать из frontend/src/components/inventory/ShelfAvailabilityMenu.tsx
const generateMockData = (): ProductAvailability[] => {
  const mockProducts = [
    { name: 'Хлеб белый', stock: 45, available: 35, shelf: 'A1-01' },
    // ... остальные мок данные
  ];
  return mockProducts.map(/* ... */);
};

// ✅ Заменить на
const { data: shelfAvailability, loading, error } = useQuery({
  queryKey: ['shelfAvailability', filters],
  queryFn: () => api.get('/api/inventory/shelf-availability', { params: filters })
});

useEffect(() => {
  if (shelfAvailability) {
    setProducts(shelfAvailability.data);
  }
}, [shelfAvailability]);
```

#### 3.3 Прогнозы
```typescript
// ❌ Убрать из backend/src/controllers/forecastController.ts
if (process.env.USE_MOCK_ML === 'true') {
  return res.json({
    trend: {
      points: [
        { date: '2024-05-01', value: 120 },
        // ... мок данные
      ]
    }
  });
}

// ✅ Заменить на
const forecasts = await db.query(`
  SELECT 
    f.forecast_date,
    f.forecast as value,
    p.name as product_name,
    pc.name as category_name,
    f.accuracy
  FROM forecasts f
  JOIN products p ON f.product_id = p.id
  JOIN product_categories pc ON f.product_category_id = pc.id
  WHERE f.organization_id = $1
    AND f.forecast_date >= $2
    AND f.forecast_date <= $3
  ORDER BY f.forecast_date ASC
`, [organizationId, startDate, endDate]);

return res.json({
  trend: {
    points: forecasts.rows.map(row => ({
      date: row.forecast_date,
      value: row.value,
      product: row.product_name
    }))
  }
});
```

### Этап 4: Загрузка реальных данных

#### 4.1 Скрипт очистки мок данных
```sql
-- scripts/clean_mock_data.sql
-- Удалить тестовые данные
DELETE FROM forecasts 
WHERE organization_id = 1 
  AND (product LIKE 'Товар%' OR product IN ('Молоко', 'Хлеб', 'Яблоки'));

DELETE FROM products 
WHERE code LIKE 'T00%' 
  OR code LIKE 'SKU-T00%' 
  OR sku LIKE 'SKU-T00%';

DELETE FROM users 
WHERE email LIKE '%@example.com' 
  OR email LIKE '%@test.com'
  OR email = 'randomuser@pimjo.com';

-- Удалить организации с тестовыми данными
DELETE FROM organizations 
WHERE name = 'Test Organization' 
  OR name LIKE '%Example%';
```

#### 4.2 Скрипт загрузки реальных данных
```sql
-- scripts/load_real_data.sql
-- Создать реальную организацию
INSERT INTO organizations (name, inn_or_ogrn, legal_address, phone, email, status, logo_url)
VALUES 
  ('ООО "Реальная Компания"', '1234567890123', 'г. Москва, ул. Реальная, д. 1', '+7 (495) 123-45-67', 'info@real-company.ru', 'active', '/images/logo/company-logo.png');

-- Получить ID организации
DO $$
DECLARE
    org_id BIGINT;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE name = 'ООО "Реальная Компания"';
    
    -- Создать реальные локации
    INSERT INTO locations (organization_id, name, address, type, phone, status)
    VALUES 
      (org_id, 'Главный офис', 'г. Москва, ул. Реальная, д. 1', 'office', '+7 (495) 123-45-67', 'operating'),
      (org_id, 'Склад №1', 'г. Москва, ул. Складская, д. 10', 'warehouse', '+7 (495) 123-45-68', 'operating'),
      (org_id, 'Магазин №1', 'г. Москва, ул. Торговая, д. 5', 'shop', '+7 (495) 123-45-69', 'operating'),
      (org_id, 'Магазин №2', 'г. Москва, ул. Покупательская, д. 15', 'shop', '+7 (495) 123-45-70', 'operating');
    
    -- Создать реальные категории товаров
    INSERT INTO product_categories (name, organization_id)
    VALUES 
      ('Молочные продукты', org_id),
      ('Хлебобулочные изделия', org_id),
      ('Мясные продукты', org_id),
      ('Фрукты и овощи', org_id),
      ('Бакалея', org_id),
      ('Напитки', org_id),
      ('Кондитерские изделия', org_id),
      ('Замороженные продукты', org_id);
      
    -- Создать производителей
    INSERT INTO manufacturers (name, organization_id)
    VALUES 
      ('ООО "Молочный комбинат"', org_id),
      ('ЗАО "Хлебозавод №1"', org_id),
      ('ИП Петров А.А.', org_id),
      ('ООО "Фермерские продукты"', org_id);
      
    -- Создать поставщиков
    INSERT INTO suppliers (name, organization_id)
    VALUES 
      ('ООО "Оптовая база №1"', org_id),
      ('ТД "Продукты плюс"', org_id),
      ('ООО "Свежие продукты"', org_id);
END $$;
```

#### 4.3 Скрипт создания реальных товаров
```sql
-- scripts/create_real_products.sql
DO $$
DECLARE
    org_id BIGINT;
    dairy_cat_id BIGINT;
    bread_cat_id BIGINT;
    meat_cat_id BIGINT;
    fruit_cat_id BIGINT;
    manufacturer_id BIGINT;
BEGIN
    -- Получить ID организации и категорий
    SELECT id INTO org_id FROM organizations WHERE name = 'ООО "Реальная Компания"';
    SELECT id INTO dairy_cat_id FROM product_categories WHERE name = 'Молочные продукты' AND organization_id = org_id;
    SELECT id INTO bread_cat_id FROM product_categories WHERE name = 'Хлебобулочные изделия' AND organization_id = org_id;
    SELECT id INTO meat_cat_id FROM product_categories WHERE name = 'Мясные продукты' AND organization_id = org_id;
    SELECT id INTO fruit_cat_id FROM product_categories WHERE name = 'Фрукты и овощи' AND organization_id = org_id;
    SELECT id INTO manufacturer_id FROM manufacturers WHERE name = 'ООО "Молочный комбинат"' AND organization_id = org_id;
    
    -- Создать реальные товары
    INSERT INTO products (organization_id, name, sku, code, price, product_category_id, manufacturer_id, description, image_url, barcode, unit_of_measure)
    VALUES 
      -- Молочные продукты
      (org_id, 'Молоко "Домик в деревне" 3.2% 1л', 'MILK-001', 'MLK001', 85.00, dairy_cat_id, manufacturer_id, 'Натуральное коровье молоко', '/images/products/milk-001.jpg', '4607025392010', 'л'),
      (org_id, 'Кефир "Простоквашино" 2.5% 1л', 'KEFIR-001', 'KFR001', 95.00, dairy_cat_id, manufacturer_id, 'Кисломолочный продукт', '/images/products/kefir-001.jpg', '4607025392027', 'л'),
      (org_id, 'Творог "Домик в деревне" 5% 200г', 'COTTAGE-001', 'CTG001', 120.00, dairy_cat_id, manufacturer_id, 'Зернистый творог', '/images/products/cottage-001.jpg', '4607025392034', 'г'),
      (org_id, 'Сметана "Простоквашино" 15% 300г', 'SOUR-001', 'SRC001', 140.00, dairy_cat_id, manufacturer_id, 'Густая сметана', '/images/products/sour-001.jpg', '4607025392041', 'г'),
      
      -- Хлебобулочные изделия  
      (org_id, 'Хлеб "Дарницкий" 700г', 'BREAD-001', 'BRD001', 45.00, bread_cat_id, null, 'Ржано-пшеничный хлеб', '/images/products/bread-001.jpg', '4607025392058', 'г'),
      (org_id, 'Батон "Нарезной" 500г', 'BATON-001', 'BTN001', 38.00, bread_cat_id, null, 'Пшеничный батон', '/images/products/baton-001.jpg', '4607025392065', 'г'),
      (org_id, 'Булочка "Городская" 100г', 'BUN-001', 'BUN001', 25.00, bread_cat_id, null, 'Сдобная булочка', '/images/products/bun-001.jpg', '4607025392072', 'шт'),
      
      -- Мясные продукты
      (org_id, 'Колбаса "Докторская" 500г', 'SAUSAGE-001', 'SSG001', 320.00, meat_cat_id, null, 'Вареная колбаса', '/images/products/sausage-001.jpg', '4607025392089', 'г'),
      (org_id, 'Сосиски "Молочные" 400г', 'WIENER-001', 'WNR001', 280.00, meat_cat_id, null, 'Сосиски высшего сорта', '/images/products/wiener-001.jpg', '4607025392096', 'г'),
      
      -- Фрукты и овощи
      (org_id, 'Яблоки "Гала" 1кг', 'APPLE-001', 'APL001', 150.00, fruit_cat_id, null, 'Свежие яблоки', '/images/products/apple-001.jpg', '4607025392102', 'кг'),
      (org_id, 'Бананы 1кг', 'BANANA-001', 'BNN001', 120.00, fruit_cat_id, null, 'Спелые бананы', '/images/products/banana-001.jpg', '4607025392119', 'кг'),
      (org_id, 'Картофель 2кг', 'POTATO-001', 'PTT001', 80.00, fruit_cat_id, null, 'Молодой картофель', '/images/products/potato-001.jpg', '4607025392126', 'кг');
END $$;
```

#### 4.4 Скрипт создания остатков на полках
```sql
-- scripts/create_shelf_availability.sql
DO $$
DECLARE
    product_record RECORD;
    location_record RECORD;
    shelf_sections TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E'];
    shelf_levels INT[] := ARRAY[1, 2, 3];
    shelf_positions INT[] := ARRAY[1, 2, 3, 4, 5];
    random_stock INT;
    random_available INT;
    random_reserved INT;
    shelf_code TEXT;
    stock_status TEXT;
BEGIN
    -- Для каждого товара создать остатки в разных локациях
    FOR product_record IN 
        SELECT id, name FROM products WHERE organization_id = (
            SELECT id FROM organizations WHERE name = 'ООО "Реальная Компания"'
        )
    LOOP
        FOR location_record IN 
            SELECT id, name FROM locations WHERE type IN ('shop', 'warehouse')
        LOOP
            -- Генерировать случайные остатки
            random_stock := (RANDOM() * 100 + 10)::INT;
            random_available := (RANDOM() * random_stock * 0.8)::INT;
            random_reserved := LEAST((RANDOM() * random_stock * 0.2)::INT, random_stock - random_available);
            
            -- Генерировать код полки
            shelf_code := shelf_sections[1 + (RANDOM() * array_length(shelf_sections, 1))::INT] ||
                         shelf_levels[1 + (RANDOM() * array_length(shelf_levels, 1))::INT] ||
                         '-' ||
                         LPAD((shelf_positions[1 + (RANDOM() * array_length(shelf_positions, 1))::INT])::TEXT, 2, '0');
            
            -- Определить статус
            IF random_available = 0 THEN
                stock_status := 'out_of_stock';
            ELSIF random_available::FLOAT / random_stock < 0.1 THEN
                stock_status := 'critical';
            ELSIF random_available::FLOAT / random_stock < 0.3 THEN
                stock_status := 'low_stock';
            ELSE
                stock_status := 'available';
            END IF;
            
            -- Вставить данные об остатках
            INSERT INTO shelf_availability (
                product_id, location_id, shelf_location,
                shelf_section, shelf_level, shelf_position,
                total_stock, available_stock, reserved_stock,
                minimum_stock, maximum_stock,
                last_restock_date, last_counted_date,
                out_of_stock_since, out_of_stock_hours,
                status
            ) VALUES (
                product_record.id, location_record.id, shelf_code,
                SUBSTRING(shelf_code FROM 1 FOR 1), 
                SUBSTRING(shelf_code FROM 2 FOR 1)::INT,
                SUBSTRING(shelf_code FROM 4 FOR 2)::INT,
                random_stock, random_available, random_reserved,
                10, 200,
                CURRENT_DATE - (RANDOM() * 30)::INT,
                CURRENT_DATE - (RANDOM() * 7)::INT,
                CASE WHEN stock_status = 'out_of_stock' THEN NOW() - (RANDOM() * 48 || ' hours')::INTERVAL ELSE NULL END,
                CASE WHEN stock_status = 'out_of_stock' THEN (RANDOM() * 48)::INT ELSE 0 END,
                stock_status
            );
        END LOOP;
    END LOOP;
END $$;
```

### Этап 5: Создание компонентов для загрузки данных

#### 5.1 Хуки для данных
```typescript
// frontend/src/hooks/useUserProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/api/users/profile');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: Partial<UserProfile>) => {
      const response = await api.put('/api/users/profile', userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
```

#### 5.2 Хуки для инвентаря
```typescript
// frontend/src/hooks/useInventory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useShelfAvailability = (filters?: InventoryFilters) => {
  return useQuery({
    queryKey: ['shelfAvailability', filters],
    queryFn: async () => {
      const response = await api.get('/api/inventory/shelf-availability', {
        params: filters,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await api.get('/api/inventory/products', {
        params: filters,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: Partial<StockUpdate> }) => {
      const response = await api.put(`/api/inventory/shelf-availability/${id}`, stock);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelfAvailability'] });
    },
  });
};
```

#### 5.3 Компоненты загрузки
```typescript
// frontend/src/components/common/LoadingStates.tsx
export const UserProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="rounded-full bg-gray-300 h-16 w-16"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
        <div className="h-4 bg-gray-300 rounded w-48"></div>
      </div>
    </div>
  </div>
);

export const ProductTableSkeleton = () => (
  <div className="animate-pulse">
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);
```

### Этап 6: Тестирование и валидация

#### 6.1 Тесты для API
```typescript
// backend/src/__tests__/api/users.test.ts
describe('Users API', () => {
  it('should get user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
      
    expect(response.body).toHaveProperty('full_name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('avatar_url');
  });
  
  it('should update user profile', async () => {
    const updateData = {
      full_name: 'Updated Name',
      phone: '+7 (999) 123-45-67'
    };
    
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);
      
    expect(response.body.full_name).toBe(updateData.full_name);
    expect(response.body.phone).toBe(updateData.phone);
  });
});
```

#### 6.2 E2E тесты
```typescript
// frontend/tests/user-profile.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Profile', () => {
  test('should display real user data', async ({ page }) => {
    await page.goto('/profile');
    
    // Проверить, что данные загружаются
    await expect(page.locator('[data-testid="user-name"]')).not.toContainText('Musharof');
    await expect(page.locator('[data-testid="user-email"]')).not.toContainText('randomuser@pimjo.com');
    
    // Проверить, что отображаются реальные данные
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
    
    // Проверить аватар
    const avatar = page.locator('[data-testid="user-avatar"]');
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute('src', /^(\/api\/users\/avatar\/|\/images\/user\/default-avatar\.png)/);
  });
});
```

---

## 📊 Чек-лист миграции

### ✅ Подготовка
- [ ] Создать резервную копию базы данных
- [ ] Обновить схему базы данных
- [ ] Создать новые таблицы (shelf_availability, user_avatars, file_uploads)
- [ ] Добавить индексы для производительности
- [ ] Создать миграции для изменений схемы

### ✅ Backend
- [ ] Создать API эндпоинты для пользователей
- [ ] Создать API эндпоинты для инвентаря
- [ ] Создать API эндпоинты для прогнозов
- [ ] Добавить загрузку файлов (аватары, изображения товаров)
- [ ] Добавить валидацию данных
- [ ] Добавить обработку ошибок
- [ ] Создать middleware для авторизации
- [ ] Написать тесты для API

### ✅ Frontend
- [ ] Создать хуки для загрузки данных
- [ ] Заменить мок данные в UserInfoCard
- [ ] Заменить мок данные в ShelfAvailabilityMenu
- [ ] Заменить мок данные в admin панели
- [ ] Заменить мок данные в таблицах
- [ ] Добавить состояния загрузки
- [ ] Добавить обработку ошибок
- [ ] Создать компоненты для загрузки файлов
- [ ] Написать E2E тесты

### ✅ Данные
- [ ] Очистить мок данные из базы
- [ ] Загрузить реальные данные организаций
- [ ] Загрузить реальные данные товаров
- [ ] Создать остатки на полках
- [ ] Загрузить изображения товаров
- [ ] Создать реальных пользователей
- [ ] Настроить права доступа

### ✅ Тестирование
- [ ] Протестировать API эндпоинты
- [ ] Протестировать UI компоненты
- [ ] Провести интеграционные тесты
- [ ] Провести E2E тесты
- [ ] Протестировать производительность
- [ ] Протестировать безопасность

### ✅ Развертывание
- [ ] Обновить переменные окружения
- [ ] Развернуть изменения в staging
- [ ] Провести smoke тесты
- [ ] Развернуть в production
- [ ] Мониторинг после развертывания

---

## 🚀 Приоритеты выполнения

### Высокий приоритет (критично для работы)
1. **Пользователи и авторизация** - основа безопасности
2. **API для товаров** - ключевая бизнес-логика
3. **Остатки на полках** - критично для инвентаря

### Средний приоритет (важно для UX)
1. **Изображения товаров** - улучшает восприятие
2. **Прогнозы** - аналитическая функциональность
3. **Загрузка файлов** - удобство использования

### Низкий приоритет (можно отложить)
1. **Таблицы заказов** - для отчетности
2. **Расширенная аналитика** - дополнительные метрики
3. **Тестовые данные** - для разработки

---

## 📈 Ожидаемые результаты

### Производительность
- Ускорение загрузки данных на 40-60%
- Уменьшение размера bundle на 15-20%
- Снижение времени отклика API до 100-200ms

### Безопасность
- Исключение утечки тестовых данных
- Контроль доступа к реальным данным
- Аудит действий пользователей

### Масштабируемость
- Поддержка множества организаций
- Возможность добавления новых товаров
- Гибкая система ролей и прав

### Удобство использования
- Актуальные данные в реальном времени
- Персонализированный интерфейс
- Быстрый поиск и фильтрация

---

## 🔧 Инструменты и зависимости

### Backend
```json
{
  "dependencies": {
    "multer": "^1.4.5",
    "sharp": "^0.33.0",
    "joi": "^17.11.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "axios": "^1.6.0"
  }
}
```

### База данных
```sql
-- Расширения PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
```

---

## 📝 Заключение

Этот документ предоставляет полный план миграции от мок данных к реальной базе данных. Следование этому плану позволит:

1. **Систематически** заменить все мок данные
2. **Безопасно** перейти на реальные данные
3. **Сохранить** функциональность приложения
4. **Улучшить** производительность и UX
5. **Обеспечить** масштабируемость решения

Рекомендуется выполнять миграцию поэтапно, тестируя каждый этап перед переходом к следующему. 