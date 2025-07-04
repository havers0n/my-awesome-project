
import React, { useState, useEffect } from 'react';
import { Organization } from '../types';
import { EMPTY_ORGANIZATION } from '../constants';
import { useData } from '../contexts/DataContext';
import { Save, Briefcase } from 'lucide-react';

interface OrganizationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationToEdit?: Organization | null;
  onSaveAndAddLocation?: (org: Organization) => void;
}

const OrganizationFormModal: React.FC<OrganizationFormModalProps> = ({ isOpen, onClose, organizationToEdit, onSaveAndAddLocation }) => {
  const { addOrganization, updateOrganization } = useData();
  const [formData, setFormData] = useState<Omit<Organization, 'id' | 'createdAt'>>(EMPTY_ORGANIZATION);

  useEffect(() => {
    if (organizationToEdit) {
      setFormData(organizationToEdit);
    } else {
      setFormData(EMPTY_ORGANIZATION);
    }
  }, [organizationToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked ? 'active' : 'inactive' }));
  };

  const handleSubmit = (e: React.FormEvent, andAddLocation = false) => {
    e.preventDefault();
    if (!formData.name || !formData.legalAddress || !formData.innOrOgrn) {
        alert('Название, юридический адрес и ИНН/ОГРН обязательны.');
        return;
    }

    let savedOrg: Organization;
    if (organizationToEdit) {
      const orgToUpdate = { ...organizationToEdit, ...formData };
      updateOrganization(orgToUpdate);
      savedOrg = orgToUpdate;
    } else {
      savedOrg = addOrganization(formData);
    }
    
    if (andAddLocation && onSaveAndAddLocation) {
        onSaveAndAddLocation(savedOrg); // This will typically close this modal and open location modal
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
            {organizationToEdit ? 'Редактирование организации' : 'Создание новой организации'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Название организации *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ИНН/ОГРН *</label>
            <input type="text" name="innOrOgrn" value={formData.innOrOgrn} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Юридический адрес *</label>
            <textarea name="legalAddress" value={formData.legalAddress} onChange={handleChange} rows={2} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фактический адрес</label>
            <input type="text" name="actualAddress" value={formData.actualAddress || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Веб-сайт</label>
            <input type="url" name="website" value={formData.website || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание/Примечания</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логотип (URL)</label>
            <input type="url" name="logoUrl" value={formData.logoUrl || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div> */}
           <div className="flex items-center">
            <input
              type="checkbox"
              id="org_status_form"
              name="status"
              checked={formData.status === 'active'}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
            />
            <label htmlFor="org_status_form" className="text-sm text-gray-700">Организация активна</label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            {!organizationToEdit && onSaveAndAddLocation && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Briefcase size={16} />
                Сохранить и добавить точку
              </button>
            )}
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save size={16} />
              {organizationToEdit ? 'Сохранить изменения' : 'Создать организацию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationFormModal;
