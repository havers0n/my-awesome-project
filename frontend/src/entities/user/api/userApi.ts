/**
 * User entity API methods
 * Contains all API calls related to users
 */

import axios from "axios";
import { User, Role, Permission, UserFilters } from "../model/types";

const API_BASE_URL = '/api';

// User API methods
export const userApi = {
  // Get all users with optional filters
  getUsers: async (filters?: UserFilters): Promise<User[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.organizationId && filters.organizationId !== 'all') params.append('organizationId', filters.organizationId);
    if (filters?.locationId && filters.locationId !== 'all') params.append('locationId', filters.locationId);
    
    const response = await axios.get(`${API_BASE_URL}/users?${params.toString()}`);
    return response.data;
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (user: Omit<User, 'id' | 'created_at'>): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/users`, user);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, user);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
  },

  // Toggle user status
  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await axios.patch(`${API_BASE_URL}/users/${id}/toggle-status`);
    return response.data;
  },

  // Send invitation to user
  sendInvitation: async (userId: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/users/${userId}/send-invitation`);
  },

  // Get user's permissions
  getUserPermissions: async (userId: string): Promise<Permission[]> => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/permissions`);
    return response.data;
  }
};

// Role API methods
export const roleApi = {
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
    const response = await axios.get(`${API_BASE_URL}/roles`);
    return response.data;
  },

  // Get role by ID
  getRole: async (id: string): Promise<Role> => {
    const response = await axios.get(`${API_BASE_URL}/roles/${id}`);
    return response.data;
  },

  // Create new role
  createRole: async (role: Omit<Role, 'id' | 'created_at'>): Promise<Role> => {
    const response = await axios.post(`${API_BASE_URL}/roles`, role);
    return response.data;
  },

  // Update role
  updateRole: async (id: string, role: Partial<Role>): Promise<Role> => {
    const response = await axios.put(`${API_BASE_URL}/roles/${id}`, role);
    return response.data;
  },

  // Delete role
  deleteRole: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/roles/${id}`);
  },

  // Get role permissions
  getRolePermissions: async (roleId: string): Promise<Permission[]> => {
    const response = await axios.get(`${API_BASE_URL}/roles/${roleId}/permissions`);
    return response.data;
  },

  // Update role permissions
  updateRolePermissions: async (roleId: string, permissionIds: string[]): Promise<void> => {
    await axios.put(`${API_BASE_URL}/roles/${roleId}/permissions`, { permissionIds });
  }
};

// Permission API methods
export const permissionApi = {
  // Get all permissions
  getPermissions: async (): Promise<Permission[]> => {
    const response = await axios.get(`${API_BASE_URL}/permissions`);
    return response.data;
  },

  // Get permission by ID
  getPermission: async (id: string): Promise<Permission> => {
    const response = await axios.get(`${API_BASE_URL}/permissions/${id}`);
    return response.data;
  },

  // Create new permission
  createPermission: async (permission: Omit<Permission, 'id' | 'created_at'>): Promise<Permission> => {
    const response = await axios.post(`${API_BASE_URL}/permissions`, permission);
    return response.data;
  },

  // Update permission
  updatePermission: async (id: string, permission: Partial<Permission>): Promise<Permission> => {
    const response = await axios.put(`${API_BASE_URL}/permissions/${id}`, permission);
    return response.data;
  },

  // Delete permission
  deletePermission: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/permissions/${id}`);
  }
};
