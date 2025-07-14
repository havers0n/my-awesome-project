import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Role, Permission } from '../types';

interface RolePermissionsModalProps {
  role: Role;
  onClose: () => void;
}

const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({ role, onClose }) => {
  const { permissions, getRolePermissions, addRolePermission, deleteRolePermission } = useData();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Группировка разрешений по ресурсу
  const groupedPermissions: Record<string, Permission[]> = {};
  permissions.forEach(permission => {
    const resource = permission.resource;
    if (!groupedPermissions[resource]) {
      groupedPermissions[resource] = [];
    }
    groupedPermissions[resource].push(permission);
  });

  // Инициализация выбранных разрешений
  useEffect(() => {
    const rolePermissions = getRolePermissions(role.id);
    setSelectedPermissions(rolePermissions.map(p => p.id));
  }, [role.id, getRolePermissions]);

  // Обработка изменения выбора разрешения
  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Сохранение разрешений
  const handleSave = () => {
    const currentPermissions = getRolePermissions(role.id).map(p => p.id);
    
    // Удаление разрешений, которые были отменены
    currentPermissions.forEach(permId => {
      if (!selectedPermissions.includes(permId)) {
        deleteRolePermission(role.id, permId);
      }
    });
    
    // Добавление новых разрешений
    selectedPermissions.forEach(permId => {
      if (!currentPermissions.includes(permId)) {
        addRolePermission({
          role_id: role.id,
          permission_id: permId
        });
      }
    });
    
    onClose();
  };

  // Фильтрация разрешений по поисковому запросу
  const filteredGroups: Record<string, Permission[]> = {};
  if (searchTerm) {
    Object.keys(groupedPermissions).forEach(resource => {
      const filtered = groupedPermissions[resource].filter(permission => 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        filteredGroups[resource] = filtered;
      }
    });
  } else {
    Object.assign(filteredGroups, groupedPermissions);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Управление разрешениями: {role.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Поиск */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск разрешений..."
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        {/* Список разрешений по группам */}
        <div className="space-y-6 mb-6">
          {Object.keys(filteredGroups).length > 0 ? (
            Object.keys(filteredGroups).map(resource => (
              <div key={resource} className="border border-gray-200 rounded p-4">
                <h3 className="text-lg font-medium mb-3 capitalize">{resource}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredGroups[resource].map(permission => (
                    <div key={permission.id} className="flex items-start">
                      <input
                        type="checkbox"
                        id={`perm-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(permission.id)}
                        className="mt-1 mr-2"
                      />
                      <label htmlFor={`perm-${permission.id}`} className="text-sm">
                        <div className="font-medium">{permission.name}</div>
                        {permission.description && (
                          <div className="text-gray-500 text-xs">{permission.description}</div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              {searchTerm ? 'Разрешения не найдены' : 'Нет доступных разрешений'}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsModal;