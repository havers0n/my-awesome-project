// Templates - комплексные шаблоны страниц (новая структура Atomic Design)
export * from './RecentOrdersWidget';

// Default exports для удобства
export { default as RecentOrdersWidget } from './RecentOrdersWidget';
export { default as AuthTemplate } from './AuthTemplate';

// Legacy templates for backward compatibility
export { default as DashboardTemplate } from './DashboardTemplate';
export { default as ExampleDashboardPage } from './ExampleDashboardPage';

// Type exports
export type { DashboardTemplateProps, DashboardArea, LayoutArea } from './DashboardTemplate';

// Common types for all templates
export type {
  SpacingSize,
  MaxWidthSize,
  BackgroundTheme,
  ResponsiveBreakpoint,
  BaseTemplateProps,
  GridTemplateProps,
  ResponsiveConfig,
  BaseLayoutArea,
  LayoutConfig,
  TemplateVariant,
  ComponentSize,
  ComponentVariant,
  TemplateContext,
  TemplateRegistration,
  TemplateConfig,
} from './types';

// Utility functions
export * from './utils';
