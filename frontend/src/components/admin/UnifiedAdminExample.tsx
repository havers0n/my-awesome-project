import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

// Пример данных пользователей
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    role: 'Администратор',
    organization: 'ООО "Пример"',
    status: 'active',
    lastLogin: '2025-01-15'
  },
  {
    id: '2',
    name: 'Мария Сидорова',
    email: 'maria@example.com',
    role: 'Менеджер',
    organization: 'ООО "Тест"',
    status: 'active',
    lastLogin: '2025-01-14'
  },
  {
    id: '3',
    name: 'Петр Козлов',
    email: 'petr@example.com',
    role: 'Сотрудник',
    organization: 'ООО "Пример"',
    status: 'inactive',
    lastLogin: '2025-01-10'
  }
];

export const UnifiedAdminExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSave = (userData: Partial<User>) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'Сотрудник',
        organization: userData.organization || '',
        status: 'active',
        lastLogin: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="admin-base">
      {/* Заголовок страницы */}
      <div className="admin-card admin-mb-6">
        <div className="admin-card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
                Управление пользователями
              </h1>
              <p className="admin-text-sm admin-text-gray-500">
                Создавайте, редактируйте и управляйте пользователями системы
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Панель действий */}
      <div className="admin-card admin-mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Поиск и фильтры */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="admin-select"
              >
                <option value="all">Все роли</option>
                <option value="Администратор">Администратор</option>
                <option value="Менеджер">Менеджер</option>
                <option value="Сотрудник">Сотрудник</option>
              </select>
            </div>
          </div>

          {/* Кнопка добавления */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="admin-btn admin-btn-primary"
          >
            <Plus size={16} />
            Добавить пользователя
          </button>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Организация</th>
                <th>Статус</th>
                <th>Последний вход</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div>
                      <div className="admin-font-medium admin-text-gray-900">
                        {user.name}
                      </div>
                      <div className="admin-text-sm admin-text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-neutral">
                      {user.role}
                    </span>
                  </td>
                  <td className="admin-text-sm admin-text-gray-700">
                    {user.organization}
                  </td>
                  <td>
                    <span className={`admin-badge ${
                      user.status === 'active' ? 'admin-badge-success' : 'admin-badge-error'
                    }`}>
                      {user.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="admin-text-sm admin-text-gray-700">
                    {new Date(user.lastLogin).toLocaleDateString('ru-RU')}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        title="Редактировать"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center admin-p-6">
            <div className="admin-text-gray-500">
              {searchTerm || selectedRole !== 'all' 
                ? 'Пользователи не найдены по заданным критериям'
                : 'Нет пользователей для отображения'
              }
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно для создания/редактирования */}
      {isModalOpen && (
        <UserModal
          user={editingUser}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

// Компонент модального окна
interface UserModalProps {
  user: User | null;
  onSave: (userData: Partial<User>) => void;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Сотрудник',
    organization: user?.organization || '',
    status: user?.status || 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal max-w-md">
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">
            {user ? 'Редактировать пользователя' : 'Добавить пользователя'}
          </h2>
          <button
            onClick={onClose}
            className="admin-btn admin-btn-secondary admin-btn-sm"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-modal-body">
          <div className="admin-form-group">
            <label className="admin-label">Имя</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="admin-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="admin-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Роль</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="admin-select"
            >
              <option value="Администратор">Администратор</option>
              <option value="Менеджер">Менеджер</option>
              <option value="Сотрудник">Сотрудник</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Организация</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="admin-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Статус</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="admin-select"
            >
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
            </select>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="admin-btn admin-btn-secondary"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
            >
              {user ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedAdminExample; 