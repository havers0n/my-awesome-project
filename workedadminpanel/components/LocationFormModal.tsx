
import React, { useState, useEffect } from 'react';
import { Location, Organization, LocationType, LocationTypeLabels, LocationStatusLabels } from '../types';
import { EMPTY_LOCATION } from '../constants';
import { useData } from '../contexts/DataContext';
import { Save, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization; // Organization this location belongs to
  locationToEdit?: Location | null;
  onSaveAndAddUser?: (loc: Location) => void;
}

const LocationFormModal: React.FC<LocationFormModalProps> = ({ isOpen, onClose, organization, locationToEdit, onSaveAndAddUser }) => {
  const { addLocation, updateLocation } = useData();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Location, 'id' | 'createdAt' | 'organizationId'>>(EMPTY_LOCATION);

  useEffect(() => {
    if (locationToEdit) {
      setFormData(locationToEdit);
    } else {
      setFormData(EMPTY_LOCATION);
    }
  }, [locationToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent, andAddUser = false) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
        alert('Название точки и адрес обязательны.');
        return;
    }

    const locationDataWithOrg = { ...formData, organizationId: organization.id };
    
    let savedLoc: Location;
    if (locationToEdit) {
      const locToUpdate: Location = { ...locationToEdit, ...locationDataWithOrg };
      updateLocation(locToUpdate);
      savedLoc = locToUpdate;
    } else {
      savedLoc = addLocation(locationDataWithOrg);
    }

    if (andAddUser && onSaveAndAddUser) {
        onSaveAndAddUser(savedLoc);
    } else {
        onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {locationToEdit ? 'Редактирование точки' : `Новая точка для "${organization.name}"`}
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
        <form className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название точки *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип точки</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {Object.values(LocationType).map(type => (
                  <option key={type} value={type}>{LocationTypeLabels[type]}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус точки</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {Object.keys(LocationStatusLabels).map(statusKey => (
                  <option key={statusKey} value={statusKey}>{LocationStatusLabels[statusKey as Location['status']]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон точки</label>
              <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email точки</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Часы работы</label>
            <input type="text" name="workingHours" value={formData.workingHours || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ответственный</label>
            <input type="text" name="responsiblePerson" value={formData.responsiblePerson || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание/Особенности</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            {!locationToEdit && onSaveAndAddUser && (
                 <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <Users size={16} />
                    Сохранить и добавить пользователя
                </button>
            )}
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save size={16} />
              {locationToEdit ? 'Сохранить изменения' : 'Создать точку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationFormModal;
