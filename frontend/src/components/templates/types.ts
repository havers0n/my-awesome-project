// Common types for all templates
export type SpacingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type MaxWidthSize =
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | 'full';
export type BackgroundTheme = 'none' | 'white' | 'gray' | 'dark';

// Responsive breakpoints
export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

// Base interface for all template props
export interface BaseTemplateProps {
  padding?: SpacingSize;
  maxWidth?: MaxWidthSize;
  background?: BackgroundTheme;
  className?: string;
  containerClassName?: string;
}

// Grid-based template props
export interface GridTemplateProps extends BaseTemplateProps {
  columns?: number;
  rows?: number;
  gap?: SpacingSize;
  gridTemplateAreas?: string;
}

// Responsive configuration
export interface ResponsiveConfig {
  gap?: SpacingSize;
  padding?: SpacingSize;
  columns?: number;
  rows?: number;
}

// Layout area configuration
export interface BaseLayoutArea {
  component: React.ReactNode;
  gridArea?: string;
  className?: string;
  visible?: boolean;
}

// Template layout configuration
export interface LayoutConfig {
  gridTemplateAreas: string;
  columns: number;
  rows: number;
}

// Common utility types
export type TemplateVariant =
  | 'standard'
  | 'compact'
  | 'wide'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'custom';
export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'default' | 'elevated' | 'outlined' | 'filled';

// Template context for sharing layout state
export interface TemplateContext {
  layout: TemplateVariant;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  theme: 'light' | 'dark';
}

// Helper types for CSS classes
export type TailwindSpacing =
  | 'gap-0'
  | 'gap-2'
  | 'gap-4'
  | 'gap-6'
  | 'gap-8'
  | 'p-0'
  | 'p-2'
  | 'p-4'
  | 'p-6'
  | 'p-8';
export type TailwindMaxWidth =
  | 'max-w-sm'
  | 'max-w-md'
  | 'max-w-lg'
  | 'max-w-xl'
  | 'max-w-2xl'
  | 'max-w-3xl'
  | 'max-w-4xl'
  | 'max-w-5xl'
  | 'max-w-6xl'
  | 'max-w-7xl'
  | 'max-w-full';
export type TailwindBackground =
  | 'bg-white'
  | 'bg-gray-50'
  | 'bg-gray-900'
  | 'bg-gray-800'
  | 'bg-gray-950';

// Template registration for dynamic loading
export interface TemplateRegistration {
  name: string;
  component: React.ComponentType<any>;
  description: string;
  category: 'dashboard' | 'page' | 'form' | 'report';
  thumbnail?: string;
  tags?: string[];
}

// Template configuration for persistence
export interface TemplateConfig {
  id: string;
  name: string;
  template: TemplateVariant;
  settings: {
    gap: SpacingSize;
    padding: SpacingSize;
    background: BackgroundTheme;
    maxWidth: MaxWidthSize;
  };
  areas: Record<
    string,
    {
      visible: boolean;
      className?: string;
      order?: number;
    }
  >;
  responsive?: Record<ResponsiveBreakpoint, Partial<ResponsiveConfig>>;
  createdAt: Date;
  updatedAt: Date;
}
