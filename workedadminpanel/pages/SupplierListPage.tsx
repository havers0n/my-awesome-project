import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Supplier, Organization } from '../types';
import { useSearchParams } from 'react-router-dom';
import { ALL_OPTION_VALUE } from '../constants';
import SupplierFormModal from '../components/SupplierFormModal';

const SupplierListPage: React.FC = () => {
  const { suppliers, organizations, deleteSupplier } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Фильтры
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(ALL_OPTION_VALUE);
  const [selectedStatus, setSelectedStatus] = useState<string>(ALL_OPTION_VALUE);
  
  // Модальное окно
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);

  // Инициализация фильтров из URL
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const orgId = searchParams.get('orgId') || ALL_OPTION_VALUE;
    const status = searchParams.get('status') || ALL_OPTION_VALUE;
    
    setSearchTerm(search);
    setSelectedOrgId(orgId);
    setSelectedStatus(status);
  }, [searchParams]);

  // Обновление URL при изменении фильтров
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedOrgId !== ALL_OPTION_VALUE) params.orgId = selectedOrgId;
    if (selectedStatus !== ALL_OPTION_VALUE) params.status = selectedStatus;
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedOrgId, selectedStatus, setSearchParams]);

  // Фильтрация поставщиков
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.legal_name && supplier.legal_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (supplier.inn_or_ogrn && supplier.inn_or_ogrn.includes(searchTerm));
    
    const matchesOrg = selectedOrgId === ALL_OPTION_VALUE || supplier.organizationId === selectedOrgId;
    const matchesStatus = selectedStatus === ALL_OPTION_VALUE || supplier.status === selectedStatus;
    
    return matchesSearch && matchesOrg && matchesStatus;
  });

  // Обработчики
  const handleAddSupplier = () => {
    setCurrentSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого поставщика?')) {
      deleteSupplier(supplierId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier(null);
  };

  // Получение названия организации по ID
  const getOrganizationName = (orgId: string): string => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'Не указана';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Поставщики</h1>
        <button
          onClick={handleAddSupplier}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Добавить поставщика
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Название, ИНН/ОГРН"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Организация</label>
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value={ALL_OPTION_VALUE}>Все организации</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value={ALL_OPTION_VALUE}>Все статусы</option>
            <option value="active">Активен</option>
            <option value="inactive">Неактивен</option>
          </select>
        </div>
      </div>

      {/* Таблица поставщиков */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ИНН/ОГРН</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Организация</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контактное лицо</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    {supplier.legal_name && (
                      <div className="text-sm text-gray-500">{supplier.legal_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.inn_or_ogrn || 'Не указан'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getOrganizationName(supplier.organizationId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.contact_person || 'Не указано'}</div>
                    {supplier.phone && <div className="text-sm text-gray-500">{supplier.phone}</div>}
                    {supplier.email && <div className="text-sm text-gray-500">{supplier.email}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {supplier.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Поставщики не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно для добавления/редактирования поставщика */}
      {isModalOpen && (
        <SupplierFormModal
          supplier={currentSupplier}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SupplierListPage;