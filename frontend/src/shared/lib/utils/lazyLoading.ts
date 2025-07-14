import { lazy, ComponentType } from "react";

// Lazy loading utility with custom loading component
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return LazyComponent;
};

// Pre-defined lazy components for common organisms
export const LazyOrdersTable = createLazyComponent(
  () => import('../components/organisms/OrdersTable/OrdersTable')
);

export const LazyMetricsGrid = createLazyComponent(
  () => import('../components/organisms/MetricsGrid')
);

export const LazyChartContainer = createLazyComponent(
  () => import('../components/organisms/ChartContainer')
);

export const LazyDashboardGrid = createLazyComponent(
  () => import('../features/dashboard/components/DashboardGrid')
);

// Pre-defined lazy components for templates
export const LazyDashboardTemplate = createLazyComponent(
  () => import('../components/templates/DashboardTemplate')
);

export const LazyAuthTemplate = createLazyComponent(
  () => import('../components/templates/AuthTemplate')
);

export const LazyRecentOrdersWidget = createLazyComponent(
  () => import('../components/templates/RecentOrdersWidget/RecentOrdersWidget')
);

// Route-based lazy loading
export const LazyDashboardPage = createLazyComponent(
  () => import('../pages/DashboardPage')
);

export const LazyAuthPage = createLazyComponent(
  () => import('../pages/AuthPage')
);

export const LazySettingsPage = createLazyComponent(
  () => import('../pages/SettingsPage')
);

// Lazy loading with retry mechanism
export const createLazyComponentWithRetry = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
) => {
  const retryImport = (retriesLeft: number): Promise<{ default: T }> => {
    return importFunc().catch((error) => {
      if (retriesLeft > 0) {
        return new Promise<{ default: T }>((resolve) => {
          setTimeout(() => resolve(retryImport(retriesLeft - 1)), delay);
        });
      }
      throw error;
    });
  };

  return lazy(() => retryImport(retries));
};

// Preload utility for eager loading
export const preloadComponent = (importFunc: () => Promise<{ default: any }>) => {
  const componentImport = importFunc();
  return componentImport;
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard components
  preloadComponent(() => import('../components/organisms/MetricsGrid'));
  preloadComponent(() => import('../components/organisms/ChartContainer'));
  
  // Preload frequently used templates
  preloadComponent(() => import('../components/templates/DashboardTemplate'));
  preloadComponent(() => import('../components/templates/RecentOrdersWidget/RecentOrdersWidget'));
};

// Component loader with error boundary
export const createComponentLoader = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => {
    try {
      return <LazyComponent {...props} />;
    } catch (error) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent {...props} />;
      }
      throw error;
    }
  };
};
