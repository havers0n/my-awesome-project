
import { User, Organization, Location, Role, LocationType } from './types';

export const ROLES: Role[] = [
  { value: 'employee', label: 'Сотрудник' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'director', label: 'Директор' },
  { value: 'admin', label: 'Администратор' },
  { value: 'superadmin', label: 'Суперадмин' }
];

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

export const ALL_OPTION_VALUE = 'all';
