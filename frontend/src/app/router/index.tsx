import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabaseClient";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { Toaster } from "@/shared/ui/atoms/Toaster";

// Widgets
import { Layout as AppLayout } from "@/widgets/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Lazy load pages
const Home = lazy(() => import('@/pages/Dashboard/Home'));
const SignIn = lazy(() => import('@/pages/AuthPages/SignIn'));
const NotFound = lazy(() => import('@/pages/OtherPage/NotFound'));
const UserProfiles = lazy(() => import('@/pages/UserProfiles'));
const Videos = lazy(() => import('@/pages/UiElements/Videos'));
const Images = lazy(() => import('@/pages/UiElements/Images'));
const Alerts = lazy(() => import('@/pages/UiElements/Alerts'));
const Badges = lazy(() => import('@/pages/UiElements/Badges'));
const Avatars = lazy(() => import('@/pages/UiElements/Avatars'));
const Buttons = lazy(() => import('@/pages/UiElements/Buttons'));

// Dashboard components
const Overview = lazy(() => import('@/pages/Dashboard/Overview'));
const Widgets = lazy(() => import('@/pages/Dashboard/Widgets'));
const CustomizableDashboard = lazy(() => import('@/pages/Dashboard/CustomizableDashboard'));

// Heavy chart components
const LineChart = lazy(() => import('@/pages/Charts/LineChart'));
const BarChart = lazy(() => import('@/pages/Charts/BarChart'));
const SalesForecastPage = lazy(() => import('@/pages/SalesForecastPage'));
const SalesForecastNewPage = lazy(() => import('@/pages/SalesForecastNewPage'));
const TestForecastAPI = lazy(() => import('@/pages/TestForecastAPI'));

// Warehouse components
const InventoryManagementPage = lazy(() => import('@/pages/Inventory/InventoryManagementPage'));
const WarehouseAnalyticsPage = lazy(() => import('@/pages/Analytics/WarehouseAnalyticsPage'));
const WarehouseReportsPage = lazy(() => import('@/pages/Reports/WarehouseReportsPage'));

// New functionality pages
const MonitoringPage = lazy(() => import('@/pages/MonitoringPage'));
const PlanningPage = lazy(() => import('@/pages/PlanningPage'));
const QualityControlPage = lazy(() => import('@/pages/QualityControlPage'));

// Reports components
const SalesReports = lazy(() => import('@/pages/Reports/SalesReports'));

// Admin components
const UserManagementPage = lazy(() => import('@/pages/Admin/UserManagementPage'));
const OrganizationListPage = lazy(() => import('@/pages/Admin/OrganizationListPage'));
const OrganizationDetailPage = lazy(() => import('@/pages/Admin/OrganizationDetailPage'));
const RoleManagementPage = lazy(() => import('@/pages/Admin/RoleManagementPage'));
const SupplierListPage = lazy(() => import('@/pages/Admin/SupplierListPage'));

// Admin wrapper
const AdminPageWrapper = lazy(() => import('@/components/admin/AdminPageWrapper'));

// Calendar and other heavy components
const Calendar = lazy(() => import('@/pages/Calendar'));
const BasicTables = lazy(() => import('@/pages/Tables/BasicTables'));
const FormElements = lazy(() => import('@/pages/Forms/FormElements'));
const Blank = lazy(() => import('@/pages/Blank'));
const OutOfStockTracker = lazy(() => import('@/pages/OtherPage/OutOfStockTracker'));
const ShelfAvailabilityPage = lazy(() => import('@/pages/Inventory/ShelfAvailabilityPage'));
const ShelfAvailabilityDashboard = lazy(() => import('@/pages/Inventory/ShelfAvailabilityDashboard'));
const ResetPassword = lazy(() => import('@/pages/AuthPages/ResetPassword'));
const UpdatePassword = lazy(() => import('@/pages/AuthPages/UpdatePassword'));
const AdminCreateUser = lazy(() => import('@/pages/AdminCreateUser'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

// Placeholder components for missing pages
const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('EVENT in Router:', event, 'SESSION:', session);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY detected in Router! Navigating to /update-password...');
        navigate('/update-password');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Protected Dashboard Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index path="/" element={<CustomizableDashboard />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard/overview" element={<Overview />} />
            <Route path="/dashboard/widgets" element={<Widgets />} />
            <Route path="/dashboard/" element={<CustomizableDashboard />} />

            {/* Sales Forecast */}
            <Route path="/sales-forecast" element={<SalesForecastPage />} />
            <Route path="/sales-forecast-new" element={<SalesForecastNewPage />} />

            {/* Test API Page */}
            <Route path="/test-forecast-api" element={<TestForecastAPI />} />

            {/* Inventory */}
            <Route path="/inventory/management" element={<InventoryManagementPage />} />
            <Route path="/inventory/shelf-availability" element={<ShelfAvailabilityDashboard />} />
            <Route path="/shelf-availability" element={<ShelfAvailabilityPage />} />
            <Route path="/out-of-stock" element={<OutOfStockTracker />} />

            {/* Analytics */}
            <Route path="/analytics/warehouse" element={<WarehouseAnalyticsPage />} />

            {/* Monitoring */}
            <Route path="/monitoring/events" element={<MonitoringPage />} />
            <Route path="/monitoring/performance" element={<MonitoringPage />} />
            <Route path="/monitoring/notifications" element={<MonitoringPage />} />
            <Route path="/monitoring/logs" element={<MonitoringPage />} />

            {/* Planning */}
            <Route path="/planning/tasks" element={<PlanningPage />} />
            <Route path="/planning/calendar" element={<PlanningPage />} />
            <Route path="/planning/procurement" element={<PlanningPage />} />
            <Route path="/planning/budget" element={<PlanningPage />} />

            {/* Quality Control */}
            <Route path="/quality/inspections" element={<QualityControlPage />} />
            <Route path="/quality/certificates" element={<PlaceholderPage title="Сертификаты" description="Управление сертификатами качества" />} />
            <Route path="/quality/complaints" element={<PlaceholderPage title="Жалобы и возвраты" description="Обработка жалоб и возвратов" />} />
            <Route path="/quality/standards" element={<PlaceholderPage title="Стандарты качества" description="Управление стандартами качества" />} />

            {/* Finance */}
            <Route path="/finance/budget" element={<PlaceholderPage title="Бюджет и планирование" description="Финансовое планирование и бюджетирование" />} />
            <Route path="/finance/expenses" element={<PlaceholderPage title="Расходы и доходы" description="Учет расходов и доходов" />} />
            <Route path="/finance/payments" element={<PlaceholderPage title="Платежи" description="Управление платежами" />} />
            <Route path="/finance/reports" element={<PlaceholderPage title="Финансовые отчеты" description="Финансовая отчетность" />} />

            {/* Security */}
            <Route path="/security/audit" element={<PlaceholderPage title="Аудит безопасности" description="Аудит системы безопасности" />} />
            <Route path="/security/access" element={<PlaceholderPage title="Управление доступом" description="Управление правами доступа" />} />
            <Route path="/security/events" element={<PlaceholderPage title="Журнал событий" description="Журнал событий безопасности" />} />
            <Route path="/security/backup" element={<PlaceholderPage title="Резервное копирование" description="Управление резервными копиями" />} />

            {/* Automation */}
            <Route path="/automation/workflows" element={<PlaceholderPage title="Рабочие процессы" description="Автоматизация рабочих процессов" />} />
            <Route path="/automation/scheduler" element={<PlaceholderPage title="Планировщик задач" description="Планирование автоматических задач" />} />
            <Route path="/automation/notifications" element={<PlaceholderPage title="Автоматические уведомления" description="Настройка автоматических уведомлений" />} />
            <Route path="/automation/scripts" element={<PlaceholderPage title="Скрипты и макросы" description="Управление скриптами и макросами" />} />

            {/* Communication */}
            <Route path="/communication/messages" element={<PlaceholderPage title="Внутренние сообщения" description="Система внутренних сообщений" />} />
            <Route path="/communication/team-notifications" element={<PlaceholderPage title="Уведомления команды" description="Уведомления для команды" />} />
            <Route path="/communication/announcements" element={<PlaceholderPage title="Объявления" description="Системные объявления" />} />
            <Route path="/communication/support-chat" element={<PlaceholderPage title="Чат поддержки" description="Чат с технической поддержкой" />} />

            {/* Reports */}
            <Route path="/reports/sales" element={<SalesReports />} />
            <Route path="/reports/warehouse" element={<WarehouseReportsPage />} />
            <Route path="/reports/products" element={<PlaceholderPage title="Отчеты по товарам" description="Анализ товарного ассортимента" />} />
            <Route path="/reports/locations" element={<PlaceholderPage title="Отчеты по локациям" description="Анализ по точкам продаж" />} />

            {/* Products */}
            <Route path="/products" element={<PlaceholderPage title="Управление товарами" description="Каталог товаров и управление ассортиментом" />} />
            <Route path="/product-categories" element={<PlaceholderPage title="Категории товаров" description="Управление категориями товаров" />} />
            <Route path="/product-groups" element={<PlaceholderPage title="Группы товаров" description="Управление группами товаров" />} />
            <Route path="/product-kinds" element={<PlaceholderPage title="Виды товаров" description="Управление видами товаров" />} />
            <Route path="/manufacturers" element={<PlaceholderPage title="Производители" description="Управление производителями" />} />

            {/* Organizations and Locations - redirect to admin pages */}
            <Route path="/organizations" element={<Navigate to="/admin/organizations" replace />} />
            <Route path="/organizations/:orgId" element={<Navigate to="/admin/organizations" replace />} />
            <Route path="/locations" element={<Navigate to="/admin/organizations" replace />} />
            <Route path="/suppliers" element={<Navigate to="/admin/suppliers" replace />} />

            {/* Settings */}
            <Route path="/settings/organization" element={<PlaceholderPage title="Настройки организации" description="Конфигурация организации" />} />
            <Route path="/settings/system" element={<PlaceholderPage title="Настройки системы" description="Системные настройки" />} />

            {/* Integrations */}
            <Route path="/integrations/api" element={<PlaceholderPage title="API подключения" description="Управление API интеграциями" />} />
            <Route path="/integrations/import-export" element={<PlaceholderPage title="Импорт/экспорт данных" description="Инструменты для импорта и экспорта" />} />
            <Route path="/integrations/external" element={<PlaceholderPage title="Внешние сервисы" description="Интеграция с внешними сервисами" />} />
            <Route path="/integrations/webhooks" element={<PlaceholderPage title="Webhook настройки" description="Настройка webhook уведомлений" />} />

            {/* Help */}
            <Route path="/help/documentation" element={<PlaceholderPage title="Документация" description="Руководство пользователя" />} />
            <Route path="/help/support" element={<PlaceholderPage title="Поддержка" description="Техническая поддержка" />} />
            <Route path="/help/training" element={<PlaceholderPage title="Обучающие материалы" description="Обучающие материалы и курсы" />} />
            <Route path="/help/faq" element={<PlaceholderPage title="FAQ" description="Часто задаваемые вопросы" />} />

            {/* Others Page */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user-profiles" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            {/* Admin Pages */}
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/users" element={
              <AdminPageWrapper>
                <UserManagementPage />
              </AdminPageWrapper>
            } />
            <Route path="/admin/organizations" element={
              <AdminPageWrapper>
                <OrganizationListPage />
              </AdminPageWrapper>
            } />
            <Route path="/admin/organizations/:orgId" element={
              <AdminPageWrapper>
                <OrganizationDetailPage />
              </AdminPageWrapper>
            } />
            <Route path="/admin/roles" element={
              <AdminPageWrapper>
                <RoleManagementPage />
              </AdminPageWrapper>
            } />
            <Route path="/admin/suppliers" element={
              <AdminPageWrapper>
                <SupplierListPage />
              </AdminPageWrapper>
            } />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Navigate to="/signin" replace />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Suspense>
    </>
  );
};
