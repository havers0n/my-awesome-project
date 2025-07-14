// Widgets layer public API
// Export composite UI components here

// Layout widgets
export * from "./layout";
export * from "./header";
export * from "./sidebar";

// Data widgets
export * from "./orders-table";
export * from "./product-table";
export * from "./dashboard-metrics";

// Visualization widgets
export * from "./charts";
export * from "./reports";

// Widget types
export type { OrdersTableWidgetProps } from "./orders-table";
export type { ProductTableWidgetProps } from "./product-table";
export type { DashboardMetricsWidgetProps } from "./dashboard-metrics";
export type { ChartWidgetProps } from "./charts";
export type { ReportWidgetProps } from "./reports";
export type { HeaderWidgetProps } from "./header";
export type { SidebarWidgetProps } from "./sidebar";
export type { AppLayoutWidgetProps } from "./layout";
