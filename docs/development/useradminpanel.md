import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Power, 
  Trash2, 
  Filter, 
  RotateCcw,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  X,
  User,
  Mail,
  Shield,
  Building,
  MapPin,
  Calendar
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 'user-1',
      email: 'john.doe@company.com',
      full_name: 'Иванов Иван Иванович',
      role: 'manager',
      location: 'Москва - Центральный офис',
      organization: 'ООО "Главная компания"',
      is_active: true,
      created_at: '2024-01-15',
      last_sign_in: '2024-06-18'
    },
    {
      id: 'user-2',
      email: 'maria.smith@company.com',
      full_name: 'Петрова Мария Сергеевна',
      role: 'employee',
      location: 'СПб - Филиал №1',
      organization: 'ООО "Главная компания"',
      is_active: true,
      created_at: '2024-02-20',
      last_sign_in: '2024-06-17'
    },
    {
      id: 'user-3',
      email: 'alex.wilson@company.com',
      full_name: 'Сидоров Алексей Петрович',
      role: 'director',
      location: 'Казань - Отделение',
      organization: 'ООО "Дочерняя компания"',
      is_active: false,
      created_at: '2024-03-10',
      last_sign_in: '2024-05-15'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    organization: 'all',
    location: 'all'
  });

  const roles = [
    { value: 'employee', label: 'Сотрудник' },
    { value: 'manager', label: 'Менеджер' },
    { value: 'director', label: 'Директор' },
    { value: 'admin', label: 'Администратор' },
    { value: 'superadmin', label: 'Суперадмин' }
  ];

  const organizations = [
    'ООО "Главная компания"',
    'ООО "Дочерняя компания"',
    'ИП "Партнер"'
  ];

  const locations = [
    'Москва - Центральный офис',
    'СПб - Филиал №1',
    'Казань - Отделение',
    'Екатеринбург - Представительство'
  ];

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'employee',
    organization: '',
    location: '',
    is_active: true,
    send_invitation: false
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && user.is_active) ||
                         (filters.status === 'inactive' && !user.is_active);
    const matchesOrg = filters.organization === 'all' || user.organization === filters.organization;
    const matchesLocation = filters.location === 'all' || user.location === filters.location;
    
    return matchesSearch && matchesRole && matchesStatus && matchesOrg && matchesLocation;
  });

  const handleCreateUser = () => {
    const id = `user-${Date.now()}`;
    const user = {
      ...newUser,
      id,
      created_at: new Date().toISOString().split('T')[0],
      last_sign_in: null
    };
    setUsers([...users, user]);
    setNewUser({
      email: '',
      password: '',
      full_name: '',
      role: 'employee',
      organization: '',
      location: '',
      is_active: true,
      send_invitation: false
    });
    setShowCreateModal(false);
  };

  const handleEditUser = () => {
    setUsers(users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    ));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, is_active: !user.is_active } : user
    ));
  };

  const deleteUser = (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
      organization: 'all',
      location: 'all'
    });
  };

  const getRoleLabel = (role) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Никогда';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление пользователями</h1>
              <p className="text-gray-600">Всего пользователей: {users.length} | Активных: {users.filter(u => u.is_active).length}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Создать пользователя
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по email, ФИО..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все роли</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>

            <select
              value={filters.organization}
              onChange={(e) => setFilters({...filters, organization: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все организации</option>
              {organizations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={16} />
              Сбросить
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ФИО</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Организация</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Точка</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Регистрация</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {user.email}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{getRoleLabel(user.role)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.organization}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDate(user.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-1 rounded ${
                            user.is_active 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={user.is_active ? 'Деактивировать' : 'Активировать'}
                        >
                          {user.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
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
            <div className="text-center py-8">
              <p className="text-gray-500">Пользователи не найдены</p>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Создание нового пользователя</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Пароль *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Организация</label>
                  <select
                    value={newUser.organization}
                    onChange={(e) => setNewUser({...newUser, organization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите организацию</option>
                    {organizations.map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Точка/Локация</label>
                  <select
                    value={newUser.location}
                    onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите локацию</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={newUser.is_active}
                    onChange={(e) => setNewUser({...newUser, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Активен</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="send_invitation"
                    checked={newUser.send_invitation}
                    onChange={(e) => setNewUser({...newUser, send_invitation: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="send_invitation" className="text-sm text-gray-700">Отправить приглашение на email</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  Создать пользователя
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Редактирование пользователя</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email нельзя изменить</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                  <input
                    type="text"
                    value={selectedUser.full_name}
                    onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Организация</label>
                  <select
                    value={selectedUser.organization}
                    onChange={(e) => setSelectedUser({...selectedUser, organization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {organizations.map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Точка/Локация</label>
                  <select
                    value={selectedUser.location}
                    onChange={(e) => setSelectedUser({...selectedUser, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={selectedUser.is_active}
                    onChange={(e) => setSelectedUser({...selectedUser, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="edit_is_active" className="text-sm text-gray-700">Активен</label>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Смена пароля (опционально)</h3>
                  <input
                    type="password"
                    placeholder="Новый пароль"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleEditUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  Сохранить изменения
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;