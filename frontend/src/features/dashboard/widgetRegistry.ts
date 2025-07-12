import { WidgetDefinition } from "./types/dashboard.types";

// Lazy imports для оптимизации
import { lazy } from "react";

const EcommerceMetricsWidget = lazy(() => import("./widgets/EcommerceMetricsWidget"));
const MonthlySalesChartWidget = lazy(() => import("./widgets/MonthlySalesChartWidget"));
const StatisticsChartWidget = lazy(() => import("./widgets/StatisticsChartWidget"));
const MonthlyTargetWidget = lazy(() => import("./widgets/MonthlyTargetWidget"));
const RecentOrdersWidget = lazy(() => import("./widgets/RecentOrdersWidget"));
const DemographicCardWidget = lazy(() => import("./widgets/DemographicCardWidget"));

// Новые приоритетные виджеты
const ShelfAvailabilityWidget = lazy(() => import("./widgets/ShelfAvailabilityWidget"));
const SalesForecastWidget = lazy(() => import("./widgets/SalesForecastWidget"));
const TasksOverviewWidget = lazy(() => import("./widgets/TasksOverviewWidget"));
const InventoryAlertsWidget = lazy(() => import("./widgets/InventoryAlertsWidget"));

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: 'ecommerce-metrics',
    title: 'Метрики E-commerce',
    description: 'Основные показатели продаж и конверсии',
    category: 'analytics',
    component: EcommerceMetricsWidget,
    defaultSize: { w: 12, h: 4 },
    minSize: { w: 6, h: 3 },
    maxSize: { w: 12, h: 6 },
    configurable: false,
    icon: 'BarChart3',
    preview: '/images/widgets/ecommerce-metrics.png',
  },
  {
    id: 'monthly-sales-chart',
    title: 'График продаж по месяцам',
    description: 'Динамика продаж за последние месяцы',
    category: 'sales',
    component: MonthlySalesChartWidget,
    defaultSize: { w: 8, h: 6 },
    minSize: { w: 6, h: 4 },
    maxSize: { w: 12, h: 8 },
    configurable: true,
    icon: 'TrendingUp',
    preview: '/images/widgets/monthly-sales-chart.png',
  },
  {
    id: 'statistics-chart',
    title: 'Статистика',
    description: 'Общая статистика по различным показателям',
    category: 'analytics',
    component: StatisticsChartWidget,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 8, h: 4 },
    maxSize: { w: 12, h: 8 },
    configurable: true,
    icon: 'BarChart',
    preview: '/images/widgets/statistics-chart.png',
  },
  {
    id: 'monthly-target',
    title: 'Месячные цели',
    description: 'Прогресс выполнения месячных целей',
    category: 'sales',
    component: MonthlyTargetWidget,
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
    maxSize: { w: 6, h: 8 },
    configurable: true,
    icon: 'Target',
    preview: '/images/widgets/monthly-target.png',
  },
  {
    id: 'recent-orders',
    title: 'Последние заказы',
    description: 'Список последних заказов с деталями',
    category: 'sales',
    component: RecentOrdersWidget,
    defaultSize: { w: 8, h: 6 },
    minSize: { w: 6, h: 4 },
    maxSize: { w: 12, h: 8 },
    configurable: false,
    icon: 'ShoppingCart',
    preview: '/images/widgets/recent-orders.png',
  },
  {
    id: 'demographic-card',
    title: 'Демографические данные',
    description: 'Анализ демографических данных клиентов',
    category: 'analytics',
    component: DemographicCardWidget,
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
    maxSize: { w: 6, h: 8 },
    configurable: false,
    icon: 'Users',
    preview: '/images/widgets/demographic-card.png',
  },
  // Новые приоритетные виджеты
  {
    id: 'shelf-availability',
    title: 'Доступность товаров',
    description: 'Актуальная информация о наличии товаров на полке',
    category: 'inventory',
    component: ShelfAvailabilityWidget,
    defaultSize: { w: 6, h: 8 },
    minSize: { w: 4, h: 6 },
    maxSize: { w: 8, h: 10 },
    configurable: false,
    icon: 'Package',
    preview: '/images/widgets/shelf-availability.png',
  },
  {
    id: 'sales-forecast',
    title: 'Прогноз продаж',
    description: 'Прогнозирование продаж на основе ML-алгоритмов',
    category: 'forecasting',
    component: SalesForecastWidget,
    defaultSize: { w: 8, h: 8 },
    minSize: { w: 6, h: 6 },
    maxSize: { w: 12, h: 10 },
    configurable: true,
    icon: 'BarChart3',
    preview: '/images/widgets/sales-forecast.png',
  },
  {
    id: 'tasks-overview',
    title: 'Обзор задач',
    description: 'Управление задачами и контроль выполнения',
    category: 'planning',
    component: TasksOverviewWidget,
    defaultSize: { w: 6, h: 8 },
    minSize: { w: 4, h: 6 },
    maxSize: { w: 8, h: 10 },
    configurable: false,
    icon: 'Target',
    preview: '/images/widgets/tasks-overview.png',
  },
  {
    id: 'inventory-alerts',
    title: 'Критические уведомления',
    description: 'Важные уведомления и предупреждения по складу',
    category: 'inventory',
    component: InventoryAlertsWidget,
    defaultSize: { w: 6, h: 8 },
    minSize: { w: 4, h: 6 },
    maxSize: { w: 8, h: 10 },
    configurable: false,
    icon: 'Bell',
    preview: '/images/widgets/inventory-alerts.png',
  },
];

// Функция для получения виджета по ID
export function getWidgetById(id: string): WidgetDefinition | undefined {
  console.log('Looking for widget with id:', id);
  console.log('Available widgets:', WIDGET_REGISTRY.map(w => w.id));
  const widget = WIDGET_REGISTRY.find(widget => widget.id === id);
  console.log('Found widget:', widget);
  return widget;
}

// Функция для получения виджетов по категории
export function getWidgetsByCategory(category: string): WidgetDefinition[] {
  console.log('Getting widgets for category:', category);
  const widgets = WIDGET_REGISTRY.filter(widget => widget.category === category);
  console.log('Found widgets:', widgets.map(w => w.id));
  return widgets;
}

// Функция для получения всех категорий
export function getAllCategories(): string[] {
  const categories = [...new Set(WIDGET_REGISTRY.map(widget => widget.category))];
  console.log('Available categories:', categories);
  return categories;
}

// Отладочная информация при загрузке модуля
console.log('Widget registry loaded with', WIDGET_REGISTRY.length, 'widgets:');
console.log(WIDGET_REGISTRY.map(w => ({ id: w.id, title: w.title, category: w.category }))); 