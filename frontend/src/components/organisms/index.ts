// Organisms - сложные компоненты UI (новая структура Atomic Design)
export * from './OrdersTable';
export * from './OrdersTableHeader';

// Default exports для удобства
export { default as OrdersTable } from './OrdersTable';
export { default as OrdersTableHeader } from './OrdersTableHeader';

// Legacy components for backward compatibility
export { default as MetricsGrid } from './MetricsGrid';
export { default as ChartContainer } from './ChartContainer';
export { default as CountryList } from './CountryList';
export { default as ProductTable } from './ProductTable';
export { default as TargetDisplay } from './TargetDisplay';

// Type exports for easier access
export type { MetricData } from './MetricsGrid';
export type { CountryData } from './CountryList';
export type { ProductData } from './ProductTable';
export type { TargetData, TargetStat } from './TargetDisplay';
