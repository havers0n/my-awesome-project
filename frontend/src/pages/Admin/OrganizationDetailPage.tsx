import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation as useReactRouterLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Organization, Location, LocationType, LocationTypeLabels, LocationStatusLabels, LocationFilters } from '../../types.admin';
import { ALL_OPTION_VALUE } from '../../constants';
import OrganizationFormModal from './OrganizationFormModal';
import LocationFormModal from './LocationFormModal';
import UserFormModal from './UserFormModal'; // For "Save and Add User"
import { Building, MapPin, Edit, Plus, Trash2, Users, Calendar, Search, Filter, Phone, Mail as MailIcon, Globe, Info, Package, Store, Factory, HelpCircle, ChevronLeft } from 'lucide-react';

const OrganizationDetailPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const routerLocation = useReactRouterLocation();
  const { organizations, getLocationsByOrgId, getUsersByLocationId, deleteLocation, updateOrganization } = useData();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const [showOrgFormModal, setShowOrgFormModal] = useState(false);
  const [showLocationFormModal, setShowLocationFormModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [currentLocationForUser, setCurrentLocationForUser] = useState<Location | null>(null);


  const [locationFilters, setLocationFilters] = useState<LocationFilters>({
    search: '',
    type: ALL_OPTION_VALUE,
    status: ALL_OPTION_VALUE,
  });

  useEffect(() => {
    const foundOrg = organizations.find(o => o.id === orgId);
    if (foundOrg) {
      setOrganization(foundOrg);
      setLocations(getLocationsByOrgId(foundOrg.id));
    } else {
      // Если организация не найдена, возвращаем пользователя на список организаций в админке
      navigate('/admin/organizations');
    }
  }, [orgId, organizations, getLocationsByOrgId, navigate]);

  useEffect(() => {
    // Scroll to focused location if query param exists
    const params = new URLSearchParams(routerLocation.search);
    const locationFocusId = params.get('locationFocus');
    if (locationFocusId) {
      const element = document.getElementById(`location-${locationFocusId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-blue-50', 'ring-2', 'ring-blue-500');
        setTimeout(() => {
            element.classList.remove('bg-blue-50', 'ring-2', 'ring-blue-500');
        }, 3000);
      }
    }
  }, [routerLocation.search, locations]);

  const handleLocationFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocationFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredLocations = useMemo(() => {
    if (!organization) return [];
    const orgLocations = getLocationsByOrgId(organization.id);
    return orgLocations.filter(loc => {
      const searchLower = locationFilters.search.toLowerCase();
      const matchesSearch = loc.name.toLowerCase().includes(searchLower) || loc.address.toLowerCase().includes(searchLower);
      const matchesType = locationFilters.type === ALL_OPTION_VALUE || loc.type === locationFilters.type;
      const matchesStatus = locationFilters.status === ALL_OPTION_VALUE || loc.status === locationFilters.status;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [organization, getLocationsByOrgId, locationFilters]);

  const handleAddLocationClick = () => {
    setEditingLocation(null);
    setShowLocationFormModal(true);
  };

  const handleEditLocationClick = (loc: Location) => {
    setEditingLocation(loc);
    setShowLocationFormModal(true);
  };

  const handleDeleteLocation = (locId: string) => {
    const loc = locations.find(l => l.id === locId);
    const usersCount = getUsersByLocationId(locId).length;
    let warningMessage = `Вы уверены, что хотите удалить точку "${loc?.name || locId}"? Это действие нельзя отменить.`;
    if (usersCount > 0) warningMessage += `\n\nБудут отвязаны ${usersCount} пользователей.`;

    if (window.confirm(warningMessage)) {
      deleteLocation(locId);
    }
  };
  
  const handleSaveAndAddUser = (loc: Location) => {
    setCurrentLocationForUser(loc);
    setShowLocationFormModal(false); // Close location modal
    setShowUserFormModal(true); // Open user modal
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getLocationTypeIcon = (type: Location['type']) => {
    switch(type) {
        case LocationType.OFFICE: return <Building size={16} className="text-blue-500"/>;
        case LocationType.WAREHOUSE: return <Package size={16} className="text-yellow-500"/>;
        case LocationType.SHOP: return <Store size={16} className="text-green-500"/>;
        case LocationType.PRODUCTION: return <Factory size={16} className="text-purple-500"/>;
        default: return <HelpCircle size={16} className="text-gray-500"/>;
    }
  }


  if (!organization) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <Building size={64} className="text-gray-400 mb-4" />
            <p className="text-xl text-gray-700 mb-2">Организация не найдена</p>
            <button
                onClick={() => navigate('/organizations')}
                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
                <ChevronLeft size={18} /> Вернуться к списку организаций
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Breadcrumbs and Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/organizations')} className="text-sm text-blue-600 hover:underline flex items-center mb-2">
            <ChevronLeft size={16} className="mr-1"/> К списку организаций
        </button>
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
                        <Building size={28} className="mr-3 text-brand-blue"/>
                        {organization.name}
                    </h1>
                    <p className="text-sm text-gray-500 flex items-center">
                        <Info size={14} className="mr-1.5"/>
                        {organization.legalAddress} (ИНН: {organization.innOrOgrn})
                    </p>
                </div>
                <button
                    onClick={() => setShowOrgFormModal(true)}
                    className="mt-4 sm:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                    <Edit size={16} />
                    Редактировать организацию
                </button>
            </div>
             <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {organization.phone && <p className="text-gray-700 flex items-center"><Phone size={14} className="mr-2 text-gray-500"/> {organization.phone}</p>}
                {organization.email && <p className="text-gray-700 flex items-center"><MailIcon size={14} className="mr-2 text-gray-500"/> {organization.email}</p>}
                {organization.website && <p className="text-gray-700 flex items-center"><Globe size={14} className="mr-2 text-gray-500"/> <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{organization.website}</a></p>}
                <p className={`text-gray-700 flex items-center`}>
                    <span className={`mr-2 h-2.5 w-2.5 rounded-full ${organization.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    Статус: {organization.status === 'active' ? 'Активна' : 'Неактивна'}
                </p>
                <p className="text-gray-700 flex items-center"><Calendar size={14} className="mr-2 text-gray-500"/> Создана: {formatDate(organization.createdAt)}</p>
            </div>
            {organization.description && <p className="mt-3 text-sm text-gray-600">{organization.description}</p>}
        </div>
      </div>

      {/* Locations Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0 flex items-center">
            <MapPin size={22} className="mr-2 text-brand-blue"/>
            Точки и отделения ({filteredLocations.length} / {locations.length})
          </h2>
          <button
            onClick={handleAddLocationClick}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Добавить точку
          </button>
        </div>

        {/* Location Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
           <div>
              <label htmlFor="search-loc" className="block text-xs font-medium text-gray-600 mb-1">Поиск по точкам</label>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input
                    id="search-loc"
                    name="search"
                    type="text"
                    placeholder="Название, адрес..."
                    value={locationFilters.search}
                    onChange={handleLocationFilterChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                 />
              </div>
           </div>
           <div>
              <label htmlFor="type-loc" className="block text-xs font-medium text-gray-600 mb-1">Тип точки</label>
              <select
                 id="type-loc"
                 name="type"
                 value={locationFilters.type}
                 onChange={handleLocationFilterChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                 <option value={ALL_OPTION_VALUE}>Все типы</option>
                 {Object.values(LocationType).map(type => (
                    <option key={type} value={type}>{LocationTypeLabels[type]}</option>
                 ))}
              </select>
           </div>
           <div>
              <label htmlFor="status-loc" className="block text-xs font-medium text-gray-600 mb-1">Статус точки</label>
              <select
                 id="status-loc"
                 name="status"
                 value={locationFilters.status}
                 onChange={handleLocationFilterChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                 <option value={ALL_OPTION_VALUE}>Все статусы</option>
                 {Object.keys(LocationStatusLabels).map(statusKey => (
                  <option key={statusKey} value={statusKey}>{LocationStatusLabels[statusKey as Location['status']]}</option>
                ))}
              </select>
           </div>
        </div>

        {/* Locations Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Название', 'Адрес', 'Тип', 'Пользователи', 'Статус', 'Действия'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocations.map((loc) => {
                const usersCount = getUsersByLocationId(loc.id).length;
                return (
                  <tr key={loc.id} id={`location-${loc.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                            {getLocationTypeIcon(loc.type)}
                            <span className="ml-2 font-medium text-gray-900 truncate" title={loc.name}>{loc.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate" title={loc.address}>{loc.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{LocationTypeLabels[loc.type]}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => navigate(`/users?organizationId=${organization.id}&locationId=${loc.id}`)} 
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        title="Просмотреть пользователей точки"
                      >
                        <Users size={16} className="mr-1" /> {usersCount}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        loc.status === 'operating' ? 'bg-green-100 text-green-800' : 
                        loc.status === 'renovation' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {LocationStatusLabels[loc.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditLocationClick(loc)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition-colors"
                          title="Редактировать точку"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md transition-colors"
                          title="Удалить точку"
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
        {filteredLocations.length === 0 && (
          <div className="text-center py-10">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Точки не найдены для данной организации</p>
            {locations.length > 0 && <p className="text-gray-400 text-sm mt-1">Попробуйте изменить критерии фильтрации.</p>}
            {locations.length === 0 && <p className="text-gray-400 text-sm mt-1">Вы можете добавить первую точку.</p>}
          </div>
        )}
      </div>

      {showOrgFormModal && (
        <OrganizationFormModal
          isOpen={showOrgFormModal}
          onClose={() => setShowOrgFormModal(false)}
          organizationToEdit={organization}
        />
      )}
      {showLocationFormModal && organization && (
        <LocationFormModal
          isOpen={showLocationFormModal}
          onClose={() => setShowLocationFormModal(false)}
          organization={organization}
          locationToEdit={editingLocation}
          onSaveAndAddUser={handleSaveAndAddUser}
        />
      )}
      {showUserFormModal && currentLocationForUser && organization && (
         <UserFormModal
            isOpen={showUserFormModal}
            onClose={() => {
                setShowUserFormModal(false);
                setCurrentLocationForUser(null);
            }}
            userToEdit={null} // For creating new user
            // We need a way to prefill org and loc in UserFormModal,
            // or modify UserFormModal to accept defaultOrgId/defaultLocId
            // For now, it will be blank, user has to select.
            // A better way would be to pass `defaultValues` to UserFormModal.
            // For this iteration, let UserFormModal handle its own EMPTY_USER.
         />
      )}
    </div>
  );
};

export default OrganizationDetailPage;
    