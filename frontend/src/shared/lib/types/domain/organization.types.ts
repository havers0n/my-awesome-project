/**
 * Organization entity types and models
 * Contains all business logic related to organizations
 */

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

export interface OrganizationFilters {
  search: string;
  status: string; // 'all', 'active', 'inactive'
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
  organizationId: string;
  status: 'active' | 'inactive';
  created_at: string; // ISO date string
}

export interface SupplierFilters {
  search: string;
  organizationId: string; // 'all' или ID организации
  status: string; // 'all', 'active', 'inactive'
}

// Organization utility functions
export const getOrganizationDisplayName = (organization: Organization): string => {
  return organization.name || 'Unknown Organization';
};

export const isOrganizationActive = (organization: Organization): boolean => {
  return organization.status === 'active';
};

export const getOrganizationStatusConfig = (status: 'active' | 'inactive') => {
  const baseConfig = {
    active: { icon: '✓', text: 'Active', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', borderColor: 'border-green-200' },
    inactive: { icon: '○', text: 'Inactive', bgColor: 'bg-gray-50', textColor: 'text-gray-700', iconColor: 'text-gray-500', borderColor: 'border-gray-200' }
  };
  
  return baseConfig[status] || baseConfig.inactive;
};

// Supplier utility functions
export const getSupplierDisplayName = (supplier: Supplier): string => {
  return supplier.name || 'Unknown Supplier';
};

export const isSupplierActive = (supplier: Supplier): boolean => {
  return supplier.status === 'active';
};

export const getSupplierStatusConfig = (status: 'active' | 'inactive') => {
  const baseConfig = {
    active: { icon: '✓', text: 'Active', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', borderColor: 'border-green-200' },
    inactive: { icon: '○', text: 'Inactive', bgColor: 'bg-gray-50', textColor: 'text-gray-700', iconColor: 'text-gray-500', borderColor: 'border-gray-200' }
  };
  
  return baseConfig[status] || baseConfig.inactive;
};
