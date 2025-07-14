import { useMemo, useCallback, useRef, useState, useEffect } from "react";

// Generic memoization utility
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Memoized data processing functions
export const memoizedDataProcessor = {
  // Memoize metric calculations
  calculateMetrics: memoize((data: any[]) => {
    return data.map(item => ({
      ...item,
      calculated: item.value * 1.1, // Example calculation
      formatted: new Intl.NumberFormat().format(item.value),
    }));
  }),

  // Memoize chart data transformations
  transformChartData: memoize((rawData: any[], chartType: string) => {
    // Transform data based on chart type
    return rawData.map(item => ({
      ...item,
      transformed: true,
      type: chartType,
    }));
  }),

  // Memoize filtering operations
  filterData: memoize(
    (data: any[], filters: any) => {
      return data.filter(item => {
        return Object.keys(filters).every(
          key => filters[key] === undefined || item[key] === filters[key]
        );
      });
    },
    (data, filters) => `${data.length}-${JSON.stringify(filters)}`
  ),

  // Memoize sorting operations
  sortData: memoize((data: any[], sortField: string, sortOrder: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }),
};

// Hook for memoized expensive calculations
export const useMemoizedValue = <T>(factory: () => T, deps: React.DependencyList): T => {
  return useMemo(factory, deps);
};

// Hook for memoized callbacks
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Hook for debounced values
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for memoized ref callbacks
export const useMemoizedRef = <T>(initialValue: T) => {
  const ref = useRef<T>(initialValue);

  const setRef = useCallback((value: T) => {
    ref.current = value;
  }, []);

  return [ref.current, setRef] as const;
};

// Performance monitoring utilities
export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    console.log(`[Performance] ${name} took ${end - start} milliseconds`);
    return result;
  }) as T;
};

// Cache management utilities
export class ComponentCache {
  private cache = new Map<string, any>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, value: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }

  has(key: string) {
    return this.cache.has(key);
  }
}

// Global cache instance
export const globalCache = new ComponentCache();

// Utility for component-level caching
export const useComponentCache = (key: string) => {
  const getValue = useCallback(
    (defaultValue?: any) => {
      return globalCache.get(key) ?? defaultValue;
    },
    [key]
  );

  const setValue = useCallback(
    (value: any) => {
      globalCache.set(key, value);
    },
    [key]
  );

  return { getValue, setValue };
};

// Memoization for expensive component props
export const useMemoizedProps = <T extends Record<string, any>>(
  props: T,
  deps: React.DependencyList
): T => {
  return useMemo(() => props, deps);
};

// Utility for memoizing component children
export const useMemoizedChildren = (
  children: React.ReactNode,
  deps: React.DependencyList
): React.ReactNode => {
  return useMemo(() => children, deps);
};
