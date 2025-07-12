import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Supplier, Organization, SupplierFilters } from '@/types.admin';
import SupplierFormModal from './SupplierFormModal';
import { ALL_OPTION_VALUE } from '../../constants';

const SupplierListPage: React.FC = () => {
  const { suppliers, organizations, deleteSupplier, hasPermission } = useData();
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [filters, setFilters] = useState<SupplierFilters>({
    search: '',
    organizationId: ALL_OPTION_VALUE,
    status: ALL_OPTION_VALUE
  });
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; supplier: Supplier | null }>({ 
    open: false, 
    supplier: null 
  });

  // Применение фильтров
  useEffect(() => {
    let result = [...suppliers];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(supplier => 
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.legal_name.toLowerCase().includes(searchLower) ||
        (supplier.inn_or_ogrn && supplier.inn_or_ogrn.toLowerCase().includes(searchLower)) ||
        (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchLower)) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.organizationId !== ALL_OPTION_VALUE) {
      result = result.filter(supplier => supplier.organizationId === filters.organizationId);
    }
    
    if (filters.status !== ALL_OPTION_VALUE) {
      result = result.filter(supplier => supplier.status === filters.status);
    }
    
    // Сортировка по имени
    result.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredSuppliers(result);
  }, [suppliers, filters]);

  // Обработчики модальных окон
  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setConfirmDelete({ open: true, supplier });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.supplier) {
      deleteSupplier(confirmDelete.supplier.id);
      setConfirmDelete({ open: false, supplier: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, supplier: null });
  };

  // Обработчики изменения фильтров
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === String(ALL_OPTION_VALUE) 
      ? ALL_OPTION_VALUE 
      : e.target.value;
    setFilters(prev => ({ ...prev, organizationId: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === String(ALL_OPTION_VALUE) 
      ? ALL_OPTION_VALUE 
      : e.target.value;
    setFilters(prev => ({ ...prev, status: value }));
  };

  // Получение названия организации по ID
  const getOrganizationName = (organizationId: string): string => {
    const organization = organizations.find(org => org.id === organizationId);
    return organization ? organization.name : 'Неизвестная организация';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Поставщики</h1>
        {hasPermission('suppliers', 'create') && (
          <button
            onClick={handleAddSupplier}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-600"
          >
            Добавить поставщика
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Поиск поставщиков..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="md:w-64">
            <select
              value={filters.organizationId === ALL_OPTION_VALUE ? String(ALL_OPTION_VALUE) : filters.organizationId}
              onChange={handleOrganizationChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={ALL_OPTION_VALUE}>Все организации</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={filters.status === ALL_OPTION_VALUE ? String(ALL_OPTION_VALUE) : filters.status}
              onChange={handleStatusChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={ALL_OPTION_VALUE}>Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица поставщиков */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Юридическое название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ИНН/ОГРН
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Организация
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{supplier.legal_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{supplier.inn_or_ogrn || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getOrganizationName(supplier.organizationId)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {supplier.contact_person && <div>{supplier.contact_person}</div>}
                        {supplier.phone && <div>{supplier.phone}</div>}
                        {supplier.email && <div>{supplier.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {supplier.status === 'active' ? 'Активный' : 'Неактивный'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('suppliers', 'update') && (
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className="text-amber-600 hover:text-blue-900"
                          >
                            Изменить
                          </button>
                        )}
                        {hasPermission('suppliers', 'delete') && (
                          <button
                            onClick={() => handleDeleteClick(supplier)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    {filters.search || filters.organizationId !== ALL_OPTION_VALUE || filters.status !== ALL_OPTION_VALUE
                      ? 'Поставщики не найдены. Попробуйте изменить параметры фильтрации.'
                      : 'Нет доступных поставщиков. Нажмите "Добавить поставщика", чтобы создать нового.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно формы */}
      {isModalOpen && (
        <SupplierFormModal
          supplier={selectedSupplier}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Модальное окно подтверждения удаления */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить поставщика "{confirmDelete.supplier?.name}"? Это действие нельзя отменить.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierListPage;