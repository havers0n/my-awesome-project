import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Role, Permission } from '../types';
import RoleFormModal from '../components/RoleFormModal';
import RolePermissionsModal from '../components/RolePermissionsModal';

function RoleManagementPage() {
  const { roles, permissions, deleteRole, getRolePermissions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal windows
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Filter roles
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers
  const handleAddRole = () => {
    setSelectedRole(null);
    setIsFormModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsFormModalOpen(true);
  };

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role? All users with this role will be reassigned to the default role.')) {
      deleteRole(roleId);
    }
  };

  const handleCloseRoleModal = () => {
    setIsFormModalOpen(false);
    setSelectedRole(null);
  };

  const handleClosePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
    setSelectedRole(null);
  };

  // Get the number of permissions for a role
  const getPermissionsCount = (roleId: string) => {
    return getRolePermissions(roleId).length;
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles and Permissions</h1>
        <button
          onClick={handleAddRole}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Role
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Role name or description"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Roles table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    {role.description || 'No description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPermissionsCount(role.id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(role.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditPermissions(role)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Permissions
                    </button>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={role.name.toLowerCase() === 'superadmin'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for adding/editing roles */}
      {isFormModalOpen && (
        <RoleFormModal
          role={selectedRole}
          onClose={handleCloseRoleModal}
        />
      )}

      {/* Modal for managing permissions */}
      {isPermissionsModalOpen && selectedRole && (
        <RolePermissionsModal
          role={selectedRole}
          onClose={handleClosePermissionsModal}
        />
      )}
    </div>
  );
};

export default RoleManagementPage;