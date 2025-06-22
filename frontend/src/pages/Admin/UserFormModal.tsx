import React, { useState, useEffect, useCallback } from 'react';
import { User, Organization, Location, Role } from '../../types.admin';
import { ROLES, EMPTY_USER, ALL_OPTION_VALUE } from '../../constants';
import { useData } from '../../context/DataContext';
import { Save } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, userToEdit }) => {
  const { addUser, updateUser, organizations, getLocationsByOrgId } = useData();
  const [formData, setFormData] = useState<Omit<User, 'id' | 'created_at' | 'last_sign_in'>>(() => 
    userToEdit 
    ? { ...userToEdit, password: '' } // Clear password for editing
    : EMPTY_USER
  );
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (userToEdit) {
      setFormData({ ...userToEdit, password: '' }); // Reset password field on edit
      if (userToEdit.organizationId) {
        setAvailableLocations(getLocationsByOrgId(userToEdit.organizationId));
      } else {
        setAvailableLocations([]);
      }
    } else {
      setFormData(EMPTY_USER);
      setAvailableLocations([]);
    }
  }, [userToEdit, isOpen, getLocationsByOrgId]);

  useEffect(() => {
    if (formData.organizationId && formData.organizationId !== ALL_OPTION_VALUE) {
      setAvailableLocations(getLocationsByOrgId(formData.organizationId));
       // If current locationId is not in new availableLocations, reset it
      if (formData.locationId && !getLocationsByOrgId(formData.organizationId).find(loc => loc.id === formData.locationId)) {
        setFormData(prev => ({...prev, locationId: null}));
      }
    } else {
      setAvailableLocations([]);
      setFormData(prev => ({...prev, locationId: null}));
    }
  }, [formData.organizationId, getLocationsByOrgId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value === ALL_OPTION_VALUE ? null : value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || (!userToEdit && !formData.password)) {
      alert('Email и пароль обязательны для нового пользователя.');
      return;
    }
    if (userToEdit) {
      // For editing, ensure password is only updated if provided
      const finalUserData: User = { ...userToEdit, ...formData };
      if (!formData.password) { // If password field is empty, don't change it
        delete finalUserData.password;
      }
      updateUser(finalUserData);
    } else {
      // Ensure password exists for new user
      if (!formData.password) {
        alert('Пароль обязателен для нового пользователя.');
        return;
      }
      addUser(formData as Omit<User, 'id' | 'created_at' | 'last_sign_in'> & {password: string}); // Ensure password is set for new user
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {userToEdit ? 'Редактирование пользователя' : 'Создание нового пользователя'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!!userToEdit} // Email non-editable for existing user
            />
            {userToEdit && <p className="text-xs text-gray-500 mt-1">Email нельзя изменить</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {userToEdit ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={!userToEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Организация</label>
            <select
              name="organizationId"
              value={formData.organizationId || ALL_OPTION_VALUE}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={ALL_OPTION_VALUE}>Выберите организацию</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Точка/Локация</label>
            <select
              name="locationId"
              value={formData.locationId || ALL_OPTION_VALUE}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.organizationId || formData.organizationId === ALL_OPTION_VALUE || availableLocations.length === 0}
            >
              <option value={ALL_OPTION_VALUE}>Выберите локацию</option>
              {availableLocations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
             {formData.organizationId && formData.organizationId !== ALL_OPTION_VALUE && availableLocations.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Для выбранной организации нет доступных локаций.</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active_form" // Changed id to avoid conflict with table
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
            />
            <label htmlFor="is_active_form" className="text-sm text-gray-700">Активен</label>
          </div>
          
          {!userToEdit && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="send_invitation_form"
                name="send_invitation"
                checked={!!formData.send_invitation}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <label htmlFor="send_invitation_form" className="text-sm text-gray-700">Отправить приглашение на email</label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save size={16} />
              {userToEdit ? 'Сохранить изменения' : 'Создать пользователя'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
