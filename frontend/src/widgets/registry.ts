import { lazy } from 'react';
import { registerWidget } from '@/shared/services/widgetRegistryService';

// Lazy loading компонентов виджетов
const ChartWidget = lazy(() => import('./charts/ChartWidget'));
const DashboardMetricsWidget = lazy(() => import('./dashboard-metrics/DashboardMetricsWidget'));
const OrdersTableWidget = lazy(() => import('./orders-table/OrdersTableWidget'));
const InventoryWidget = lazy(() => import('./inventory/InventoryWidget'));
const ReportWidget = lazy(() => import('./reports/ReportWidget'));

// Регистрация виджетов
export const initializeWidgets = () => {
  // Аналитические виджеты
  registerWidget({
    id: 'ecommerce-metrics',
    title: 'Метрики E-commerce',
    description: 'Основные показатели продаж и конверсии',
    category: 'analytics',
    component: ChartWidget,
    defaultSize: { w: 12, h: 4 },
    minSize: { w: 6, h: 3 },
    maxSize: { w: 12, h: 6 },
    configurable: false,
    icon: 'BarChart3',
    preview: '/images/widgets/ecommerce-metrics.png',
  });

  registerWidget({
    id: 'statistics-chart',
    title: 'Статистика',
    description: 'Общая статистика по различным показателям',
    category: 'analytics',
    component: ChartWidget,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 8, h: 4 },
    maxSize: { w: 12, h: 8 },
    configurable: true,
    icon: 'BarChart',
    preview: '/images/widgets/statistics-chart.png',
  });

  console.log('All widgets registered successfully');
};

// Автоматическая инициализация при загрузке модуля
initializeWidgets();
