
export interface Role {
  value: string;
  label: string;
}

export interface User {
  id: string;
  email: string;
  password?: string; // Optional, especially for existing users or if managed elsewhere
  full_name: string;
  role: string; // role value
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
