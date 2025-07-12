# Система Пользовательских Настроек

## 🎯 Обзор

Теперь настройки сайдбара сохраняются на сервере и привязываются к конкретному пользователю! При входе в систему под тем же аккаунтом с любого устройства или браузера настройки автоматически восстанавливаются.

## ✨ Что Изменилось

### **Раньше** (localStorage)
- ❌ Настройки привязаны к браузеру
- ❌ При смене браузера настройки теряются
- ❌ При входе с другого устройства настройки сбрасываются
- ❌ Нет синхронизации между устройствами

### **Теперь** (Server + User ID)
- ✅ Настройки привязаны к пользователю
- ✅ Работают в любом браузере
- ✅ Синхронизация между устройствами
- ✅ Сохраняются при смене компьютера
- ✅ Резервное копирование в localStorage

## 🏗️ Архитектура Системы

### **Backend (API)**
```
/api/user-preferences/
├── GET /                    # Получить все настройки пользователя
├── POST /                   # Сохранить все настройки пользователя
└── POST /sidebar           # Сохранить настройки сайдбара
```

### **Database Schema**
```sql
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **Frontend Service**
```typescript
// Получить настройки пользователя
getUserPreferencesAuth(): Promise<UserPreferences>

// Сохранить настройки сайдбара
saveSidebarPreferencesAuth(order: string[], hiddenItems: string[]): Promise<void>
```

## 📊 Структура Данных

### **Пример JSON в базе данных:**
```json
{
  "sidebar": {
    "order": [
      "dashboard",
      "sales-forecast", 
      "reports",
      "products",
      "admin-panel"
    ],
    "hiddenItems": [
      "automation",
      "security",
      "communication"
    ]
  },
  "theme": "dark",
  "language": "ru"
}
```

## 🔐 Безопасность

### **Row Level Security (RLS)**
- Пользователи видят только свои настройки
- Невозможно получить настройки другого пользователя
- Автоматическая проверка прав доступа

### **Политики Безопасности**
```sql
-- Пользователи могут видеть только свои настройки
CREATE POLICY "Users can view own preferences" 
ON user_preferences FOR SELECT 
USING (auth.uid() = user_id);

-- Пользователи могут обновлять только свои настройки
CREATE POLICY "Users can update own preferences" 
ON user_preferences FOR UPDATE 
USING (auth.uid() = user_id);
```

## 🚀 Как Это Работает

### **1. При Входе в Систему**
```typescript
// Автоматически загружаются настройки пользователя
const preferences = await getUserPreferencesAuth();
if (preferences.sidebar) {
  // Восстанавливается порядок элементов
  setMenuItems(reorderedItems);
  // Восстанавливаются скрытые элементы
  setHiddenItems(new Set(hiddenItems));
}
```

### **2. При Изменении Настроек**
```typescript
// Сохраняется на сервер + localStorage как резерв
await saveSidebarPreferencesAuth(orderIds, hiddenItems);
localStorage.setItem('sidebarOrder', JSON.stringify(orderIds));
```

### **3. Fallback Система**
```typescript
try {
  // Пытаемся загрузить с сервера
  const preferences = await getUserPreferencesAuth();
} catch (error) {
  // Если ошибка - используем localStorage
  const savedOrder = localStorage.getItem('sidebarOrder');
}
```

## 💾 Миграция Данных

### **Автоматическая Миграция**
При первом входе система:
1. Пытается загрузить настройки с сервера
2. Если настроек нет - использует localStorage
3. При первом изменении сохраняет на сервер
4. Дальше работает с сервером

### **Обратная Совместимость**
- localStorage остается как резервная копия
- Старые пользователи не теряют настройки
- Плавный переход на новую систему

## 🔄 Синхронизация

### **Между Устройствами**
- **Компьютер A**: Скрыл "Автоматизация", изменил порядок
- **Компьютер B**: При входе автоматически применяются те же настройки
- **Мобильное устройство**: Те же настройки и там

### **Между Браузерами**
- Chrome, Firefox, Safari - везде одинаковые настройки
- Инкогнито режим - тоже работает (если авторизован)

## 🛠️ Технические Детали

### **Authentication**
```typescript
// Автоматическое получение токена из Supabase
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Создание авторизованного запроса
const api = axios.create({
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### **Error Handling**
```typescript
try {
  await saveSidebarPreferencesAuth(order, hiddenItems);
} catch (error) {
  // Fallback к localStorage если сервер недоступен
  localStorage.setItem('sidebarOrder', JSON.stringify(order));
}
```

### **Performance**
- JSONB индексы для быстрого поиска
- Кэширование на уровне браузера
- Минимальные сетевые запросы

## 📱 Пользовательский Опыт

### **Сценарий 1: Домашний Компьютер**
1. Настроил сайдбар под себя
2. Скрыл ненужные разделы
3. Изменил порядок элементов

### **Сценарий 2: Рабочий Компьютер**
1. Вошел в систему
2. **Автоматически** применились домашние настройки
3. Никаких дополнительных действий не требуется

### **Сценарий 3: Мобильное Устройство**
1. Открыл приложение в браузере
2. Авторизовался
3. **Те же настройки** что и на компьютере

## 🔧 Настройка для Разработчиков

### **1. Запуск Миграции**
```sql
-- Выполнить в базе данных
\i database/20250712_create_user_preferences_table.sql
```

### **2. Проверка API**
```bash
# Получить настройки пользователя
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/user-preferences/

# Сохранить настройки сайдбара
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"order":["dashboard","reports"],"hiddenItems":["automation"]}' \
     http://localhost:3000/api/user-preferences/sidebar
```

### **3. Отладка**
```typescript
// Проверить загрузку настроек
console.log('User preferences:', await getUserPreferencesAuth());

// Проверить сохранение
await saveSidebarPreferencesAuth(['dashboard'], ['automation']);
```

## 📈 Преимущества

### **Для Пользователей**
- ✅ Настройки следуют за пользователем
- ✅ Не нужно настраивать заново
- ✅ Работает на всех устройствах
- ✅ Автоматическая синхронизация

### **Для Разработчиков**
- ✅ Централизованное хранение настроек
- ✅ Возможность аналитики предпочтений
- ✅ Простое добавление новых настроек
- ✅ Безопасное хранение данных

### **Для Бизнеса**
- ✅ Улучшенный пользовательский опыт
- ✅ Данные о предпочтениях пользователей
- ✅ Возможность персонализации
- ✅ Снижение количества обращений в поддержку

## 🎉 Результат

Теперь при входе в систему под тем же пользователем с любого устройства:
- ✅ **Порядок элементов меню** восстанавливается автоматически
- ✅ **Скрытые элементы** остаются скрытыми
- ✅ **Все настройки** синхронизируются между устройствами
- ✅ **Никаких дополнительных действий** от пользователя не требуется

Система помнит ваши предпочтения и делает интерфейс именно таким, каким вы его настроили! 🎯 