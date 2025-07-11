import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Supplier } from '../types';
import { EMPTY_SUPPLIER } from '../constants';

interface SupplierFormModalProps {
  supplier: Supplier | null;
  onClose: () => void;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ supplier, onClose }) => {
  const { organizations, addSupplier, updateSupplier } = useData();
  const [formData, setFormData] = useState<Omit<Supplier, 'id' | 'created_at'>>({...EMPTY_SUPPLIER});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Инициализация формы при открытии модального окна
  useEffect(() => {
    if (supplier) {
      const { id, created_at, ...supplierData } = supplier;
      setFormData(supplierData);
    } else {
      setFormData({...EMPTY_SUPPLIER});
    }
  }, [supplier]);

  // Обработка изменений в полях формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      newErrors.name = 'Название поставщика обязательно';
    }
    
    if (!formData.organizationId) {
      newErrors.organizationId = 'Выберите организацию';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Сохранение поставщика
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (supplier) {
      updateSupplier({ ...supplier, ...formData });
    } else {
      addSupplier(formData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {supplier ? 'Редактировать поставщика' : 'Добавить поставщика'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Название */}
            <div className="col-span-2">
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
            
            {/* Юридическое название */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Юридическое название</label>
              <input
                type="text"
                name="legal_name"
                value={formData.legal_name || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            {/* ИНН/ОГРН */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ИНН/ОГРН</label>
              <input
                type="text"
                name="inn_or_ogrn"
                value={formData.inn_or_ogrn || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            {/* Организация */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Организация *</label>
              <select
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.organizationId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Выберите организацию</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
              {errors.organizationId && <p className="text-red-500 text-xs mt-1">{errors.organizationId}</p>}
            </div>
            
            {/* Контактное лицо */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Контактное лицо</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            {/* Телефон */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            {/* Веб-сайт */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Веб-сайт</label>
              <input
                type="text"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            {/* Адрес */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            {/* Описание */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            {/* Статус */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
              </select>
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {supplier ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierFormModal;