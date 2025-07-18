import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { User, Filters, Location } from '../../types.admin';
import { ROLES, ALL_OPTION_VALUE } from '../../constants';
import UserFormModal from './UserFormModal';
import { Search, Plus, Edit, Eye, EyeOff, Trash2, RotateCcw, User as UserIcon, Mail, Shield, Building, MapPin, Calendar } from 'lucide-react';
import { useLocation as useReactRouterLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


const UserManagementPage: React.FC = () => {
  const { users, organizations, getLocationsByOrgId, deleteUser, updateUser: toggleUserStatusOptimistic } = useData();
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const navigate = useNavigate();
  const routerLocation = useReactRouterLocation();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    role: ALL_OPTION_VALUE,
    status: ALL_OPTION_VALUE,
    organization_id: ALL_OPTION_VALUE,
    location_id: ALL_OPTION_VALUE,
  });
  const [availableLocationsForFilter, setAvailableLocationsForFilter] = useState<Location[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const orgIdFromQuery = params.get('organization_id');
    const locIdFromQuery = params.get('location_id');

    if (orgIdFromQuery) {
      setFilters(prev => ({...prev, organization_id: orgIdFromQuery}));
      setAvailableLocationsForFilter(getLocationsByOrgId(orgIdFromQuery));
      if (locIdFromQuery) {
        setFilters(prev => ({...prev, location_id: locIdFromQuery, organization_id: orgIdFromQuery}));
      }
    }
  }, [routerLocation.search, getLocationsByOrgId, navigate, routerLocation.pathname]);


  useEffect(() => {
    if (filters.organization_id && filters.organization_id !== ALL_OPTION_VALUE) {
      setAvailableLocationsForFilter(getLocationsByOrgId(String(filters.organization_id)));
      if (filters.location_id !== ALL_OPTION_VALUE && !getLocationsByOrgId(String(filters.organization_id)).find(loc => String(loc.id) === String(filters.location_id))) {
        setFilters(prev => ({...prev, location_id: ALL_OPTION_VALUE}));
      }
    } else {
      setAvailableLocationsForFilter([]);
      setFilters(prev => ({...prev, location_id: ALL_OPTION_VALUE}));
    }
  }, [filters.organization_id, getLocationsByOrgId]);


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      role: ALL_OPTION_VALUE,
      status: ALL_OPTION_VALUE,
      organization_id: ALL_OPTION_VALUE,
      location_id: ALL_OPTION_VALUE,
    });
    setAvailableLocationsForFilter([]);
    navigate('/users', { replace: true });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = user.email.toLowerCase().includes(searchLower) ||
                            user.full_name.toLowerCase().includes(searchLower);
      const matchesRole = filters.role === ALL_OPTION_VALUE || user.role === filters.role;
      const matchesStatus = filters.status === ALL_OPTION_VALUE ||
                            (filters.status === 'active' && user.is_active) ||
                            (filters.status === 'inactive' && !user.is_active);
      const matchesOrg = filters.organization_id === ALL_OPTION_VALUE || String(user.organization_id) === String(filters.organization_id);
      const matchesLocation = filters.location_id === ALL_OPTION_VALUE || String(user.location_id) === String(filters.location_id);
      
      return matchesSearch && matchesRole && matchesStatus && matchesOrg && matchesLocation;
    });
  }, [users, filters]);

  const handleCreateUserClick = () => {
    setEditingUser(null);
    setShowUserFormModal(true);
  };

  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setShowUserFormModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm(t('userManagement.deleteConfirmation'))) {
      deleteUser(userId);
    }
  };

  const toggleUserStatus = (user: User) => {
    toggleUserStatusOptimistic({ ...user, is_active: !user.is_active });
  };

  const getRoleLabel = (roleValue: string) => ROLES.find(r => r.value === roleValue)?.label || roleValue;
  
  const getOrganizationName = (user: User): string => {
    const orgId = user.organization_id;
    if (orgId === null || orgId === undefined) {
      return t('common.notApplicable');
    }
    const organization = organizations.find(o => String(o.id) === String(orgId));
    return organization?.name || t('common.notFound');
  };
  
  const getLocationName = (locId: string | number | null): string => {
    if (!locId) return t('common.notApplicable');
    const allLocations = organizations.flatMap(org => getLocationsByOrgId(org.id));
    return allLocations.find(l => String(l.id) === String(locId))?.name || t('common.notApplicable');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('common.never');
    return new Date(dateString).toLocaleDateString('ru-RU'); // Consider using date-fns for locale-aware formatting
  };

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: 'var(--admin-background)' }}>
      <div className="max-w-full mx-auto">
        <div className="admin-card mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--admin-text)' }}>
                {t('userManagement.title')}
              </h1>
              <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                {t('common.status')}: {users.length} | {t('common.active')}: {users.filter(u => u.is_active).length}
              </p>
            </div>
            <button onClick={handleCreateUserClick} className="admin-btn-primary mt-4 sm:mt-0">
              <Plus size={18} />
              {t('userManagement.createUser')}
            </button>
          </div>
        </div>

        <div className="admin-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            <div className="xl:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>{t('common.search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--admin-text-muted)' }} />
                <input id="search" name="search" type="text" placeholder={t('userManagement.searchPlaceholder')} value={filters.search} onChange={handleFilterChange} className="admin-input pl-10" />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>{t('common.role')}</label>
              <select id="role" name="role" value={filters.role} onChange={handleFilterChange} className="admin-input">
                <option value={ALL_OPTION_VALUE}>{t('common.allRoles')}</option>
                {ROLES.map(role => (<option key={role.value} value={role.value}>{role.label}</option>))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>{t('common.status')}</label>
              <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="admin-input">
                <option value={ALL_OPTION_VALUE}>{t('common.allStatuses')}</option>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="organization_id" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>{t('common.organization')}</label>
              <select id="organization_id" name="organization_id" value={filters.organization_id || ALL_OPTION_VALUE} onChange={handleFilterChange} className="admin-input">
                <option value={ALL_OPTION_VALUE}>{t('common.allOrganizations')}</option>
                {organizations.map(org => (<option key={org.id} value={org.id}>{org.name}</option>))}
              </select>
            </div>
            
            <div>
              <label htmlFor="location_id" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>{t('common.location')}</label>
              <select id="location_id" name="location_id" value={filters.location_id || ALL_OPTION_VALUE} onChange={handleFilterChange} className="admin-input" disabled={!filters.organization_id || filters.organization_id === ALL_OPTION_VALUE}>
                <option value={ALL_OPTION_VALUE}>{t('common.allLocations')}</option>
                {availableLocationsForFilter.map(loc => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
              </select>
            </div>
            
            <div className="xl:col-start-6">
              <button onClick={resetFilters} className="admin-btn-secondary w-full" title={t('userManagement.resetFilters')}>
                <RotateCcw size={16} /> {t('common.reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto admin-card">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--admin-border)' }}>
            <thead style={{ backgroundColor: 'var(--admin-secondary-background)' }}>
              <tr>
                {[t('userManagement.table.user'), t('userManagement.table.orgAndLocation'), t('userManagement.table.status'), t('userManagement.table.dates'), t('userManagement.table.actions')].map(header => (
                  <th key={header} scope="col" className="p-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-background)' }}>
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-[var(--admin-secondary-background)] transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
                        <UserIcon className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} /> {user.full_name}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{user.email}</div>
                      <div className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                        <Shield className="inline h-4 w-4 mr-1" />{getRoleLabel(user.role || '')}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-sm">
                        <Building className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
                        {user.organization_id ? (
                          <button onClick={() => user.organization_id && navigate(`/admin/organizations/${user.organization_id}`)} className="font-medium text-left hover:underline" style={{ color: 'var(--admin-primary)' }} title={getOrganizationName(user)}>
                            {getOrganizationName(user)}
                          </button>
                        ) : (
                          <span className="font-medium" style={{ color: 'var(--admin-text)' }}>{getOrganizationName(user)}</span>
                        )}
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
                        <span className="font-medium">{getLocationName(user.location_id)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`admin-badge ${user.is_active ? 'admin-badge-success' : 'admin-badge-error'}`}>
                      {user.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                    <div>{t('userManagement.regDate')}: {formatDate(user.created_at)}</div>
                    <div>{t('userManagement.lastLogin')}: {formatDate(user.last_sign_in_at)}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => toggleUserStatus(user)} className="admin-btn-icon" title={user.is_active ? t('common.deactivate') : t('common.activate')}>
                        {user.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => handleEditUserClick(user)} className="admin-btn-icon" title={t('common.edit')}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="admin-btn-icon-danger" title={t('common.delete')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto" style={{ color: 'var(--admin-text-muted)' }} />
              <h3 className="mt-2 text-lg font-medium" style={{ color: 'var(--admin-text)' }}>{t('userManagement.noUsersFound')}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('userManagement.tryChangeCriteria')}</p>
            </div>
          )}
        </div>
      </div>
      <UserFormModal isOpen={showUserFormModal} onClose={() => setShowUserFormModal(false)} userToEdit={editingUser} />
    </div>
  );
};

export default UserManagementPage;
