// frontend/src/shared/config/ui.ts

// Иконки для компонентов
export const ICONS = {
  search: '🔍',
  filter: '🔧',
  add: '➕',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  cancel: '❌',
  loading: '⏳',
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  menu: '☰',
  close: '✕',
  expand: '▼',
  collapse: '▲',
  next: '▶',
  prev: '◀',
  up: '⬆',
  down: '⬇',
  left: '⬅',
  right: '➡'
};

// Конфигурация статусов
export const STATUS_CONFIG = {
  active: {
    label: 'Активен',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: ICONS.success
  },
  inactive: {
    label: 'Неактивен',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: ICONS.error
  },
  pending: {
    label: 'Ожидает',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: ICONS.warning
  },
  processing: {
    label: 'Обработка',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: ICONS.loading
  },
  // Product availability statuses
  available: {
    label: 'В наличии',
    text: 'В наличии',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    iconColor: 'text-green-600',
    icon: ICONS.success
  },
  low_stock: {
    label: 'Мало',
    text: 'Мало',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    iconColor: 'text-yellow-600',
    icon: ICONS.warning
  },
  critical: {
    label: 'Критично',
    text: 'Критично',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    iconColor: 'text-orange-600',
    icon: ICONS.warning
  },
  out_of_stock: {
    label: 'Нет в наличии',
    text: 'Нет в наличии',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    iconColor: 'text-red-600',
    icon: ICONS.error
  }
};
