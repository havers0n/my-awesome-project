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

// Пустой объект пользователя для инициализации форм
export const EMPTY_USER = {
  id: '',
  email: '',
  password: '',
  full_name: '',
  role: 'EMPLOYEE',
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
    organizationId: 'org-2',
    locationId: 'loc-3',
    is_active: false,
    created_at: '2023-03-10T17:00:00Z',
    last_sign_in: null,
  },
];