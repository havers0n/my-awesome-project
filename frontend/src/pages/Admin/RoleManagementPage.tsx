import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Role } from '../../types.admin';
import RoleFormModal from './RoleFormModal';
import RolePermissionsModal from './RolePermissionsModal';

interface RoleFilters {
  search: string;
}

const RoleManagementPage: React.FC = () => {
  const { roles, deleteRole, hasPermission, getRolePermissions } = useData();
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [filters, setFilters] = useState<RoleFilters>({
    search: ''
  });
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; role: Role | null }>({ 
    open: false, 
    role: null 
  });

  // Применение фильтров
  useEffect(() => {
    let result = [...roles];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(role => 
        role.name.toLowerCase().includes(searchLower) ||
        (role.description && role.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Сортировка по имени
    result.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredRoles(result);
  }, [roles, filters]);

  // Обработчики модальных окон
  const handleAddRole = () => {
    setSelectedRole(null);
    setIsFormModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsFormModalOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setConfirmDelete({ open: true, role });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.role) {
      deleteRole(confirmDelete.role.id);
      setConfirmDelete({ open: false, role: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, role: null });
  };

  // Обработчик изменения поиска
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev: RoleFilters) => ({ ...prev, search: e.target.value }));
  };

  // Получение количества разрешений для роли
  const getPermissionCount = (roleId: string): number => {
    const rolePermissions = getRolePermissions ? getRolePermissions(roleId) : [];
    return rolePermissions.length;
  };

  return (
    <div className="admin-card mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--admin-text)' }}>
            Роли и разрешения
          </h1>
          <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            Всего ролей: {roles.length} | Найдено: {filteredRoles.length}
          </p>
        </div>
        {hasPermission('roles', 'create') && (
          <button
            onClick={handleAddRole}
            className="admin-btn-primary"
          >
            Добавить роль
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div className="admin-card mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
            Поиск
          </label>
          <input
            type="text"
            placeholder="Название или описание роли"
            value={filters.search}
            onChange={handleSearchChange}
            className="admin-input"
          />
        </div>
      </div>

      {/* Таблица ролей */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th>Разрешения</th>
                <th>Создано</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map(role => (
                  <tr key={role.id}>
                    <td>
                      <div className="font-medium" style={{ color: 'var(--admin-text)' }}>
                        {role.name}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                        {role.description || 'Нет описания'}
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-success">
                        {getPermissionCount(role.id)}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                        {new Date(role.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleManagePermissions(role)}
                          className="p-1 rounded-md transition-colors hover:bg-amber-50"
                          style={{ color: 'var(--admin-primary)' }}
                          title="Разрешения"
                        >
                          Разрешения
                        </button>
                        {hasPermission('roles', 'update') && (
                          <button
                            onClick={() => handleEditRole(role)}
                            className="p-1 rounded-md transition-colors hover:bg-amber-50"
                            style={{ color: 'var(--admin-primary)' }}
                            title="Редактировать"
                          >
                            Редактировать
                          </button>
                        )}
                        {hasPermission('roles', 'delete') && role.name.toLowerCase() !== 'superadmin' && (
                          <button
                            onClick={() => handleDeleteClick(role)}
                            className="p-1 rounded-md transition-colors hover:bg-red-50"
                            style={{ color: 'var(--admin-error)' }}
                            title="Удалить"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="text-center py-10">
                      <div className="text-lg" style={{ color: 'var(--admin-text-muted)' }}>
                        Роли не найдены
                      </div>
                      <div className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                        {filters.search
                          ? 'Попробуйте изменить критерии поиска.'
                          : 'Нажмите "Добавить роль", чтобы создать новую.'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальные окна */}
      {isFormModalOpen && (
        <RoleFormModal
          role={selectedRole}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}

      {isPermissionsModalOpen && selectedRole && (
        <RolePermissionsModal
          role={selectedRole}
          onClose={() => setIsPermissionsModalOpen(false)}
        />
      )}

      {/* Модальное окно подтверждения удаления */}
      {confirmDelete.open && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--admin-text)' }}>
              Подтверждение удаления
            </h3>
            <p className="mb-6" style={{ color: 'var(--admin-text-muted)' }}>
              Вы уверены, что хотите удалить роль "{confirmDelete.role?.name}"? 
              Все пользователи с этой ролью будут переназначены на роль по умолчанию.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="admin-btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                className="admin-btn-primary"
                style={{ backgroundColor: 'var(--admin-error)' }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPage;