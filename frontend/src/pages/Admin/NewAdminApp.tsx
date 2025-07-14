import React, { useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { DataProvider, useData } from '../../context/DataContext';
import UserManagementPage from './UserManagementPage';
import OrganizationListPage from './OrganizationListPage';
import OrganizationDetailPage from './OrganizationDetailPage';
import RoleManagementPage from './RoleManagementPage';
import SupplierListPage from './SupplierListPage';
import { Users, Briefcase, Shield, Truck } from 'lucide-react';

// Error Boundary for catching render errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('NewAdminApp: Ошибка рендера:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-card m-4">
          <div className="text-red-600 font-medium">
            Ошибка в админ-панели: {String(this.state.error)}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const NewAdminApp: React.FC = () => {
  // Лог при загрузке компонента
  useEffect(() => {
    console.log('NewAdminApp: компонент загружается');
  }, []);

  // Лог состояния контекста
  try {
    // Попробуем получить данные из контекста (если вдруг DataProvider не сработал)
    // Это не вызовет ошибку, если DataProvider есть выше
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const data = useData?.();
    console.log('NewAdminApp: состояние контекста', data);
  } catch (e) {
    console.error('NewAdminApp: ошибка доступа к контексту', e);
  }

  return (
    <ErrorBoundary>
      <DataProvider>
        <div className="flex flex-col min-h-screen">
          <header className="admin-header">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <span className="font-semibold text-xl">Админ Панель</span>
                </div>
                <nav className="flex space-x-2">
                  <NavLink 
                    to="/admin/users" 
                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Users size={18} className="mr-2" />
                    Пользователи
                  </NavLink>
                  <NavLink 
                    to="/admin/organizations" 
                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Briefcase size={18} className="mr-2" />
                    Организации
                  </NavLink>
                  <NavLink 
                    to="/admin/roles" 
                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Shield size={18} className="mr-2" />
                    Роли
                  </NavLink>
                  <NavLink 
                    to="/admin/suppliers" 
                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Truck size={18} className="mr-2" />
                    Поставщики
                  </NavLink>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-grow bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="" element={<Navigate to="users" replace />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="organizations" element={<OrganizationListPage />} />
                <Route path="organizations/:orgId" element={<OrganizationDetailPage />} />
                <Route path="roles" element={<RoleManagementPage />} />
                <Route path="suppliers" element={<SupplierListPage />} />
                <Route path="*" element={<Navigate to="users" replace />} />
              </Routes>
            </div>
          </main>
          <footer className="bg-gray-800 text-white text-center p-4 text-sm">
            © {new Date().getFullYear()} Admin Panel. Все права защищены.
          </footer>
        </div>
      </DataProvider>
    </ErrorBoundary>
  );
};

export default NewAdminApp;
