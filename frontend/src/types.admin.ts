
export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string; // ISO date string
}

export interface Permission {
  id: string;
  name: string; // Код разрешения, например 'view_users'
  description?: string;
  resource: string; // Ресурс, к которому относится разрешение (users, organizations, etc.)
  created_at: string; // ISO date string
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
}

export interface User {
  id: string;
  email: string;
  password?: string; // Optional, especially for existing users or if managed elsewhere
  full_name: string;
  role_id?: string; // ID роли
  role?: string; // Для обратной совместимости
  organizationId: string | null;
  locationId: string | null;
  is_active: boolean;
  created_at: string; // ISO date string
  last_sign_in: string | null; // ISO date string
  send_invitation?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  legalAddress: string;
  innOrOgrn: string;
  actualAddress?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  createdAt: string; // ISO date string
  status: 'active' | 'inactive'; 
}

export enum LocationType {
  OFFICE = 'office',
  WAREHOUSE = 'warehouse',
  SHOP = 'shop',
  PRODUCTION = 'production',
  OTHER = 'other'
}

export const LocationTypeLabels: Record<LocationType, string> = {
  [LocationType.OFFICE]: 'Офис',
  [LocationType.WAREHOUSE]: 'Склад',
  [LocationType.SHOP]: 'Магазин',
  [LocationType.PRODUCTION]: 'Производство',
  [LocationType.OTHER]: 'Другое',
};


export interface Location {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  type: LocationType;
  phone?: string;
  email?: string;
  workingHours?: string;
  responsiblePerson?: string; // Could be a user ID or just a name
  description?: string;
  status: 'operating' | 'closed_temp' | 'closed_perm' | 'renovation';
  createdAt: string; // ISO date string
}

export const LocationStatusLabels: Record<Location['status'], string> = {
  'operating': 'Работает',
  'closed_temp': 'Временно закрыта',
  'closed_perm': 'Закрыта',
  'renovation': 'На реконструкции',
};


export interface Filters {
  search: string;
  role: string; // 'all' or role value
  status: string; // 'all', 'active', 'inactive'
  organizationId: string; // 'all' or org ID
  locationId: string; // 'all' or loc ID
}

export interface OrganizationFilters {
  search: string;
  status: string; // 'all', 'active', 'inactive'
}


export interface LocationFilters {
  search: string;
  type: string; // 'all' or LocationType
  status: string; // 'all' or Location['status']
}

// Интерфейс для поставщиков
export interface Supplier {
  id: string;
  name: string;
  legal_name?: string;
  inn_or_ogrn?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  description?: string;
  organizationId: string;
  status: 'active' | 'inactive';
  created_at: string; // ISO date string
}

// Фильтры для поставщиков
export interface SupplierFilters {
  search: string;
  organizationId: string; // 'all' или ID организации
  status: string; // 'all', 'active', 'inactive'
}

// Фильтры для ролей
export interface RoleFilters {
  search: string;
}

// Метрики для sales-forecast
export type TimeMetric = { date: string; r2: number; mape: number; mae: number; rmse: number };
export type SkuMetric = { sku: string; r2: number; mape: number; mae: number; rmse: number };
export type StoreMetric = { store: string; r2: number; mape: number; mae: number; rmse: number };
export type MetricType = 'r2' | 'mape' | 'mae' | 'rmse';
export type SliceType = 'time' | 'sku' | 'store';

// Quality metrics interfaces
export interface QualityTimeMetric {
  date: string;
  r2: number;
  mape: number;
  mae: number;
  rmse: number;
}

export interface QualitySkuMetric {
  sku: string;
  r2: number;
  mape: number;
  mae: number;
  rmse: number;
}

export interface QualityStoreMetric {
  store: string;
  r2: number;
  mape: number;
  mae: number;
  rmse: number;
}

export interface QualityMetricsResponse {
  data: QualityTimeMetric[] | QualitySkuMetric[] | QualityStoreMetric[];
  avgR2: number;
  avgMape: number;
  avgMae: number;
  avgRmse: number;
}

// Статусы продуктов
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}

// Интерфейс продукта
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  status: ProductStatus;
  category?: string;
  sku?: string;
  created_at: string;
  updated_at: string;
}
