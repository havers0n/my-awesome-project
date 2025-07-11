// frontend/src/constants.ts

// Универсальное значение для фильтров "Все"
export const ALL_OPTION_VALUE = 'all';

// Роли пользователей, используемые в приложении
export const ROLES = [
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'DIRECTOR', label: 'Директор' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'EMPLOYEE', label: 'Сотрудник' },
];

// Начальные роли для системы ролей и разрешений
export const INITIAL_ROLES = [
  { id: 'role-1', name: 'Сотрудник', description: 'Базовые права для работы с системой', created_at: '2024-01-01T00:00:00Z' },
  { id: 'role-2', name: 'Менеджер', description: 'Управление данными в рамках своей организации', created_at: '2024-01-01T00:00:00Z' },
  { id: 'role-3', name: 'Директор', description: 'Полный доступ к данным своей организации', created_at: '2024-01-01T00:00:00Z' },
  { id: 'role-4', name: 'Администратор', description: 'Управление всеми организациями и пользователями', created_at: '2024-01-01T00:00:00Z' },
  { id: 'role-5', name: 'Суперадмин', description: 'Полный доступ ко всем функциям системы', created_at: '2024-01-01T00:00:00Z' }
];

// Начальные разрешения для системы ролей и разрешений
export const INITIAL_PERMISSIONS = [
  { id: 'perm-1', name: 'view_organizations', description: 'Просмотр организаций', resource: 'organizations', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-2', name: 'create_organizations', description: 'Создание организаций', resource: 'organizations', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-3', name: 'edit_organizations', description: 'Редактирование организаций', resource: 'organizations', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-4', name: 'delete_organizations', description: 'Удаление организаций', resource: 'organizations', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-5', name: 'view_locations', description: 'Просмотр точек', resource: 'locations', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-6', name: 'create_locations', description: 'Создание точек', resource: 'locations', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-7', name: 'edit_locations', description: 'Редактирование точек', resource: 'locations', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-8', name: 'delete_locations', description: 'Удаление точек', resource: 'locations', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-9', name: 'view_suppliers', description: 'Просмотр поставщиков', resource: 'suppliers', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-10', name: 'create_suppliers', description: 'Создание поставщиков', resource: 'suppliers', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-11', name: 'edit_suppliers', description: 'Редактирование поставщиков', resource: 'suppliers', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-12', name: 'delete_suppliers', description: 'Удаление поставщиков', resource: 'suppliers', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-13', name: 'view_users', description: 'Просмотр пользователей', resource: 'users', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-14', name: 'create_users', description: 'Создание пользователей', resource: 'users', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-15', name: 'edit_users', description: 'Редактирование пользователей', resource: 'users', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-16', name: 'delete_users', description: 'Удаление пользователей', resource: 'users', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-17', name: 'view_roles', description: 'Просмотр ролей', resource: 'roles', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-18', name: 'create_roles', description: 'Создание ролей', resource: 'roles', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-19', name: 'edit_roles', description: 'Редактирование ролей', resource: 'roles', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-20', name: 'delete_roles', description: 'Удаление ролей', resource: 'roles', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-21', name: 'assign_permissions', description: 'Назначение разрешений', resource: 'permissions', created_at: '2024-01-01T00:00:00Z' }
];

// Начальные связи ролей и разрешений
export const INITIAL_ROLE_PERMISSIONS = [
  // Сотрудник - базовые права просмотра
  { id: 'rp-1', role_id: 'role-1', permission_id: 'perm-1' },
  { id: 'rp-2', role_id: 'role-1', permission_id: 'perm-5' },
  { id: 'rp-3', role_id: 'role-1', permission_id: 'perm-9' },
  { id: 'rp-4', role_id: 'role-1', permission_id: 'perm-13' },
  
  // Менеджер - просмотр + создание/редактирование
  { id: 'rp-5', role_id: 'role-2', permission_id: 'perm-1' },
  { id: 'rp-6', role_id: 'role-2', permission_id: 'perm-5' },
  { id: 'rp-7', role_id: 'role-2', permission_id: 'perm-6' },
  { id: 'rp-8', role_id: 'role-2', permission_id: 'perm-7' },
  { id: 'rp-9', role_id: 'role-2', permission_id: 'perm-9' },
  { id: 'rp-10', role_id: 'role-2', permission_id: 'perm-10' },
  { id: 'rp-11', role_id: 'role-2', permission_id: 'perm-11' },
  { id: 'rp-12', role_id: 'role-2', permission_id: 'perm-13' },
  
  // Директор - полный доступ к своей организации
  { id: 'rp-13', role_id: 'role-3', permission_id: 'perm-1' },
  { id: 'rp-14', role_id: 'role-3', permission_id: 'perm-3' },
  { id: 'rp-15', role_id: 'role-3', permission_id: 'perm-5' },
  { id: 'rp-16', role_id: 'role-3', permission_id: 'perm-6' },
  { id: 'rp-17', role_id: 'role-3', permission_id: 'perm-7' },
  { id: 'rp-18', role_id: 'role-3', permission_id: 'perm-8' },
  { id: 'rp-19', role_id: 'role-3', permission_id: 'perm-9' },
  { id: 'rp-20', role_id: 'role-3', permission_id: 'perm-10' },
  { id: 'rp-21', role_id: 'role-3', permission_id: 'perm-11' },
  { id: 'rp-22', role_id: 'role-3', permission_id: 'perm-12' },
  { id: 'rp-23', role_id: 'role-3', permission_id: 'perm-13' },
  { id: 'rp-24', role_id: 'role-3', permission_id: 'perm-14' },
  { id: 'rp-25', role_id: 'role-3', permission_id: 'perm-15' },
  { id: 'rp-26', role_id: 'role-3', permission_id: 'perm-16' },
  
  // Администратор - полный доступ ко всему кроме ролей
  { id: 'rp-27', role_id: 'role-4', permission_id: 'perm-1' },
  { id: 'rp-28', role_id: 'role-4', permission_id: 'perm-2' },
  { id: 'rp-29', role_id: 'role-4', permission_id: 'perm-3' },
  { id: 'rp-30', role_id: 'role-4', permission_id: 'perm-4' },
  { id: 'rp-31', role_id: 'role-4', permission_id: 'perm-5' },
  { id: 'rp-32', role_id: 'role-4', permission_id: 'perm-6' },
  { id: 'rp-33', role_id: 'role-4', permission_id: 'perm-7' },
  { id: 'rp-34', role_id: 'role-4', permission_id: 'perm-8' },
  { id: 'rp-35', role_id: 'role-4', permission_id: 'perm-9' },
  { id: 'rp-36', role_id: 'role-4', permission_id: 'perm-10' },
  { id: 'rp-37', role_id: 'role-4', permission_id: 'perm-11' },
  { id: 'rp-38', role_id: 'role-4', permission_id: 'perm-12' },
  { id: 'rp-39', role_id: 'role-4', permission_id: 'perm-13' },
  { id: 'rp-40', role_id: 'role-4', permission_id: 'perm-14' },
  { id: 'rp-41', role_id: 'role-4', permission_id: 'perm-15' },
  { id: 'rp-42', role_id: 'role-4', permission_id: 'perm-16' },
  { id: 'rp-43', role_id: 'role-4', permission_id: 'perm-17' },
  
  // Суперадмин - абсолютно все права
  { id: 'rp-44', role_id: 'role-5', permission_id: 'perm-1' },
  { id: 'rp-45', role_id: 'role-5', permission_id: 'perm-2' },
  { id: 'rp-46', role_id: 'role-5', permission_id: 'perm-3' },
  { id: 'rp-47', role_id: 'role-5', permission_id: 'perm-4' },
  { id: 'rp-48', role_id: 'role-5', permission_id: 'perm-5' },
  { id: 'rp-49', role_id: 'role-5', permission_id: 'perm-6' },
  { id: 'rp-50', role_id: 'role-5', permission_id: 'perm-7' },
  { id: 'rp-51', role_id: 'role-5', permission_id: 'perm-8' },
  { id: 'rp-52', role_id: 'role-5', permission_id: 'perm-9' },
  { id: 'rp-53', role_id: 'role-5', permission_id: 'perm-10' },
  { id: 'rp-54', role_id: 'role-5', permission_id: 'perm-11' },
  { id: 'rp-55', role_id: 'role-5', permission_id: 'perm-12' },
  { id: 'rp-56', role_id: 'role-5', permission_id: 'perm-13' },
  { id: 'rp-57', role_id: 'role-5', permission_id: 'perm-14' },
  { id: 'rp-58', role_id: 'role-5', permission_id: 'perm-15' },
  { id: 'rp-59', role_id: 'role-5', permission_id: 'perm-16' },
  { id: 'rp-60', role_id: 'role-5', permission_id: 'perm-17' },
  { id: 'rp-61', role_id: 'role-5', permission_id: 'perm-18' },
  { id: 'rp-62', role_id: 'role-5', permission_id: 'perm-19' },
  { id: 'rp-63', role_id: 'role-5', permission_id: 'perm-20' },
  { id: 'rp-64', role_id: 'role-5', permission_id: 'perm-21' }
];

// Пустой объект пользователя для инициализации форм
export const EMPTY_USER = {
  id: '',
  email: '',
  password: '',
  full_name: '',
  role: 'EMPLOYEE',
  role_id: 'role-1', // ID роли сотрудника по умолчанию
  organizationId: null,
  locationId: null,
  is_active: true,
  created_at: '',
  last_sign_in: null,
  send_invitation: false,
};

// Пустой объект организации для инициализации форм
export const EMPTY_ORGANIZATION = {
  id: '',
  name: '',
  legalAddress: '',
  innOrOgrn: '',
  actualAddress: '',
  phone: '',
  email: '',
  website: '',
  description: '',
  logoUrl: '',
  contactPerson: '',
  createdAt: '',
  status: 'active',
};

// Пустой объект локации/точки для инициализации форм
export const EMPTY_LOCATION = {
  id: '',
  name: '',
  organizationId: '',
  address: '',
  type: 'store',
  status: 'active',
  created_at: '',
};

// Mock-данные для инициализации
export const INITIAL_ORGANIZATIONS = [
  {
    id: 'org-1',
    name: 'ООО "ТехноИнновации"',
    legalAddress: 'г. Москва, ул. Центральная, 1',
    innOrOgrn: '7701234567',
    actualAddress: 'г. Москва, ул. Центральная, 1',
    phone: '+79001234567',
    email: 'a.a@techno.com',
    website: 'https://techno.com',
    description: 'Инновационная компания',
    logoUrl: '',
    createdAt: '2023-01-10T10:00:00Z',
    status: 'active',
  },
  {
    id: 'org-2',
    name: 'АО "ПромРесурс"',
    legalAddress: 'г. Санкт-Петербург, пр. Невский, 2',
    innOrOgrn: '7801234568',
    actualAddress: 'г. Санкт-Петербург, пр. Невский, 2',
    phone: '+79011234568',
    email: 'b.b@prom.res',
    website: 'https://prom.res',
    description: 'Промышленный ресурс',
    logoUrl: '',
    createdAt: '2023-02-15T11:00:00Z',
    status: 'active',
  },
];

export const INITIAL_LOCATIONS = [
  { id: 'loc-1', organizationId: 'org-1', name: 'Центральный офис (Москва)', address: 'г. Москва, ул. Центральная, 1', type: 'office', status: 'active', createdAt: '2023-01-10T10:05:00Z' },
  { id: 'loc-2', organizationId: 'org-1', name: 'Склад №1 (Подмосковье)', address: 'МО, г. Подольск, ул. Складская, 5', type: 'warehouse', status: 'active', createdAt: '2023-01-11T12:00:00Z' },
  { id: 'loc-3', organizationId: 'org-2', name: 'Филиал "Северный" (СПБ)', address: 'г. Санкт-Петербург, Северный пр., 10', type: 'store', status: 'active', createdAt: '2023-02-16T14:00:00Z' },
];

export const INITIAL_USERS = [
  {
    id: 'user-1',
    email: 'ivanov.ii@techno.com',
    full_name: 'Иванов Иван Иванович',
    role: 'MANAGER',
    role_id: 'role-2', // ID роли менеджера
    organizationId: 'org-1',
    locationId: 'loc-1',
    is_active: true,
    created_at: '2023-01-15T15:00:00Z',
    last_sign_in: null,
  },
  {
    id: 'user-2',
    email: 'petrova.ms@techno.com',
    full_name: 'Петрова Мария Сергеевна',
    role: 'EMPLOYEE',
    role_id: 'role-1', // ID роли сотрудника
    organizationId: 'org-1',
    locationId: 'loc-2',
    is_active: true,
    created_at: '2023-02-20T16:00:00Z',
    last_sign_in: null,
  },
  {
    id: 'user-3',
    email: 'sidorov.ap@prom.res',
    full_name: 'Сидоров Алексей Петрович',
    role: 'DIRECTOR',
    role_id: 'role-3', // ID роли директора
    organizationId: 'org-2',
    locationId: 'loc-3',
    is_active: false,
    created_at: '2023-03-10T17:00:00Z',
    last_sign_in: null,
  },
];

// Начальные поставщики
export const INITIAL_SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'ООО "ПоставкаПлюс"',
    legal_name: 'Общество с ограниченной ответственностью "ПоставкаПлюс"',
    inn_or_ogrn: '7701234567',
    contact_person: 'Смирнов Алексей Петрович',
    phone: '+7 (495) 123-45-67',
    email: 'info@postavkaplus.ru',
    website: 'www.postavkaplus.ru',
    address: 'г. Москва, ул. Поставщиков, д. 10',
    description: 'Поставщик офисных товаров и канцелярии',
    organizationId: 'org-1',
    status: 'active',
    created_at: '2023-03-15T10:00:00Z'
  },
  {
    id: 'sup-2',
    name: 'ИП Иванов А.С.',
    inn_or_ogrn: '770123456789',
    contact_person: 'Иванов Александр Сергеевич',
    phone: '+7 (495) 987-65-43',
    email: 'ivanov@example.com',
    address: 'г. Москва, ул. Предпринимателей, д. 5, оф. 101',
    organizationId: 'org-1',
    status: 'active',
    created_at: '2023-04-20T14:30:00Z'
  },
  {
    id: 'sup-3',
    name: 'АО "ТехноСнаб"',
    legal_name: 'Акционерное общество "ТехноСнаб"',
    inn_or_ogrn: '7809876543',
    contact_person: 'Петрова Елена Ивановна',
    phone: '+7 (812) 345-67-89',
    email: 'info@technosnab.ru',
    website: 'www.technosnab.ru',
    address: 'г. Санкт-Петербург, пр. Энергетиков, д. 15',
    description: 'Поставщик компьютерной техники и комплектующих',
    organizationId: 'org-2',
    status: 'inactive',
    created_at: '2023-02-10T09:15:00Z'
  }
];

// Пустой объект поставщика для инициализации форм
export const EMPTY_SUPPLIER = {
  id: '',
  name: '',
  legal_name: '',
  inn_or_ogrn: '',
  contact_person: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  description: '',
  organizationId: '',
  status: 'active',
  created_at: ''
};

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
