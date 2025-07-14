# Source-Code & Architecture Mapping Analysis

## 1. Folder Structure Catalogue

### Root Structure
```
frontend/
├── src/
│   ├── api/                    # API layer
│   ├── components/             # Reusable UI components
│   ├── context/                # React Context providers
│   ├── helpers/                # Utility functions
│   ├── hooks/                  # Custom React hooks
│   ├── layout/                 # Layout components
│   ├── pages/                  # Page components
│   ├── services/               # External services
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
└── tests/                      # E2E tests
```

### Detailed Component Organization

#### `/src/components/` Structure
```
components/
├── auth/                       # Authentication components
│   ├── ProtectedRoute.tsx
│   ├── SignInForm.tsx
│   └── SignUpForm.tsx
├── charts/                     # Chart components
│   ├── bar/BarChartOne.tsx
│   ├── line/LineChartOne.tsx
│   ├── BarChart.tsx
│   ├── LineChart.tsx
│   ├── Placeholder.tsx
│   └── Table.tsx
├── common/                     # Common/shared components
│   ├── ChartTab.tsx
│   ├── ComponentCard.tsx
│   ├── GridShape.tsx
│   ├── Icon.tsx
│   ├── PageBreadCrumb.tsx
│   ├── PageMeta.tsx
│   ├── ScrollToTop.tsx
│   ├── ThemeToggleButton.tsx
│   └── ThemeTogglerTwo.tsx
├── ecommerce/                  # E-commerce specific components
│   ├── CountryMap.tsx
│   ├── DemographicCard.tsx
│   ├── EcommerceMetrics.tsx
│   ├── MonthlySalesChart.tsx
│   ├── MonthlyTarget.tsx
│   ├── RecentOrders.tsx
│   └── StatisticsChart.tsx
├── form/                       # Form components hierarchy
│   ├── form-elements/          # Specific form elements
│   ├── group-input/            # Grouped inputs
│   ├── input/                  # Basic input components
│   ├── switch/                 # Switch components
│   ├── Form.tsx
│   ├── Label.tsx
│   ├── MultiSelect.tsx
│   └── Select.tsx
├── header/                     # Header components
│   ├── Header.tsx
│   ├── NotificationDropdown.tsx
│   └── UserDropdown.tsx
├── inventory/                  # Inventory specific components
│   ├── ShelfAvailabilityMenu.tsx
│   └── ShelfAvailabilityWidget.tsx
├── profile/                    # Profile components
├── tables/                     # Table components
├── ui/                         # UI library components
│   ├── alert/Alert.tsx
│   ├── avatar/Avatar.tsx
│   ├── badge/Badge.tsx
│   ├── button/Button.tsx
│   ├── dropdown/
│   ├── images/
│   ├── modal/
│   ├── table/
│   └── videos/
└── UserProfile/                # User profile specific components
```

#### `/src/pages/` Structure
```
pages/
├── Admin/                      # Admin panel pages
│   ├── LocationFormModal.tsx
│   ├── Modal.tsx
│   ├── NewAdminApp.tsx
│   ├── OrganizationDetailPage.tsx
│   ├── OrganizationFormModal.tsx
│   ├── OrganizationListPage.tsx
│   ├── UserFormModal.tsx
│   └── UserManagementPage.tsx
├── AuthPages/                  # Authentication pages
│   ├── AuthPageLayout.tsx
│   ├── ResetPassword.tsx
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   └── UpdatePassword.tsx
├── Charts/                     # Chart demo pages
├── Dashboard/                  # Dashboard pages
│   └── Home.tsx
├── Forms/                      # Form demo pages
├── Inventory/                  # Inventory pages
├── OtherPage/                  # Miscellaneous pages
├── Tables/                     # Table demo pages
└── UiElements/                 # UI element demo pages
```

---

## 2. Module Dependency Diagram

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Application   │    │   Infrastructure│
│                 │    │                 │    │                 │
│ • Pages         │────│ • Context       │────│ • Services      │
│ • Components    │    │ • Hooks         │    │ • API           │
│ • Layout        │    │ • Helpers       │    │ • Supabase      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Detailed Component Dependencies

#### Context Layer Dependencies
```
AuthContext ──────────► supabaseClient
    │                       │
    ├──► axios              │
    └──► react-router ──────┘

ThemeContext ──────────► localStorage

SidebarContext ────────► window.innerWidth

DataContext ───────────► constants.ts
```

#### Component Dependencies Analysis

**High Coupling Components:**
- `AppSidebar.tsx`: Depends on SidebarContext, icons helper, react-router
- `AuthContext.tsx`: Depends on Supabase, axios, react-router
- `SalesForecastPage.tsx`: Depends on Chart.js, API layer, multiple hooks
- `NewAdminApp.tsx`: Depends on DataContext, react-router, multiple child components

**Cross-Cutting Dependencies:**
- React Router: Used across 90% of components
- Theme Context: Used in layout and UI components
- Icon helpers: Used in sidebar, forms, and UI components

### Circular Dependency Detection

**Potential Circular Dependencies Identified:**
1. `AuthContext` ↔ `ProtectedRoute` ↔ App routing
2. `DataContext` ↔ Admin components (NewAdminApp wraps DataProvider)
3. Theme providers chain in main.tsx

**Resolution Status:** 
- ✅ Properly resolved through provider pattern
- ⚠️ Some tight coupling in admin section

---

## 3. Routing Tree vs Component Tree Analysis

### Routing Structure
```
App.tsx (Root Router)
├── / (Protected Route + AppLayout)
│   ├── / (Home)
│   ├── /profile
│   ├── /user-profiles
│   ├── /calendar
│   ├── /form-elements
│   ├── /basic-tables
│   ├── /sales-forecast
│   ├── /out-of-stock
│   ├── /shelf-availability
│   ├── /alerts
│   ├── /avatars
│   ├── /badge
│   ├── /buttons
│   ├── /images
│   ├── /videos
│   ├── /line-chart
│   └── /bar-chart
├── /signin (Unprotected)
├── /reset-password (Unprotected)
├── /update-password (Unprotected)
├── /admin/* (Separate Admin App)
│   ├── /admin/users
│   ├── /admin/organizations
│   └── /admin/organizations/:orgId
└── /* (NotFound)
```

### Component Tree Hierarchy
```
App
├── ThemeProvider
│   ├── AuthProvider
│   │   ├── AppWrapper (PageMeta)
│   │   │   ├── ScrollToTop
│   │   │   ├── Routes
│   │   │   │   ├── ProtectedRoute
│   │   │   │   │   └── AppLayout
│   │   │   │   │       ├── SidebarProvider
│   │   │   │   │       ├── AppHeader
│   │   │   │   │       ├── AppSidebar
│   │   │   │   │       ├── Backdrop
│   │   │   │   │       └── Outlet (Page Components)
│   │   │   │   ├── AuthPages (Unprotected)
│   │   │   │   └── NewAdminApp
│   │   │   │       └── DataProvider
│   │   │   │           └── Admin Routes
```

### Lazy vs Eager Loading Analysis

**Current Implementation: ALL EAGER**
- ❌ No lazy loading implemented
- ❌ All components imported with static imports
- ❌ Large bundle size potential

**Recommendations for Lazy Loading:**
```typescript
// Suggested lazy routes
const AdminApp = lazy(() => import('@/pages/Admin/NewAdminApp'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const SalesForecast = lazy(() => import('@/pages/SalesForecastPage'));
const ChartsPages = lazy(() => import('@/pages/Charts/...'));
```

---

## 4. State Domains Analysis

### State Management Architecture

#### **Authentication Domain**
- **Location**: `AuthContext.tsx`
- **Scope**: Global
- **State**: User, session, loading
- **Storage**: Supabase Auth + Context
- **Dependencies**: Supabase client, axios, react-router

#### **Theme Domain** 
- **Location**: `ThemeContext.tsx`
- **Scope**: Global
- **State**: theme (light/dark)
- **Storage**: localStorage + Context
- **Dependencies**: None (pure)

#### **Sidebar Domain**
- **Location**: `SidebarContext.tsx` 
- **Scope**: Layout-specific
- **State**: isExpanded, isMobileOpen, isHovered, activeItem, openSubmenu
- **Storage**: Local state only
- **Dependencies**: Window resize events

#### **Data Management Domain (Admin)**
- **Location**: `DataContext.tsx`
- **Scope**: Admin section only
- **State**: users[], organizations[], locations[]
- **Storage**: In-memory (constants)
- **Dependencies**: Initial data constants

#### **Form State Domains**
- **Location**: Individual components
- **Scope**: Component-local
- **Storage**: useState hooks
- **Examples**: Calendar events, form inputs, modal states

#### **API Data Fetching**
- **Location**: Various components + custom hooks
- **Scope**: Component-specific
- **Storage**: Component state + loading states
- **Examples**: SalesForecast, OutOfStock tracking

### State Domain Interaction Map
```
┌─────────────┐    ┌─────────────┐
│ AuthContext │────│ Supabase    │
│ (Global)    │    │ (External)  │
└─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│ AppLayout   │────│ SidebarCtx  │
│ (Protected) │    │ (Layout)    │
└─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│ Page States │────│ Local State │
│ (Component) │    │ (Forms/UI)  │
└─────────────┘    └─────────────┘
```

---

## 5. God Components & Anti-Patterns

### **God Components Identified**

#### **🔴 CRITICAL: SalesForecastPage.tsx (400+ lines)**
**Issues:**
- Handles chart rendering, API calls, state management, UI rendering
- 15+ useState hooks
- Multiple useEffect hooks
- Inline Chart.js configuration
- Mixed concerns: data fetching + UI + chart logic

**Refactoring Suggestions:**
```typescript
// Split into:
- SalesForecastContainer (data logic)
- SalesForecastChart (chart logic)  
- SalesForecastControls (filters)
- SalesForecastHistory (history table)
```

#### **🟡 MODERATE: AppSidebar.tsx (377 lines)**
**Issues:**
- Navigation logic + rendering + state management
- Complex submenu handling
- Mixed desktop/mobile logic
- Hardcoded navigation items

**Refactoring Suggestions:**
```typescript
// Split into:
- SidebarContainer (logic)
- SidebarNavigation (nav items)
- SidebarSubmenu (submenu logic)
- SidebarMobile (mobile-specific)
```

#### **🟡 MODERATE: Calendar.tsx (300+ lines)**
**Issues:**
- Event management + modal handling + FullCalendar integration
- Multiple state variables for modal
- Mixed calendar and form logic

#### **🟡 MODERATE: NewAdminApp.tsx**
**Issues:**
- Router + layout + error boundary + context provider
- Multiple responsibilities in single component

### **Duplicated Logic Patterns**

#### **Modal State Management**
**Locations:** Calendar.tsx, Admin modals, various forms
```typescript
// Duplicated pattern:
const [isOpen, setIsOpen] = useState(false);
const openModal = () => setIsOpen(true);
const closeModal = () => setIsOpen(false);
```
**Solution:** Already have `useModal` hook - not consistently used

#### **Loading States**
**Locations:** Multiple components
```typescript
// Duplicated pattern:
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```
**Solution:** Create `useAsyncState` hook

#### **Toast/Notification Logic**
**Locations:** SalesForecastPage, forms
```typescript
// Duplicated pattern:
const [toast, setToast] = useState(null);
useEffect(() => {
  if (toast) {
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }
}, [toast]);
```
**Solution:** Create global toast context

#### **Form Validation Patterns**
**Locations:** Multiple form components
**Solution:** Create reusable form validation hooks

### **Cross-Cutting Concerns**

#### **Icon Management**
- **Issue**: Icons scattered across components and helpers
- **Current**: ICONS helper + direct imports
- **Solution**: Centralized icon component system

#### **Theme Application**
- **Issue**: Theme classes applied inconsistently
- **Current**: Manual class switching
- **Solution**: Theme-aware component variants

#### **Error Handling**
- **Issue**: Inconsistent error handling patterns
- **Current**: Try-catch + local state
- **Solution**: Global error boundary + error context

#### **Data Fetching**
- **Issue**: Mixed patterns (axios + fetch + Supabase)
- **Current**: Direct API calls in components
- **Solution**: Unified data layer with React Query

---

## 6. Recommendations

### **Immediate Actions (High Priority)**
1. **Split SalesForecastPage** into smaller components
2. **Implement lazy loading** for admin and chart routes
3. **Create consistent error handling** pattern
4. **Consolidate modal management** using existing useModal hook

### **Medium Priority**
1. **Refactor AppSidebar** navigation logic
2. **Create unified data fetching** layer
3. **Implement proper loading states** pattern
4. **Add proper TypeScript** throughout admin section

### **Long Term**
1. **Consider state management library** (Redux Toolkit/Zustand) for complex state
2. **Implement proper routing guards** and role-based access
3. **Add component composition** patterns to reduce prop drilling
4. **Create design system** with consistent component API

---

## 7. Metrics Summary

### **Code Organization Health**
- **Components**: 100+ components across 8 categories
- **Pages**: 25+ page components
- **Contexts**: 4 global contexts (appropriate scope)
- **God Components**: 4 identified (needs refactoring)
- **Circular Dependencies**: None critical, some tight coupling

### **State Management Distribution**
- **Global State**: 4 contexts (Auth, Theme, Sidebar, Admin Data)
- **Local State**: 90%+ components use local useState
- **External State**: Supabase for persistence
- **Caching**: None (all fresh requests)

### **Routing Complexity**
- **Route Levels**: 3 levels deep maximum
- **Protected Routes**: 80% of application routes
- **Lazy Loading**: 0% implemented
- **Code Splitting**: None

This analysis provides a comprehensive foundation for architectural improvements and technical debt reduction planning.
