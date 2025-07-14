// Pages layer public API
// Export page components

// Dashboard pages
export { default as HomePage } from "./Dashboard/Home";
export { default as OverviewPage } from "./Dashboard/Overview";
export { default as WidgetsPage } from "./Dashboard/Widgets";
export { default as CustomizableDashboardPage } from "./Dashboard/CustomizableDashboard";

// Auth pages
export { default as SignInPage } from "./AuthPages/SignIn";
export { default as SignUpPage } from "./AuthPages/SignUp";
export { default as ResetPasswordPage } from "./AuthPages/ResetPassword";
export { default as UpdatePasswordPage } from "./AuthPages/UpdatePassword";

// Inventory pages
export { default as InventoryManagementPage } from "./Inventory/InventoryManagementPage";
export { default as ShelfAvailabilityPage } from "./Inventory/ShelfAvailabilityPage";
export { default as ShelfAvailabilityDashboardPage } from "./Inventory/ShelfAvailabilityDashboard";

// Admin pages
export { default as UserManagementPage } from "./Admin/UserManagementPage";
export { default as OrganizationListPage } from "./Admin/OrganizationListPage";
export { default as OrganizationDetailPage } from "./Admin/OrganizationDetailPage";
export { default as RoleManagementPage } from "./Admin/RoleManagementPage";
export { default as SupplierListPage } from "./Admin/SupplierListPage";

// Other pages
export { default as NotFoundPage } from "./OtherPage/NotFound";
export { default as BlankPage } from "./Blank";
export { default as ProfilePage } from "./ProfilePage";
export { default as CalendarPage } from "./Calendar";
