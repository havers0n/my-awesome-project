/**
 * Location entity API methods
 * Contains all API calls related to locations
 */

import axios from "axios";
import { Location, LocationFilters, LocationType } from "../model/types";

const API_BASE_URL = '/api';

export const locationApi = {
  // Get all locations with optional filters
  getLocations: async (filters?: LocationFilters): Promise<Location[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    
    const response = await axios.get(`${API_BASE_URL}/locations?${params.toString()}`);
    return response.data;
  },

  // Get location by ID
  getLocation: async (id: string): Promise<Location> => {
    const response = await axios.get(`${API_BASE_URL}/locations/${id}`);
    return response.data;
  },

  // Create new location
  createLocation: async (location: Omit<Location, 'id' | 'createdAt'>): Promise<Location> => {
    const response = await axios.post(`${API_BASE_URL}/locations`, location);
    return response.data;
  },

  // Update location
  updateLocation: async (id: string, location: Partial<Location>): Promise<Location> => {
    const response = await axios.put(`${API_BASE_URL}/locations/${id}`, location);
    return response.data;
  },

  // Delete location
  deleteLocation: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/locations/${id}`);
  },

  // Update location status
  updateLocationStatus: async (id: string, status: Location['status']): Promise<Location> => {
    const response = await axios.patch(`${API_BASE_URL}/locations/${id}/status`, { status });
    return response.data;
  },

  // Get locations by organization
  getLocationsByOrganization: async (organizationId: string): Promise<Location[]> => {
    const response = await axios.get(`${API_BASE_URL}/locations/organization/${organizationId}`);
    return response.data;
  },

  // Get locations by type
  getLocationsByType: async (type: LocationType): Promise<Location[]> => {
    const response = await axios.get(`${API_BASE_URL}/locations/type/${type}`);
    return response.data;
  },

  // Get operating locations
  getOperatingLocations: async (): Promise<Location[]> => {
    const response = await axios.get(`${API_BASE_URL}/locations/operating`);
    return response.data;
  },

  // Get location statistics
  getLocationStatistics: async (): Promise<{
    total: number;
    operating: number;
    closed_temp: number;
    closed_perm: number;
    renovation: number;
    byType: Record<LocationType, number>;
  }> => {
    const response = await axios.get(`${API_BASE_URL}/locations/statistics`);
    return response.data;
  }
};
