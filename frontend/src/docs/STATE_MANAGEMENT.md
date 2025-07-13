# Система управления состоянием Dashboard Layout

Эта система предоставляет надежное управление состоянием для макета dashboard с поддержкой undo/redo, автосохранения и синхронизации с backend.

## Основные возможности

- 🔄 **Undo/Redo**: Полная поддержка отмены и повтора действий через Immer
- 💾 **Автосохранение**: Автоматическое сохранение в localStorage/IndexedDB с debounce
- 🌐 **Синхронизация**: Двунаправленная синхронизация с backend через WebSocket/REST API
- 📱 **Оффлайн поддержка**: Работа в оффлайне с автоматической синхронизацией при восстановлении соединения
- 🔧 **TypeScript**: Полная типизация для лучшего DX

## Архитектура

```
src/
├── store/
│   └── layoutStore.ts          # Основное хранилище Zustand
├── hooks/
│   ├── useLayoutHistory.ts     # Хук для undo/redo
│   ├── useAutoSave.ts          # Хук для автосохранения
│   └── useLayoutSync.ts        # Хук для синхронизации
├── utils/
│   └── indexedDB.ts            # Утилиты для IndexedDB
└── types/
    └── layout.ts               # TypeScript типы
```

## Использование

### Базовое использование

```tsx
import { useLayoutHistory } from './hooks/useLayoutHistory';
import { useAutoSave } from './hooks/useAutoSave';
import { useLayoutSync } from './hooks/useLayoutSync';

function MyComponent() {
  const {
    layout,
    undo,
    redo,
    canUndo,
    canRedo,
    updateLayout,
    addItem,
    removeItem,
  } = useLayoutHistory();

  const { isDirty, save, load } = useAutoSave({
    enabled: true,
    interval: 5000,
  });

  const { isConnected, syncStatus } = useLayoutSync({
    enabled: true,
    wsUrl: 'ws://localhost:3001/ws',
  });

  // Ваш код...
}
```

### Управление историей

```tsx
const { layout, undo, redo, canUndo, canRedo } = useLayoutHistory();

// Отмена последнего действия
if (canUndo) {
  undo();
}

// Повтор отмененного действия
if (canRedo) {
  redo();
}

// Клавиатурные сокращения автоматически включены:
// Ctrl+Z - undo
// Ctrl+Shift+Z или Ctrl+Y - redo
```

### Автосохранение

```tsx
const { save, load, isDirty, forceSave } = useAutoSave({
  enabled: true,
  interval: 3000, // Автосохранение каждые 3 секунды
  onSave: () => console.log('Сохранено!'),
  onError: (error) => console.error('Ошибка сохранения:', error),
});

// Принудительное сохранение
await forceSave();

// Загрузка данных
await load();
```

### Синхронизация с backend

```tsx
const { isConnected, sync, syncStatus } = useLayoutSync({
  enabled: true,
  wsUrl: 'ws://localhost:3001/ws',
  onConnect: () => console.log('Подключено к серверу'),
  onDisconnect: () => console.log('Отключено от сервера'),
  onSync: (layout) => console.log('Получены обновления:', layout),
});

// Принудительная синхронизация
await sync();
```

## API Reference

### useLayoutHistory

```tsx
interface UseLayoutHistoryReturn {
  layout: LayoutItem[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  updateLayout: (layout: LayoutItem[]) => void;
  addItem: (item: LayoutItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<LayoutItem>) => void;
  clearHistory: () => void;
  historySize: number;
  currentIndex: number;
}
```

### useAutoSave

```tsx
interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  save: () => Promise<void>;
  load: () => Promise<void>;
  isDirty: boolean;
  lastSaved: number;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  forceSave: () => Promise<void>;
}
```

### useLayoutSync

```tsx
interface UseLayoutSyncOptions {
  enabled?: boolean;
  wsUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onSync?: (layout: LayoutItem[]) => void;
}

interface UseLayoutSyncReturn {
  isConnected: boolean;
  sync: () => Promise<void>;
  disconnect: () => void;
  connect: () => void;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}
```

## Структура данных

### LayoutItem

```tsx
interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component: string;
  props?: Record<string, any>;
  static?: boolean;
  resizable?: boolean;
  draggable?: boolean;
}
```

## Персистентность

Система автоматически использует наиболее подходящий способ хранения:

1. **IndexedDB** - для больших объемов данных и лучшей производительности
2. **localStorage** - в качестве fallback

### Миграция данных

```tsx
import { migrateFromLocalStorage } from './utils/indexedDB';

// Миграция из localStorage в IndexedDB
await migrateFromLocalStorage('dashboard-layout');
```

## WebSocket Protocol

Система использует простой протокол для синхронизации:

```json
{
  "type": "layout_update",
  "data": {
    "layout": [...]
  },
  "timestamp": 1641234567890
}
```

Типы сообщений:
- `layout_update` - обновление макета
- `layout_sync` - подтверждение синхронизации
- `ping/pong` - поддержание соединения

## Обработка ошибок

```tsx
const { error } = useLayoutStore();

if (error) {
  console.error('Ошибка системы:', error);
}
```

## Тестирование

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage
```

## Примеры использования

### Простой dashboard

```tsx
function Dashboard() {
  const { layout, addItem } = useLayoutHistory();
  
  const handleAddWidget = () => {
    addItem({
      id: `widget-${Date.now()}`,
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      component: 'ChartWidget',
    });
  };

  return (
    <div>
      <button onClick={handleAddWidget}>Добавить виджет</button>
      <GridLayout layout={layout} />
    </div>
  );
}
```

### Кастомная конфигурация

```tsx
function AdvancedDashboard() {
  const history = useLayoutHistory();
  
  const autoSave = useAutoSave({
    enabled: true,
    interval: 10000, // 10 секунд
    onSave: () => toast.success('Автосохранение выполнено'),
  });
  
  const sync = useLayoutSync({
    enabled: true,
    wsUrl: process.env.REACT_APP_WS_URL,
    onError: (error) => toast.error(`Ошибка синхронизации: ${error.message}`),
  });

  return <YourDashboardComponent />;
}
```

## Производительность

- Debounced автосохранение для избежания частых операций I/O
- Оптимизированная синхронизация только при изменениях
- Эффективное управление памятью для истории операций
- Ленивая загрузка IndexedDB

## Совместимость

- React 18+
- TypeScript 4.5+
- Современные браузеры с поддержкой IndexedDB
- Node.js 16+ для backend интеграции
