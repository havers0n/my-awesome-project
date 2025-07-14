import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { User, Filters, Location } from '../../types.admin';
import { ROLES, ALL_OPTION_VALUE } from '../../constants';
import UserFormModal from './UserFormModal';
import { Search, Plus, Edit, Eye, EyeOff, Trash2, RotateCcw, User as UserIcon, Mail, Shield, Building, MapPin, Calendar } from 'lucide-react';
import { useLocation as useReactRouterLocation, useNavigate } from 'react-router-dom';


const UserManagementPage: React.FC = () => {
  const { users, organizations, getLocationsByOrgId, deleteUser, updateUser: toggleUserStatusOptimistic } = useData();
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const navigate = useNavigate();
  const routerLocation = useReactRouterLocation();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    role: ALL_OPTION_VALUE,
    status: ALL_OPTION_VALUE,
    organizationId: ALL_OPTION_VALUE,
    locationId: ALL_OPTION_VALUE,
  });
  const [availableLocationsForFilter, setAvailableLocationsForFilter] = useState<Location[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const orgIdFromQuery = params.get('organizationId');
    const locIdFromQuery = params.get('locationId');

    if (orgIdFromQuery) {
      setFilters(prev => ({...prev, organizationId: orgIdFromQuery}));
      setAvailableLocationsForFilter(getLocationsByOrgId(orgIdFromQuery));
      if (locIdFromQuery) {
        setFilters(prev => ({...prev, locationId: locIdFromQuery, organizationId: orgIdFromQuery}));
      }
    }
    // Clean up query params from URL after applying them
    // This part is tricky with HashRouter and might not be straightforward to remove search without reload
    // For now, let's leave them, or user has to manually clear.
    // navigate(routerLocation.pathname, { replace: true }); 
  }, [routerLocation.search, getLocationsByOrgId, navigate, routerLocation.pathname]);


  useEffect(() => {
    if (filters.organizationId && filters.organizationId !== ALL_OPTION_VALUE) {
      setAvailableLocationsForFilter(getLocationsByOrgId(filters.organizationId));
      // If current locationId is not in new availableLocations, reset it
      if (filters.locationId !== ALL_OPTION_VALUE && !getLocationsByOrgId(filters.organizationId).find(loc => loc.id === filters.locationId)) {
        setFilters(prev => ({...prev, locationId: ALL_OPTION_VALUE}));
      }
    } else {
      setAvailableLocationsForFilter([]);
      setFilters(prev => ({...prev, locationId: ALL_OPTION_VALUE}));
    }
  }, [filters.organizationId, getLocationsByOrgId]);


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      role: ALL_OPTION_VALUE,
      status: ALL_OPTION_VALUE,
      organizationId: ALL_OPTION_VALUE,
      locationId: ALL_OPTION_VALUE,
    });
    setAvailableLocationsForFilter([]);
    navigate('/users', { replace: true }); // Clear query params from URL
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
      const matchesOrg = filters.organizationId === ALL_OPTION_VALUE || user.organizationId === filters.organizationId;
      const matchesLocation = filters.locationId === ALL_OPTION_VALUE || user.locationId === filters.locationId;
      
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
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
      deleteUser(userId);
    }
  };

  const toggleUserStatus = (user: User) => {
    toggleUserStatusOptimistic({ ...user, is_active: !user.is_active });
  };

  const getRoleLabel = (roleValue: string) => ROLES.find(r => r.value === roleValue)?.label || roleValue;
  const getOrganizationName = (orgId: string | null) => organizations.find(o => o.id === orgId)?.name || 'N/A';
  
  const getLocationName = (locId: string | null) => {
    if (!locId) return 'N/A';
    // This is not efficient, consider a map if performance is an issue
    const allLocations = organizations.flatMap(org => getLocationsByOrgId(org.id));
    return allLocations.find(l => l.id === locId)?.name || 'N/A';
  };


  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Никогда';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: 'var(--admin-background)' }}>
      <div className="max-w-full mx-auto">
        <div className="admin-card mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--admin-text)' }}>
                Управление пользователями
              </h1>
              <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                Всего пользователей: {users.length} | Активных: {users.filter(u => u.is_active).length}
              </p>
            </div>
            <button
              onClick={handleCreateUserClick}
              className="admin-btn-primary mt-4 sm:mt-0"
            >
              <Plus size={18} />
              Создать пользователя
            </button>
          </div>
        </div>

        <div className="admin-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            <div className="xl:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Поиск
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--admin-text-muted)' }} />
                <input
                  id="search"
                  name="search"
                  type="text"
                  placeholder="По email, ФИО..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="admin-input pl-10"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Роль
              </label>
              <select
                id="role"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="admin-input"
              >
                <option value={ALL_OPTION_VALUE}>Все роли</option>
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Статус
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="admin-input"
              >
                <option value={ALL_OPTION_VALUE}>Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="organizationId" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Организация
              </label>
              <select
                id="organizationId"
                name="organizationId"
                value={filters.organizationId}
                onChange={handleFilterChange}
                className="admin-input"
              >
                <option value={ALL_OPTION_VALUE}>Все организации</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="locationId" className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Точка
              </label>
              <select
                id="locationId"
                name="locationId"
                value={filters.locationId}
                onChange={handleFilterChange}
                className="admin-input"
                disabled={filters.organizationId === ALL_OPTION_VALUE && availableLocationsForFilter.length === 0}
              >
                <option value={ALL_OPTION_VALUE}>Все точки</option>
                {availableLocationsForFilter.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            
            <div className="xl:col-start-6">
                 <button
                    onClick={resetFilters}
                    className="admin-btn-secondary w-full"
                    title="Сбросить все фильтры"
                >
                    <RotateCcw size={16} />
                    Сбросить
                </button>
            </div>
          </div>
        </div>

        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  {['Email', 'ФИО', 'Роль', 'Организация', 'Точка', 'Статус', 'Регистрация', 'Действия'].map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
                        <span className="truncate" title={user.email} style={{ color: 'var(--admin-text)' }}>
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center text-sm">
                        <UserIcon className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
                        <span className="truncate" title={user.full_name} style={{ color: 'var(--admin-text)' }}>
                          {user.full_name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center text-sm">
                        <Shield className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
                        <span style={{ color: 'var(--admin-text)' }}>{getRoleLabel(user.role)}</span>
                      </div>
                    </td>
                    <td>
                        <div className="flex items-center text-sm">
                            <Building className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
                            <button 
                                onClick={() => user.organizationId && navigate(`/admin/organizations/${user.organizationId}`)} 
                                className={`text-sm truncate transition-colors ${
                                  user.organizationId 
                                    ? 'hover:underline' 
                                    : ''
                                }`}
                                style={{ 
                                  color: user.organizationId ? 'var(--admin-primary)' : 'var(--admin-text)'
                                }}
                                title={getOrganizationName(user.organizationId)}
                                disabled={!user.organizationId}
                            >
                                {getOrganizationName(user.organizationId)}
                            </button>
                        </div>
                    </td>
                    <td>
                        <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
                             <button 
                                onClick={() => user.organizationId && user.locationId && navigate(`/admin/organizations/${user.organizationId}?locationFocus=${user.locationId}`)} 
                                className={`text-sm truncate transition-colors ${
                                  user.locationId && user.organizationId 
                                    ? 'hover:underline' 
                                    : ''
                                }`}
                                style={{ 
                                  color: user.locationId && user.organizationId ? 'var(--admin-primary)' : 'var(--admin-text)'
                                }}
                                title={getLocationName(user.locationId)}
                                disabled={!user.locationId || !user.organizationId}
                            >
                                {getLocationName(user.locationId)}
                            </button>
                        </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        user.is_active
                          ? 'admin-badge-success'
                          : 'admin-badge-error'
                      }`}>
                        {user.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
                        <span style={{ color: 'var(--admin-text)' }}>{formatDate(user.created_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUserClick(user)}
                          className="p-1 rounded-md transition-colors hover:bg-amber-50"
                          style={{ color: 'var(--admin-primary)' }}
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className={`p-1 rounded-md transition-colors ${
                            user.is_active
                              ? 'hover:bg-yellow-50'
                              : 'hover:bg-green-50'
                          }`}
                          style={{ 
                            color: user.is_active ? 'var(--admin-warning)' : 'var(--admin-success)'
                          }}
                          title={user.is_active ? 'Деактивировать' : 'Активировать'}
                        >
                          {user.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 rounded-md transition-colors hover:bg-red-50"
                          style={{ color: 'var(--admin-error)' }}
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-10">
              <Search size={48} className="mx-auto mb-4" style={{ color: 'var(--admin-text-muted)' }} />
              <p className="text-lg" style={{ color: 'var(--admin-text-muted)' }}>
                Пользователи не найдены
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                Попробуйте изменить критерии поиска или сбросить фильтры.
              </p>
            </div>
          )}
        </div>
      </div>

      <UserFormModal
        isOpen={showUserFormModal}
        onClose={() => setShowUserFormModal(false)}
        userToEdit={editingUser}
      />
    </div>
  );
};

export default UserManagementPage;
