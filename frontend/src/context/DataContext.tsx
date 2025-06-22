import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, Organization, Location } from '@/types';
import { INITIAL_USERS, INITIAL_ORGANIZATIONS, INITIAL_LOCATIONS } from '../constants';

interface DataContextType {
  users: User[];
  organizations: Organization[];
  locations: Location[];
  addUser: (user: Omit<User, 'id' | 'created_at' | 'last_sign_in'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => Organization;
  updateOrganization: (org: Organization) => void;
  deleteOrganization: (orgId: string) => void;
  addLocation: (loc: Omit<Location, 'id' | 'createdAt'>) => Location;
  updateLocation: (loc: Location) => void;
  deleteLocation: (locId: string) => void;
  getLocationsByOrgId: (orgId: string) => Location[];
  getUsersByOrgId: (orgId: string) => User[];
  getUsersByLocationId: (locId: string) => User[];
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);

  const addUser = useCallback((userData: Omit<User, 'id' | 'created_at' | 'last_sign_in'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
      last_sign_in: null,
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const addOrganization = useCallback((orgData: Omit<Organization, 'id' | 'createdAt'>): Organization => {
    const newOrg: Organization = {
      ...orgData,
      id: `org-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrganizations(prev => [...prev, newOrg]);
    return newOrg;
  }, []);

  const updateOrganization = useCallback((updatedOrg: Organization) => {
    setOrganizations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
  }, []);

  const deleteOrganization = useCallback((orgId: string) => {
    setOrganizations(prev => prev.filter(o => o.id !== orgId));
    setLocations(prev => prev.filter(l => l.organizationId !== orgId)); // Cascade delete locations
    setUsers(prev => prev.map(u => u.organizationId === orgId ? {...u, organizationId: null, locationId: null} : u)); // Unlink users
  }, []);

  const addLocation = useCallback((locData: Omit<Location, 'id' | 'createdAt'>): Location => {
    const newLoc: Location = {
      ...locData,
      id: `loc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLocations(prev => [...prev, newLoc]);
    return newLoc;
  }, []);

  const updateLocation = useCallback((updatedLoc: Location) => {
    setLocations(prev => prev.map(l => l.id === updatedLoc.id ? updatedLoc : l));
  }, []);

  const deleteLocation = useCallback((locId: string) => {
    setLocations(prev => prev.filter(l => l.id !== locId));
    setUsers(prev => prev.map(u => u.locationId === locId ? {...u, locationId: null} : u)); // Unlink users
  }, []);
  
  const getLocationsByOrgId = useCallback((orgId: string): Location[] => {
    return locations.filter(loc => loc.organizationId === orgId);
  }, [locations]);

  const getUsersByOrgId = useCallback((orgId: string): User[] => {
    return users.filter(user => user.organizationId === orgId);
  }, [users]);

  const getUsersByLocationId = useCallback((locId: string): User[] => {
    return users.filter(user => user.locationId === locId);
  }, [users]);

  return (
    <DataContext.Provider value={{
      users, organizations, locations,
      addUser, updateUser, deleteUser,
      addOrganization, updateOrganization, deleteOrganization,
      addLocation, updateLocation, deleteLocation,
      getLocationsByOrgId, getUsersByOrgId, getUsersByLocationId
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
