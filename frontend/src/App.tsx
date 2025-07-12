import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";

// Eager load critical components
import AppLayout from "@/layout/AppLayout";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Dashboard/Home";

// Lazy load heavy components to reduce initial bundle
const SignIn = lazy(() => import("@/pages/AuthPages/SignIn"));
const NotFound = lazy(() => import("@/pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("@/pages/UserProfiles"));
const Videos = lazy(() => import("@/pages/UiElements/Videos"));
const Images = lazy(() => import("@/pages/UiElements/Images"));
const Alerts = lazy(() => import("@/pages/UiElements/Alerts"));
const Badges = lazy(() => import("@/pages/UiElements/Badges"));
const Avatars = lazy(() => import("@/pages/UiElements/Avatars"));
const Buttons = lazy(() => import("@/pages/UiElements/Buttons"));

// Heavy chart components - lazy load with high priority
const LineChart = lazy(() => import("@/pages/Charts/LineChart"));
const BarChart = lazy(() => import("@/pages/Charts/BarChart"));
const SalesForecastPage = lazy(() => import("@/pages/SalesForecastPage"));
const TestForecastAPI = lazy(() => import("@/pages/TestForecastAPI"));

// Admin components
const UserManagementPage = lazy(() => import("@/pages/Admin/UserManagementPage"));
const OrganizationListPage = lazy(() => import("@/pages/Admin/OrganizationListPage"));
const OrganizationDetailPage = lazy(() => import("@/pages/Admin/OrganizationDetailPage"));
const RoleManagementPage = lazy(() => import("@/pages/Admin/RoleManagementPage"));
const SupplierListPage = lazy(() => import("@/pages/Admin/SupplierListPage"));

// Admin wrapper
const AdminPageWrapper = lazy(() => import("@/components/admin/AdminPageWrapper"));

// Calendar is heavy due to FullCalendar
const Calendar = lazy(() => import("@/pages/Calendar"));

// Other page components
const BasicTables = lazy(() => import("@/pages/Tables/BasicTables"));
const FormElements = lazy(() => import("@/pages/Forms/FormElements"));
const Blank = lazy(() => import("@/pages/Blank"));
const OutOfStockTracker = lazy(() => import("@/pages/OtherPage/OutOfStockTracker"));
const ShelfAvailabilityPage = lazy(() => import("@/pages/Inventory/ShelfAvailabilityPage"));
const ShelfAvailabilityDashboard = lazy(() => import("@/pages/Inventory/ShelfAvailabilityDashboard"));
const ResetPassword = lazy(() => import("@/pages/AuthPages/ResetPassword"));
const UpdatePassword = lazy(() => import("@/pages/AuthPages/UpdatePassword"));
const AdminCreateUser = lazy(() => import("@/pages/AdminCreateUser"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('EVENT in App.tsx:', event, 'SESSION:', session);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY detected in App.tsx! Navigating to /update-password...');
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
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user-profiles" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/out-of-stock" element={<OutOfStockTracker />} />
            <Route path="/shelf-availability" element={<ShelfAvailabilityPage />} />
            <Route path="/inventory/shelf-availability" element={<ShelfAvailabilityDashboard />} />

            {/* Organizations and Locations - non-admin pages */}
            <Route path="/organizations" element={<Navigate to="/admin/organizations" replace />} />
            <Route path="/organizations/:orgId" element={<Navigate to="/admin/organizations" replace />} />
            <Route path="/locations" element={<Navigate to="/admin/organizations" replace />} />
            <Route path="/suppliers" element={<Navigate to="/admin/suppliers" replace />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Sales Forecast */}
            <Route path="/sales-forecast" element={<SalesForecastPage />} />

{/* Test API Page */}
<Route path="/test-forecast-api" element={<TestForecastAPI />} />
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

            {/* Admin Pages - интегрированы в основной layout */}
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
      </Suspense>
    </>
  );
}
