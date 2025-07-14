import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Supplier, Organization } from '@/types';
import Modal from './Modal';
import { ALL_OPTION_VALUE } from '@/constants';

interface SupplierFormModalProps {
  supplier: Supplier | null;
  onClose: () => void;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ supplier, onClose }) => {
  const { addSupplier, updateSupplier, organizations } = useData();
  const [formData, setFormData] = useState<Omit<Supplier, 'id' | 'created_at'>>({ 
    name: '',
    legal_name: '',
    inn_ogrn: '',
    organization_id: 0,
    contact_person: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Инициализация формы при открытии модального окна
  useEffect(() => {
    if (supplier) {
      const { id, created_at, ...supplierData } = supplier;
      setFormData(supplierData);
    } else {
      setFormData({ 
        name: '',
        legal_name: '',
        inn_ogrn: '',
        organization_id: 0,
        contact_person: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        description: '',
        status: 'active'
      });
    }
  }, [supplier]);

  // Обработка изменений в полях формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    // Преобразование числовых значений
    if (name === 'organization_id') {
      processedValue = parseInt(value, 10);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
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
    
    if (!formData.legal_name.trim()) {
      newErrors.legal_name = 'Юридическое название обязательно';
    }
    
    if (formData.organization_id === 0) {
      newErrors.organization_id = 'Выберите организацию';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
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
    <Modal title={supplier ? 'Редактировать поставщика' : 'Добавить поставщика'} onClose={onClose} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          {/* Юридическое название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Юридическое название *</label>
            <input
              type="text"
              name="legal_name"
              value={formData.legal_name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.legal_name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.legal_name && <p className="text-red-500 text-xs mt-1">{errors.legal_name}</p>}
          </div>
          
          {/* ИНН/ОГРН */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ИНН/ОГРН</label>
            <input
              type="text"
              name="inn_ogrn"
              value={formData.inn_ogrn || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          {/* Организация */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Организация *</label>
            <select
              name="organization_id"
              value={formData.organization_id}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.organization_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value={0}>Выберите организацию</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            {errors.organization_id && <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>}
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
              type="text"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
          
          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="active">Активный</option>
              <option value="inactive">Неактивный</option>
            </select>
          </div>
        </div>
        
        {/* Адрес */}
        <div className="mt-4">
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
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded"
          />
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
            {supplier ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierFormModal;