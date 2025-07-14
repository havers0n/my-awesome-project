/**
 * Deprecation utility for managing component migrations
 */

interface DeprecationOptions {
  component: string;
  replacement: string;
  version: string;
  migration?: string;
}

export const deprecationWarning = (options: DeprecationOptions): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `🚨 DEPRECATED: ${options.component} is deprecated and will be removed in version ${options.version}.\n` +
      `✅ Please use ${options.replacement} instead.\n` +
      (options.migration ? `📖 Migration guide: ${options.migration}` : '')
    );
  }
};

// Common deprecation warnings
export const DEPRECATED_COMPONENTS = {
  'ui/button/Button': {
    component: 'ui/button/Button',
    replacement: 'atoms/Button',
    version: '2.0.0',
    migration: 'See ATOMIC_DESIGN_MIGRATION_EXAMPLES.md'
  },
  'ui/badge/Badge': {
    component: 'ui/badge/Badge', 
    replacement: 'atoms/Badge',
    version: '2.0.0',
    migration: 'See ATOMIC_DESIGN_MIGRATION_EXAMPLES.md'
  },
  'common/Card': {
    component: 'common/Card',
    replacement: 'atoms/Card',
    version: '2.0.0',
    migration: 'See ATOMIC_DESIGN_MIGRATION_EXAMPLES.md'
  }
} as const;

/**
 * Hook for deprecated components
 */
export const useDeprecationWarning = (componentKey: keyof typeof DEPRECATED_COMPONENTS): void => {
  const options = DEPRECATED_COMPONENTS[componentKey];
  if (options) {
    deprecationWarning(options);
  }
}; 