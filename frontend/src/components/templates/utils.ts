import { SpacingSize, MaxWidthSize, BackgroundTheme, ResponsiveBreakpoint } from './types';

// Utility functions for CSS class generation
export const getSpacingClasses = (size: SpacingSize, type: 'gap' | 'padding'): string => {
  const prefix = type === 'gap' ? 'gap-' : 'p-';
  const spacingMap = {
    none: '0',
    sm: '2',
    md: '4',
    lg: '6',
    xl: '8',
  };

  return `${prefix}${spacingMap[size]}`;
};

export const getMaxWidthClasses = (width: MaxWidthSize): string => {
  const maxWidthMap = {
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

  return maxWidthMap[width] || maxWidthMap.full;
};

export const getBackgroundClasses = (background: BackgroundTheme): string => {
  const backgroundMap = {
    none: '',
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-800',
    dark: 'bg-gray-900 dark:bg-gray-950',
  };

  return backgroundMap[background] || backgroundMap.none;
};

// Responsive utility functions
export const generateResponsiveClasses = (
  responsive: Record<ResponsiveBreakpoint, any>,
  property: string,
  converter: (value: any) => string
): string => {
  let classes = '';

  Object.entries(responsive).forEach(([breakpoint, config]) => {
    const prefix = `${breakpoint}:`;
    const value = config[property];

    if (value) {
      classes += ` ${prefix}${converter(value)}`;
    }
  });

  return classes;
};

// Grid template area utilities
export const formatGridTemplateAreas = (areas: string): string => {
  return areas
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ');
};

export const generateGridStyle = (
  columns: number,
  rows?: number,
  gridTemplateAreas?: string
): React.CSSProperties => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: rows ? `repeat(${rows}, auto)` : 'auto',
    gridTemplateAreas: gridTemplateAreas ? formatGridTemplateAreas(gridTemplateAreas) : undefined,
  };
};

// Breakpoint detection utilities
export const getBreakpointValue = (breakpoint: ResponsiveBreakpoint): number => {
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  return breakpoints[breakpoint];
};

export const useResponsiveValue = <T>(
  values: Partial<Record<ResponsiveBreakpoint, T>>,
  defaultValue: T,
  currentWidth: number
): T => {
  const breakpoints: ResponsiveBreakpoint[] = ['xl', 'lg', 'md', 'sm'];

  for (const breakpoint of breakpoints) {
    const breakpointValue = getBreakpointValue(breakpoint);
    if (currentWidth >= breakpointValue && values[breakpoint] !== undefined) {
      return values[breakpoint] as T;
    }
  }

  return defaultValue;
};

// Layout area utilities
export const filterVisibleAreas = <T extends { visible?: boolean }>(areas: T[]): T[] => {
  return areas.filter(area => area.visible !== false);
};

export const sortAreasByOrder = <T extends { order?: number }>(areas: T[]): T[] => {
  return [...areas].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return orderA - orderB;
  });
};

// Template validation utilities
export const validateGridAreas = (areas: string[], gridTemplateAreas: string): boolean => {
  const templateAreas =
    gridTemplateAreas
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ')
      .match(/"\w+"/g) || [];

  const uniqueAreas = [...new Set(templateAreas.map(area => area.replace(/"/g, '')))];

  return areas.every(area => uniqueAreas.includes(area));
};

// Animation utilities for template transitions
export const getTransitionClasses = (
  duration: 'fast' | 'normal' | 'slow' = 'normal',
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease-in-out'
): string => {
  const durationMap = {
    fast: 'duration-200',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  const easingMap = {
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
  };

  return `transition-all ${durationMap[duration]} ${easingMap[easing]}`;
};

// Theme utilities
export const getThemeClasses = (theme: 'light' | 'dark' | 'auto' = 'auto'): string => {
  if (theme === 'auto') {
    return ''; // Let the system handle dark mode
  }

  return theme === 'dark' ? 'dark' : '';
};

// Accessibility utilities
export const generateAriaLabels = (area: string): Record<string, string> => {
  const labelMap: Record<string, string> = {
    header: 'Page header',
    sidebar: 'Navigation sidebar',
    main: 'Main content area',
    metrics: 'Key metrics and statistics',
    charts: 'Charts and visualizations',
    actions: 'Quick actions',
    footer: 'Page footer',
  };

  return {
    'aria-label': labelMap[area] || `${area} section`,
    role: area === 'main' ? 'main' : 'region',
  };
};

// Performance utilities
export const shouldUseMemo = (dependencies: any[]): boolean => {
  return dependencies.some(dep => typeof dep === 'object' && dep !== null && !Array.isArray(dep));
};

// Template persistence utilities
export const serializeTemplateConfig = (config: any): string => {
  return JSON.stringify(config, null, 2);
};

export const deserializeTemplateConfig = (serialized: string): any => {
  try {
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to deserialize template config:', error);
    return null;
  }
};

// CSS custom properties utilities
export const generateCSSCustomProperties = (
  config: Record<string, string | number>
): React.CSSProperties => {
  const properties: React.CSSProperties = {};

  Object.entries(config).forEach(([key, value]) => {
    properties[`--${key}` as any] = value;
  });

  return properties;
};
