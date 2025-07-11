import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Role, RoleFilters } from '@/types';
import RoleFormModal from './RoleFormModal';
import RolePermissionsModal from './RolePermissionsModal';

const RoleManagementPage: React.FC = () => {
  const { roles, deleteRole, hasPermission } = useData();
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
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Управление ролями</h1>
        {hasPermission('roles', 'create') && (
          <button
            onClick={handleAddRole}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Добавить роль
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Поиск ролей..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Таблица ролей */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRoles.length > 0 ? (
              filteredRoles.map(role => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{role.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {hasPermission('roles', 'update') && (
                        <button
                          onClick={() => handleManagePermissions(role)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Разрешения
                        </button>
                      )}
                      {hasPermission('roles', 'update') && (
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Изменить
                        </button>
                      )}
                      {hasPermission('roles', 'delete') && (
                        <button
                          onClick={() => handleDeleteClick(role)}
                          className="text-red-600 hover:text-red-900"
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
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  {filters.search
                    ? 'Роли не найдены. Попробуйте изменить параметры поиска.'
                    : 'Нет доступных ролей. Нажмите "Добавить роль", чтобы создать новую.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить роль "{confirmDelete.role?.name}"? Это действие нельзя отменить.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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