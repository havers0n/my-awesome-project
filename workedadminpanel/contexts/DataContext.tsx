
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, Organization, Location, Supplier, Role, Permission, RolePermission } from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_ORGANIZATIONS, 
  INITIAL_LOCATIONS, 
  INITIAL_SUPPLIERS, 
  INITIAL_ROLES, 
  INITIAL_PERMISSIONS, 
  INITIAL_ROLE_PERMISSIONS 
} from '../constants';

interface DataContextType {
  // Данные
  users: User[];
  organizations: Organization[];
  locations: Location[];
  suppliers: Supplier[];
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  
  // Методы для пользователей
  addUser: (user: Omit<User, 'id' | 'created_at' | 'last_sign_in'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  getUsersByOrgId: (orgId: string) => User[];
  getUsersByLocationId: (locId: string) => User[];
  
  // Методы для организаций
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => Organization;
  updateOrganization: (org: Organization) => void;
  deleteOrganization: (orgId: string) => void;
  
  // Методы для локаций
  addLocation: (loc: Omit<Location, 'id' | 'createdAt'>) => Location;
  updateLocation: (loc: Location) => void;
  deleteLocation: (locId: string) => void;
  getLocationsByOrgId: (orgId: string) => Location[];
  
  // Методы для поставщиков
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  getSuppliersByOrgId: (orgId: string) => Supplier[];
  
  // Методы для ролей и разрешений
  addRole: (role: Omit<Role, 'id' | 'created_at'>) => Role;
  updateRole: (role: Role) => void;
  deleteRole: (roleId: string) => void;
  getRoleById: (roleId: string) => Role | undefined;
  
  addPermission: (permission: Omit<Permission, 'id'>) => Permission;
  updatePermission: (permission: Permission) => void;
  deletePermission: (permissionId: string) => void;
  
  addRolePermission: (rolePermission: Omit<RolePermission, 'id'>) => RolePermission;
  deleteRolePermission: (roleId: string, permissionId: string) => void;
  getRolePermissions: (roleId: string) => Permission[];
  hasPermission: (roleId: string, permissionCode: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);

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

  // Методы для поставщиков
  const addSupplier = useCallback((supplierData: Omit<Supplier, 'id' | 'created_at'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback((updatedSupplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  }, []);

  const deleteSupplier = useCallback((supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  }, []);

  const getSuppliersByOrgId = useCallback((orgId: string): Supplier[] => {
    return suppliers.filter(supplier => supplier.organizationId === orgId);
  }, [suppliers]);

  // Методы для ролей
  const addRole = useCallback((roleData: Omit<Role, 'id' | 'created_at'>): Role => {
    const newRole: Role = {
      ...roleData,
      id: `role-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setRoles(prev => [...prev, newRole]);
    return newRole;
  }, []);

  const updateRole = useCallback((updatedRole: Role) => {
    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
  }, []);

  const deleteRole = useCallback((roleId: string) => {
    setRoles(prev => prev.filter(r => r.id !== roleId));
    // Удаляем связанные разрешения
    setRolePermissions(prev => prev.filter(rp => rp.role_id !== roleId));
    // Обновляем пользователей с этой ролью на роль по умолчанию (например, первую доступную)
    setUsers(prev => prev.map(u => u.role_id === roleId ? {...u, role_id: roles[0]?.id || null} : u));
  }, [roles]);

  const getRoleById = useCallback((roleId: string): Role | undefined => {
    return roles.find(role => role.id === roleId);
  }, [roles]);

  // Методы для разрешений
  const addPermission = useCallback((permissionData: Omit<Permission, 'id'>): Permission => {
    const newPermission: Permission = {
      ...permissionData,
      id: `perm-${Date.now()}`,
    };
    setPermissions(prev => [...prev, newPermission]);
    return newPermission;
  }, []);

  const updatePermission = useCallback((updatedPermission: Permission) => {
    setPermissions(prev => prev.map(p => p.id === updatedPermission.id ? updatedPermission : p));
  }, []);

  const deletePermission = useCallback((permissionId: string) => {
    setPermissions(prev => prev.filter(p => p.id !== permissionId));
    // Удаляем связанные роли-разрешения
    setRolePermissions(prev => prev.filter(rp => rp.permission_id !== permissionId));
  }, []);

  // Методы для связей ролей и разрешений
  const addRolePermission = useCallback((rolePermissionData: Omit<RolePermission, 'id'>): RolePermission => {
    const newRolePermission: RolePermission = {
      ...rolePermissionData,
      id: `rp-${Date.now()}`,
    };
    setRolePermissions(prev => [...prev, newRolePermission]);
    return newRolePermission;
  }, []);

  const deleteRolePermission = useCallback((roleId: string, permissionId: string) => {
    setRolePermissions(prev => 
      prev.filter(rp => !(rp.role_id === roleId && rp.permission_id === permissionId))
    );
  }, []);

  const getRolePermissions = useCallback((roleId: string): Permission[] => {
    const rolePermIds = rolePermissions
      .filter(rp => rp.role_id === roleId)
      .map(rp => rp.permission_id);
    
    return permissions.filter(p => rolePermIds.includes(p.id));
  }, [rolePermissions, permissions]);

  const hasPermission = useCallback((roleId: string, permissionCode: string): boolean => {
    const rolePerms = getRolePermissions(roleId);
    return rolePerms.some(p => p.code === permissionCode);
  }, [getRolePermissions]);

  return (
    <DataContext.Provider value={{
      // Данные
      users, organizations, locations, suppliers, roles, permissions, rolePermissions,
      
      // Методы для пользователей
      addUser, updateUser, deleteUser, getUsersByOrgId, getUsersByLocationId,
      
      // Методы для организаций
      addOrganization, updateOrganization, deleteOrganization,
      
      // Методы для локаций
      addLocation, updateLocation, deleteLocation, getLocationsByOrgId,
      
      // Методы для поставщиков
      addSupplier, updateSupplier, deleteSupplier, getSuppliersByOrgId,
      
      // Методы для ролей и разрешений
      addRole, updateRole, deleteRole, getRoleById,
      addPermission, updatePermission, deletePermission,
      addRolePermission, deleteRolePermission, getRolePermissions, hasPermission
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
