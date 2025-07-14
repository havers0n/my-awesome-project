import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Role } from '@/types';
import Modal from './Modal';

interface RoleFormModalProps {
  role: Role | null;
  onClose: () => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ role, onClose }) => {
  const { addRole, updateRole } = useData();
  const [formData, setFormData] = useState<Omit<Role, 'id' | 'created_at'>>({ 
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Инициализация формы при открытии модального окна
  useEffect(() => {
    if (role) {
      const { id, created_at, ...roleData } = role;
      setFormData(roleData);
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [role]);

  // Обработка изменений в полях формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название роли обязательно';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Сохранение роли
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (role) {
      updateRole({ ...role, ...formData });
    } else {
      addRole(formData);
    }
    
    onClose();
  };

  return (
    <Modal title={role ? 'Редактировать роль' : 'Добавить роль'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
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
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-600"
          >
            {role ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleFormModal;