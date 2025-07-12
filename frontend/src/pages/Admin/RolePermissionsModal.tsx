import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Role, Permission, RolePermission } from '@/types';
import Modal from './Modal';

interface RolePermissionsModalProps {
  role: Role;
  onClose: () => void;
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({ role, onClose }) => {
  const { permissions, rolePermissions, addRolePermission, deleteRolePermission, getRolePermissions } = useData();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [initialPermissions, setInitialPermissions] = useState<Set<number>>(new Set());

  // Группировка разрешений по ресурсу
  const groupedPermissions = useMemo(() => {
    const filtered = searchTerm
      ? permissions.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : permissions;

    return filtered.reduce((groups: GroupedPermissions, permission) => {
      const resource = permission.resource;
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
      return groups;
    }, {});
  }, [permissions, searchTerm]);

  // Инициализация выбранных разрешений при открытии модального окна
  useEffect(() => {
    const rolePerms = getRolePermissions(role.id);
    const permissionIds = new Set(rolePerms.map(rp => rp.permission_id));
    setSelectedPermissions(permissionIds);
    setInitialPermissions(new Set(permissionIds));
  }, [role.id, getRolePermissions]);

  // Обработка изменения выбора разрешения
  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  // Сохранение изменений разрешений
  const handleSave = () => {
    // Добавление новых разрешений
    for (const permissionId of selectedPermissions) {
      if (!initialPermissions.has(permissionId)) {
        addRolePermission({
          role_id: role.id,
          permission_id: permissionId
        });
      }
    }

    // Удаление отмененных разрешений
    for (const permissionId of initialPermissions) {
      if (!selectedPermissions.has(permissionId)) {
        const rolePermToDelete = rolePermissions.find(
          rp => rp.role_id === role.id && rp.permission_id === permissionId
        );
        if (rolePermToDelete) {
          deleteRolePermission(rolePermToDelete.id);
        }
      }
    }

    onClose();
  };

  return (
    <Modal title={`Разрешения роли: ${role.name}`} onClose={onClose} maxWidth="max-w-4xl">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск разрешений..."
          className="w-full p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-h-96 overflow-y-auto">
        {Object.entries(groupedPermissions).length > 0 ? (
          Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource} className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{resource}</h3>
              <div className="space-y-2">
                {perms.map(permission => (
                  <div key={permission.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.has(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <label 
                        htmlFor={`permission-${permission.id}`}
                        className="font-medium text-gray-700 cursor-pointer"
                      >
                        {permission.name}
                      </label>
                      {permission.description && (
                        <p className="text-sm text-gray-500">{permission.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            {searchTerm ? 'Разрешения не найдены' : 'Нет доступных разрешений'}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
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
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-600"
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );
};

export default RolePermissionsModal;