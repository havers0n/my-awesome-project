
export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string; // ISO date string
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
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
  role_id: string; // role id instead of role value
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

export const LocationTypeName: Record<LocationType, string> = {
  [LocationType.OFFICE]: 'Office',
  [LocationType.WAREHOUSE]: 'Warehouse',
  [LocationType.SHOP]: 'Shop',
  [LocationType.PRODUCTION]: 'Production',
  [LocationType.OTHER]: 'Other',
};

export enum LocationStatus {
  OPERATING = 'operating',
  CLOSED_TEMP = 'closed_temp',
  CLOSED_PERM = 'closed_perm',
  RENOVATION = 'renovation',
}

export const LocationStatusName: Record<LocationStatus, string> = {
  'operating': 'Operating',
  'closed_temp': 'Temporarily Closed',
  'closed_perm': 'Permanently Closed',
  'renovation': 'Under Renovation',
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
  organizationId: string; // Organization this supplier belongs to
  status: 'active' | 'inactive';
  created_at: string; // ISO date string
}

export interface SupplierFilters {
  search: string;
  organizationId: string; // 'all' or org ID
  status: string; // 'all', 'active', 'inactive'
}
