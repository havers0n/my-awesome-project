import React from 'react';
import { Card } from '../atoms';

// Define the layout area types for the dashboard
export type DashboardArea =
  | 'header'
  | 'sidebar'
  | 'main'
  | 'metrics'
  | 'charts'
  | 'actions'
  | 'footer';

// Define layout configuration for each area
export interface LayoutArea {
  area: DashboardArea;
  component: React.ReactNode;
  gridArea?: string;
  className?: string;
  visible?: boolean;
}

// Main props for the DashboardTemplate
export interface DashboardTemplateProps {
  // Layout configuration
  layout?: 'standard' | 'compact' | 'wide' | 'sidebar-left' | 'sidebar-right' | 'custom';

  // Grid configuration
  columns?: number;
  rows?: number;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  // Responsive breakpoints
  responsive?: {
    sm?: Partial<DashboardTemplateProps>;
    md?: Partial<DashboardTemplateProps>;
    lg?: Partial<DashboardTemplateProps>;
    xl?: Partial<DashboardTemplateProps>;
  };

  // Layout areas and their content
  areas: LayoutArea[];

  // Container styling
  containerClassName?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?:
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

  // Background and theme
  background?: 'none' | 'white' | 'gray' | 'dark';

  // Custom CSS Grid template areas
  gridTemplateAreas?: string;

  // Additional styling
  className?: string;
}

// Predefined layout configurations
const LAYOUT_CONFIGS = {
  standard: {
    gridTemplateAreas: `
      "header header header"
      "sidebar main actions"
      "footer footer footer"
    `,
    columns: 3,
    rows: 3,
  },
  compact: {
    gridTemplateAreas: `
      "header header"
      "main actions"
    `,
    columns: 2,
    rows: 2,
  },
  wide: {
    gridTemplateAreas: `
      "header header header header"
      "metrics metrics metrics metrics"
      "charts charts charts actions"
      "footer footer footer footer"
    `,
    columns: 4,
    rows: 4,
  },
  'sidebar-left': {
    gridTemplateAreas: `
      "sidebar header header"
      "sidebar metrics metrics"
      "sidebar charts actions"
    `,
    columns: 3,
    rows: 3,
  },
  'sidebar-right': {
    gridTemplateAreas: `
      "header header sidebar"
      "metrics metrics sidebar"
      "charts actions sidebar"
    `,
    columns: 3,
    rows: 3,
  },
};

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  layout = 'standard',
  columns,
  rows,
  gap = 'md',
  responsive = {},
  areas,
  containerClassName = '',
  padding = 'md',
  maxWidth = 'full',
  background = 'none',
  gridTemplateAreas,
  className = '',
}) => {
  // Get layout configuration
  const layoutConfig = layout === 'custom' ? {} : LAYOUT_CONFIGS[layout];

  // Generate CSS classes
  const getGapClasses = (gapSize: string) => {
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };
    return gapClasses[gapSize as keyof typeof gapClasses] || gapClasses.md;
  };

  const getPaddingClasses = (paddingSize: string) => {
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };
    return paddingClasses[paddingSize as keyof typeof paddingClasses] || paddingClasses.md;
  };

  const getMaxWidthClasses = (width: string) => {
    const maxWidthClasses = {
      none: '',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
    };
    return maxWidthClasses[width as keyof typeof maxWidthClasses] || maxWidthClasses.full;
  };

  const getBackgroundClasses = (bg: string) => {
    const backgroundClasses = {
      none: '',
      white: 'bg-white dark:bg-gray-900',
      gray: 'bg-gray-50 dark:bg-gray-800',
      dark: 'bg-gray-900 dark:bg-gray-950',
    };
    return backgroundClasses[bg as keyof typeof backgroundClasses] || backgroundClasses.none;
  };

  // Generate responsive classes
  const getResponsiveClasses = () => {
    let classes = '';

    Object.entries(responsive).forEach(([breakpoint, config]) => {
      const prefix =
        breakpoint === 'sm'
          ? 'sm:'
          : breakpoint === 'md'
            ? 'md:'
            : breakpoint === 'lg'
              ? 'lg:'
              : 'xl:';

      if (config.gap) {
        classes += ` ${prefix}${getGapClasses(config.gap)}`;
      }
      if (config.padding) {
        classes += ` ${prefix}${getPaddingClasses(config.padding)}`;
      }
    });

    return classes;
  };

  // Generate grid template areas
  const getGridTemplateAreas = () => {
    if (gridTemplateAreas) return gridTemplateAreas;
    if (layoutConfig.gridTemplateAreas) return layoutConfig.gridTemplateAreas;
    return '';
  };

  // Generate grid style
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns || layoutConfig.columns || 3}, 1fr)`,
    gridTemplateRows: rows ? `repeat(${rows}, auto)` : 'auto',
    gridTemplateAreas: getGridTemplateAreas(),
  };

  // Filter visible areas
  const visibleAreas = areas.filter(area => area.visible !== false);

  return (
    <div
      className={`
        w-full 
        ${getMaxWidthClasses(maxWidth)}
        ${getBackgroundClasses(background)}
        ${getPaddingClasses(padding)}
        ${containerClassName}
        ${className}
      `.trim()}
    >
      <div
        className={`
          grid 
          ${getGapClasses(gap)}
          ${getResponsiveClasses()}
          w-full
          min-h-screen
        `.trim()}
        style={gridStyle}
      >
        {visibleAreas.map((area, index) => (
          <div
            key={`${area.area}-${index}`}
            className={`
              ${area.className || ''}
              ${area.gridArea ? '' : ''}
            `.trim()}
            style={{
              gridArea: area.gridArea || area.area,
            }}
          >
            {area.component}
          </div>
        ))}
      </div>
    </div>
  );
};

// Pre-configured dashboard template variants
export const StandardDashboardTemplate: React.FC<
  Omit<DashboardTemplateProps, 'layout'>
> = props => <DashboardTemplate {...props} layout="standard" />;

export const CompactDashboardTemplate: React.FC<Omit<DashboardTemplateProps, 'layout'>> = props => (
  <DashboardTemplate {...props} layout="compact" />
);

export const WideDashboardTemplate: React.FC<Omit<DashboardTemplateProps, 'layout'>> = props => (
  <DashboardTemplate {...props} layout="wide" />
);

export const SidebarLeftDashboardTemplate: React.FC<
  Omit<DashboardTemplateProps, 'layout'>
> = props => <DashboardTemplate {...props} layout="sidebar-left" />;

export const SidebarRightDashboardTemplate: React.FC<
  Omit<DashboardTemplateProps, 'layout'>
> = props => <DashboardTemplate {...props} layout="sidebar-right" />;

export default DashboardTemplate;
