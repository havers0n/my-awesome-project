/**
 * Location entity types and models
 * Contains all business logic related to locations
 */

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

export interface LocationFilters {
  search: string;
  type: string; // 'all' or LocationType
  status: string; // 'all' or Location['status']
}

// Location utility functions
export const getLocationDisplayName = (location: Location): string => {
  return location.name || 'Unknown Location';
};

export const isLocationOperating = (location: Location): boolean => {
  return location.status === 'operating';
};

export const getLocationStatusConfig = (status: Location['status']) => {
  const baseConfig = {
    operating: { icon: '✓', text: 'Operating', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', borderColor: 'border-green-200' },
    closed_temp: { icon: '⏸️', text: 'Temp. Closed', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', iconColor: 'text-yellow-500', borderColor: 'border-yellow-200' },
    closed_perm: { icon: '❌', text: 'Closed', bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-500', borderColor: 'border-red-200' },
    renovation: { icon: '🔧', text: 'Renovation', bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-500', borderColor: 'border-blue-200' }
  };
  
  return baseConfig[status] || baseConfig.operating;
};

export const getLocationTypeConfig = (type: LocationType) => {
  const baseConfig = {
    [LocationType.OFFICE]: { icon: '🏢', text: 'Office', bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-500', borderColor: 'border-blue-200' },
    [LocationType.WAREHOUSE]: { icon: '🏭', text: 'Warehouse', bgColor: 'bg-purple-50', textColor: 'text-purple-700', iconColor: 'text-purple-500', borderColor: 'border-purple-200' },
    [LocationType.SHOP]: { icon: '🏪', text: 'Shop', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', borderColor: 'border-green-200' },
    [LocationType.PRODUCTION]: { icon: '🏭', text: 'Production', bgColor: 'bg-orange-50', textColor: 'text-orange-700', iconColor: 'text-orange-500', borderColor: 'border-orange-200' },
    [LocationType.OTHER]: { icon: '📍', text: 'Other', bgColor: 'bg-gray-50', textColor: 'text-gray-700', iconColor: 'text-gray-500', borderColor: 'border-gray-200' }
  };
  
  return baseConfig[type] || baseConfig[LocationType.OTHER];
};
