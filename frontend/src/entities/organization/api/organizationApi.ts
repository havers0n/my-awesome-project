/**
 * Organization entity API methods
 * Contains all API calls related to organizations
 */

import axios from "axios";
import { Organization, OrganizationFilters, Supplier, SupplierFilters } from "../model/types";

const API_BASE_URL = '/api';

export const organizationApi = {
  // Get all organizations with optional filters
  getOrganizations: async (filters?: OrganizationFilters): Promise<Organization[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    
    const response = await axios.get(`${API_BASE_URL}/organizations?${params.toString()}`);
    return response.data;
  },

  // Get organization by ID
  getOrganization: async (id: string): Promise<Organization> => {
    const response = await axios.get(`${API_BASE_URL}/organizations/${id}`);
    return response.data;
  },

  // Create new organization
  createOrganization: async (organization: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> => {
    const response = await axios.post(`${API_BASE_URL}/organizations`, organization);
    return response.data;
  },

  // Update organization
  updateOrganization: async (id: string, organization: Partial<Organization>): Promise<Organization> => {
    const response = await axios.put(`${API_BASE_URL}/organizations/${id}`, organization);
    return response.data;
  },

  // Delete organization
  deleteOrganization: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/organizations/${id}`);
  },

  // Toggle organization status
  toggleOrganizationStatus: async (id: string): Promise<Organization> => {
    const response = await axios.patch(`${API_BASE_URL}/organizations/${id}/toggle-status`);
    return response.data;
  }
};

export const supplierApi = {
  // Get all suppliers with optional filters
  getSuppliers: async (filters?: SupplierFilters): Promise<Supplier[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.organizationId && filters.organizationId !== 'all') params.append('organizationId', filters.organizationId);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    
    const response = await axios.get(`${API_BASE_URL}/suppliers?${params.toString()}`);
    return response.data;
  },

  // Get supplier by ID
  getSupplier: async (id: string): Promise<Supplier> => {
    const response = await axios.get(`${API_BASE_URL}/suppliers/${id}`);
    return response.data;
  },

  // Create new supplier
  createSupplier: async (supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> => {
    const response = await axios.post(`${API_BASE_URL}/suppliers`, supplier);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
    const response = await axios.put(`${API_BASE_URL}/suppliers/${id}`, supplier);
    return response.data;
  },

  // Delete supplier
  deleteSupplier: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/suppliers/${id}`);
  },

  // Toggle supplier status
  toggleSupplierStatus: async (id: string): Promise<Supplier> => {
    const response = await axios.patch(`${API_BASE_URL}/suppliers/${id}/toggle-status`);
    return response.data;
  },

  // Get suppliers by organization
  getSuppliersByOrganization: async (organizationId: string): Promise<Supplier[]> => {
    const response = await axios.get(`${API_BASE_URL}/suppliers/organization/${organizationId}`);
    return response.data;
  }
};
