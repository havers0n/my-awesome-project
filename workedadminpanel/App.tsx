
import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import UserManagementPage from './components/UserManagementPage';
import OrganizationListPage from './components/OrganizationListPage';
import OrganizationDetailPage from './components/OrganizationDetailPage';
import SupplierListPage from './pages/SupplierListPage';
import RoleManagementPage from './pages/RoleManagementPage';
import { Users, Briefcase, Truck, Shield } from 'lucide-react';

const App: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
    }`;

  return (
    <DataProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <header className="bg-blue-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <span className="font-semibold text-xl">Админ Панель</span>
                </div>
                <nav className="flex space-x-2">
                  <NavLink to="/users" className={navLinkClass}>
                    <Users size={18} className="mr-2" />
                    Пользователи
                  </NavLink>
                  <NavLink to="/organizations" className={navLinkClass}>
                    <Briefcase size={18} className="mr-2" />
                    Организации
                  </NavLink>
                  <NavLink to="/suppliers" className={navLinkClass}>
                    <Truck size={18} className="mr-2" />
                    Поставщики
                  </NavLink>
                  <NavLink to="/roles" className={navLinkClass}>
                    <Shield size={18} className="mr-2" />
                    Роли
                  </NavLink>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Navigate to="/users" replace />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/organizations" element={<OrganizationListPage />} />
              <Route path="/organizations/:orgId" element={<OrganizationDetailPage />} />
              <Route path="/suppliers" element={<SupplierListPage />} />
              <Route path="/roles" element={<RoleManagementPage />} />
              <Route path="*" element={<Navigate to="/users" replace />} /> {/* Fallback route */}
            </Routes>
          </main>

          <footer className="bg-gray-800 text-white text-center p-4 text-sm">
            © {new Date().getFullYear()} Admin Panel. Все права защищены.
          </footer>
        </div>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
