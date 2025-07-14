/**
 * User entity types and models
 * Contains all business logic related to users
 */

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

export interface UserFilters {
  search: string;
  role: string; // 'all' or role value
  status: string; // 'all', 'active', 'inactive'
  organizationId: string; // 'all' or org ID
  locationId: string; // 'all' or loc ID
}

export interface RoleFilters {
  search: string;
}

// User status utilities
export const getUserStatus = (user: User): 'active' | 'inactive' => {
  return user.is_active ? 'active' : 'inactive';
};

export const getUserDisplayName = (user: User): string => {
  return user.full_name || user.email;
};

export const getUserInitials = (user: User): string => {
  const name = getUserDisplayName(user);
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
