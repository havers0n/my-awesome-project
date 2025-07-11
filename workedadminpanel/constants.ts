
import { User, Organization, Location, Role, Permission, RolePermission, Supplier, LocationType } from './types';

export const INITIAL_ROLES: Role[] = [
  { id: 'role-1', name: 'Сотрудник', description: 'Базовые права для работы с системой', created_at: '2024-01-01T00:00:00Z' },
  { id: 'role-2', name: 'Менеджер', description: 'Управление данными в рамках своей организации', created_at: '2024-01-01T00:00:00Z' },
  { id: 'role-3', name: 'Директор', description: 'Полный доступ к данным своей организации', created_at: '2024-01-01T00:00:00Z' },
  { id: 'role-4', name: 'Администратор', description: 'Управление всеми организациями и пользователями', created_at: '2024-01-01T00:00:00Z' },
  { id: 'role-5', name: 'Суперадмин', description: 'Полный доступ ко всем функциям системы', created_at: '2024-01-01T00:00:00Z' }
];

export const INITIAL_PERMISSIONS: Permission[] = [
  { id: 'perm-1', name: 'view_organizations', description: 'Просмотр организаций', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-2', name: 'create_organizations', description: 'Создание организаций', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-3', name: 'edit_organizations', description: 'Редактирование организаций', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-4', name: 'delete_organizations', description: 'Удаление организаций', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-5', name: 'view_locations', description: 'Просмотр точек', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-6', name: 'create_locations', description: 'Создание точек', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-7', name: 'edit_locations', description: 'Редактирование точек', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-8', name: 'delete_locations', description: 'Удаление точек', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-9', name: 'view_suppliers', description: 'Просмотр поставщиков', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-10', name: 'create_suppliers', description: 'Создание поставщиков', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-11', name: 'edit_suppliers', description: 'Редактирование поставщиков', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-12', name: 'delete_suppliers', description: 'Удаление поставщиков', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-13', name: 'view_users', description: 'Просмотр пользователей', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-14', name: 'create_users', description: 'Создание пользователей', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-15', name: 'edit_users', description: 'Редактирование пользователей', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-16', name: 'delete_users', description: 'Удаление пользователей', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-17', name: 'view_roles', description: 'Просмотр ролей', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-18', name: 'create_roles', description: 'Создание ролей', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-19', name: 'edit_roles', description: 'Редактирование ролей', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-20', name: 'delete_roles', description: 'Удаление ролей', created_at: '2024-01-01T00:00:00Z' },
  { id: 'perm-21', name: 'assign_permissions', description: 'Назначение разрешений', created_at: '2024-01-01T00:00:00Z' }
];

export const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
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

// Для обратной совместимости
export const ROLES = INITIAL_ROLES.map(role => ({ value: role.id, label: role.name }));

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'ООО "ТехноИнновации"',
    legalAddress: 'г. Москва, ул. Центральная, д. 1, оф. 101',
    innOrOgrn: '7700000001',
    actualAddress: 'г. Москва, ул. Центральная, д. 1, оф. 101',
    phone: '+7 (495) 123-45-67',
    email: 'info@technoinnovacii.com',
    website: 'www.technoinnovacii.com',
    createdAt: '2023-01-10T10:00:00Z',
    status: 'active'
  },
  {
    id: 'org-2',
    name: 'АО "ПромРесурс"',
    legalAddress: 'г. Санкт-Петербург, пр. Невский, д. 20',
    innOrOgrn: '7800000002',
    createdAt: '2022-11-05T14:30:00Z',
    status: 'active'
  },
  {
    id: 'org-3',
    name: 'ИП "СтройМастер"',
    legalAddress: 'г. Казань, ул. Строителей, д. 5',
    innOrOgrn: '1600000003',
    createdAt: '2023-05-20T09:15:00Z',
    status: 'inactive'
  }
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-1-1',
    organizationId: 'org-1',
    name: 'Центральный офис (Москва)',
    address: 'г. Москва, ул. Центральная, д. 1, оф. 101',
    type: LocationType.OFFICE,
    phone: '+7 (495) 123-45-67',
    status: 'operating',
    createdAt: '2023-01-10T10:00:00Z'
  },
  {
    id: 'loc-1-2',
    organizationId: 'org-1',
    name: 'Склад №1 (Подмосковье)',
    address: 'МО, г. Видное, ул. Складская, д. 10',
    type: LocationType.WAREHOUSE,
    status: 'operating',
    createdAt: '2023-02-15T11:00:00Z'
  },
  {
    id: 'loc-2-1',
    organizationId: 'org-2',
    name: 'Филиал "Северный" (СПб)',
    address: 'г. Санкт-Петербург, пр. Северный, д. 55',
    type: LocationType.OFFICE,
    status: 'operating',
    createdAt: '2022-12-01T09:00:00Z'
  },
  {
    id: 'loc-2-2',
    organizationId: 'org-2',
    name: 'Производственный цех (СПб)',
    address: 'г. Санкт-Петербург, ул. Заводская, д. 3',
    type: LocationType.PRODUCTION,
    status: 'renovation',
    createdAt: '2023-03-01T09:00:00Z'
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@company.com',
    full_name: 'Иванов Иван Иванович',
    role: 'manager',
    organizationId: 'org-1',
    locationId: 'loc-1-1',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    last_sign_in: '2024-06-18T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'maria.smith@company.com',
    full_name: 'Петрова Мария Сергеевна',
    role: 'employee',
    organizationId: 'org-1',
    locationId: 'loc-1-2',
    is_active: true,
    created_at: '2024-02-20T00:00:00Z',
    last_sign_in: '2024-06-17T00:00:00Z'
  },
  {
    id: 'user-3',
    email: 'alex.wilson@company.com',
    full_name: 'Сидоров Алексей Петрович',
    role: 'director',
    organizationId: 'org-2',
    locationId: 'loc-2-1',
    is_active: false,
    created_at: '2024-03-10T00:00:00Z',
    last_sign_in: '2024-05-15T00:00:00Z'
  },
  {
    id: 'user-4',
    email: 'olga.k@org2.ru',
    full_name: 'Кузнецова Ольга Викторовна',
    role: 'admin',
    organizationId: 'org-2',
    locationId: 'loc-2-1',
    is_active: true,
    created_at: '2023-11-15T00:00:00Z',
    last_sign_in: '2024-06-19T00:00:00Z'
  }
];

export const EMPTY_USER: Omit<User, 'id' | 'created_at' | 'last_sign_in'> = {
  email: '',
  password: '',
  full_name: '',
  role: ROLES[0]?.value || 'employee',
  organizationId: null,
  locationId: null,
  is_active: true,
  send_invitation: false,
};

export const EMPTY_ORGANIZATION: Omit<Organization, 'id' | 'createdAt'> = {
  name: '',
  legalAddress: '',
  innOrOgrn: '',
  actualAddress: '',
  phone: '',
  email: '',
  website: '',
  description: '',
  logoUrl: '',
  status: 'active',
};

export const EMPTY_LOCATION: Omit<Location, 'id' | 'createdAt' | 'organizationId'> = {
  name: '',
  address: '',
  type: LocationType.OFFICE,
  phone: '',
  email: '',
  workingHours: '',
  responsiblePerson: '',
  description: '',
  status: 'operating',
};

export const INITIAL_SUPPLIERS: Supplier[] = [
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

export const EMPTY_SUPPLIER: Omit<Supplier, 'id' | 'created_at'> = {
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
  status: 'active'
};

export const ALL_OPTION_VALUE = 'all';
