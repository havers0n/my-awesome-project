
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Organization, OrganizationFilters } from '../types';
import { ALL_OPTION_VALUE } from '../constants';
import OrganizationFormModal from './OrganizationFormModal';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, Building, Calendar, MapPin, Users, Info, ChevronRight } from 'lucide-react';
import LocationFormModal from './LocationFormModal'; // For "Save and Add Location"

const OrganizationListPage: React.FC = () => {
  const { organizations, deleteOrganization, getLocationsByOrgId, getUsersByOrgId } = useData();
  const navigate = useNavigate();

  const [showOrgFormModal, setShowOrgFormModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  
  const [showLocationFormModal, setShowLocationFormModal] = useState(false);
  const [currentOrgForLocation, setCurrentOrgForLocation] = useState<Organization | null>(null);


  const [filters, setFilters] = useState<OrganizationFilters>({
    search: '',
    status: ALL_OPTION_VALUE,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = org.name.toLowerCase().includes(searchLower) ||
                            org.legalAddress.toLowerCase().includes(searchLower) ||
                            org.innOrOgrn.includes(searchLower);
      const matchesStatus = filters.status === ALL_OPTION_VALUE || org.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [organizations, filters]);

  const handleCreateOrgClick = () => {
    setEditingOrg(null);
    setShowOrgFormModal(true);
  };

  const handleEditOrgClick = (org: Organization) => {
    setEditingOrg(org);
    setShowOrgFormModal(true);
  };

  const handleDeleteOrg = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    const locationsCount = getLocationsByOrgId(orgId).length;
    const usersCount = getUsersByOrgId(orgId).length;
    let warningMessage = `Вы уверены, что хотите удалить организацию "${org?.name || orgId}"? Это действие нельзя отменить.`;
    if (locationsCount > 0) warningMessage += `\n\nБудет удалено ${locationsCount} связанных точек.`;
    if (usersCount > 0) warningMessage += `\n\nБудут отвязаны ${usersCount} пользователей.`;

    if (window.confirm(warningMessage)) {
      deleteOrganization(orgId);
    }
  };
  
  const handleSaveAndAddLocation = (org: Organization) => {
    setCurrentOrgForLocation(org);
    setShowOrgFormModal(false); // Close org modal first
    setShowLocationFormModal(true); // Then open location modal
  };


  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Управление организациями</h1>
              <p className="text-sm text-gray-600">Всего организаций: {organizations.length}</p>
            </div>
            <button
              onClick={handleCreateOrgClick}
              className="mt-4 sm:mt-0 bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus size={18} />
              Создать организацию
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search-org" className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="search-org"
                  name="search"
                  type="text"
                  placeholder="По названию, адресу, ИНН/ОГРН..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="status-org" className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                id="status-org"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value={ALL_OPTION_VALUE}>Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Название', 'Юр. адрес', 'ИНН/ОГРН', 'Точки', 'Пользователи', 'Создана', 'Статус', 'Действия'].map(header => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizations.map((org) => {
                  const locationsCount = getLocationsByOrgId(org.id).length;
                  const usersCount = getUsersByOrgId(org.id).length;
                  return (
                    <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => navigate(`/organizations/${org.id}`)}
                          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          title={`Просмотреть детали организации ${org.name}`}
                        >
                          <Building className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
                           <span className="truncate" title={org.name}>{org.name}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                         <div className="flex items-center text-sm">
                            <Info className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
                            <span className="truncate" title={org.legalAddress}>{org.legalAddress}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{org.innOrOgrn}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/organizations/${org.id}`)}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          title="Просмотреть точки"
                        >
                          <MapPin className="h-4 w-4 mr-1 shrink-0" /> {locationsCount}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <button
                          onClick={() => navigate(`/users?organizationId=${org.id}`)}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          title="Просмотреть пользователей"
                        >
                          <Users className="h-4 w-4 mr-1 shrink-0" /> {usersCount}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2 shrink-0" /> {formatDate(org.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {org.status === 'active' ? 'Активна' : 'Неактивна'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/organizations/${org.id}`)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-md transition-colors"
                            title="Просмотр/Управление"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditOrgClick(org)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition-colors"
                            title="Редактировать"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteOrg(org.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-md transition-colors"
                            title="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredOrganizations.length === 0 && (
            <div className="text-center py-10">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Организации не найдены</p>
               <p className="text-gray-400 text-sm mt-1">Попробуйте изменить критерии поиска.</p>
            </div>
          )}
        </div>
      </div>

      <OrganizationFormModal
        isOpen={showOrgFormModal}
        onClose={() => setShowOrgFormModal(false)}
        organizationToEdit={editingOrg}
        onSaveAndAddLocation={handleSaveAndAddLocation}
      />
       {currentOrgForLocation && (
        <LocationFormModal
            isOpen={showLocationFormModal}
            onClose={() => {
                setShowLocationFormModal(false);
                setCurrentOrgForLocation(null);
            }}
            organization={currentOrgForLocation}
        />
      )}
    </div>
  );
};

export default OrganizationListPage;
