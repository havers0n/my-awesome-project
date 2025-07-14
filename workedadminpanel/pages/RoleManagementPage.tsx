import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Role, Permission } from '../types';
import RoleFormModal from '../components/RoleFormModal';
import RolePermissionsModal from '../components/RolePermissionsModal';

const RoleManagementPage: React.FC = () => {
  const { roles, permissions, deleteRole, getRolePermissions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Модальные окна
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  // Фильтрация ролей
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Обработчики
  const handleAddRole = () => {
    setCurrentRole(null);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setIsRoleModalOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setCurrentRole(role);
    setIsPermissionsModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту роль? Все пользователи с этой ролью будут переназначены на роль по умолчанию.')) {
      deleteRole(roleId);
    }
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setCurrentRole(null);
  };

  const handleClosePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
    setCurrentRole(null);
  };

  // Получение количества разрешений для роли
  const getPermissionCount = (roleId: string): number => {
    const rolePermissions = getRolePermissions(roleId);
    return rolePermissions.length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Роли и разрешения</h1>
        <button
          onClick={handleAddRole}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Добавить роль
        </button>
      </div>

      {/* Поиск */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Название или описание роли"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Таблица ролей */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Разрешения</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRoles.length > 0 ? (
              filteredRoles.map(role => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {role.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {role.description || 'Нет описания'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPermissionCount(role.id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(role.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleManagePermissions(role)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Разрешения
                    </button>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={role.name.toLowerCase() === 'superadmin'}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Роли не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно для добавления/редактирования роли */}
      {isRoleModalOpen && (
        <RoleFormModal
          role={currentRole}
          onClose={handleCloseRoleModal}
        />
      )}

      {/* Модальное окно для управления разрешениями */}
      {isPermissionsModalOpen && currentRole && (
        <RolePermissionsModal
          role={currentRole}
          onClose={handleClosePermissionsModal}
        />
      )}
    </div>
  );
};

export default RoleManagementPage;