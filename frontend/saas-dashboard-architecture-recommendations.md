# Рекомендации по архитектуре для мультиорганизационного SaaS-дашборда

## 🏗 Архитектурные выводы из аудита

На основе проведенного аудита кода, для успешной реализации мультиорганизационного SaaS-дашборда необходимо устранить выявленные проблемы и применить следующие архитектурные паттерны:

## 📊 Структура Dashboard-компонентов

### 1. Модульная архитектура виджетов
```typescript
// src/dashboard/types.ts
interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map';
  title: string;
  dataSource: string;
  config: WidgetConfig;
  permissions: string[];
  organizationId: string;
}

// src/dashboard/components/DashboardGrid.tsx
const DashboardGrid: React.FC<DashboardProps> = ({ widgets, layout }) => {
  const memoizedWidgets = useMemo(() => 
    widgets.map(widget => (
      <WidgetWrapper key={widget.id} widget={widget}>
        <DynamicWidget {...widget} />
      </WidgetWrapper>
    )), [widgets]
  );
  
  return <GridLayout>{memoizedWidgets}</GridLayout>;
};
```

### 2. Система дизайн-токенов для мультитенантности
```typescript
// src/styles/design-system.ts
export const createThemeTokens = (orgBranding: OrgBranding) => ({
  colors: {
    primary: orgBranding.primaryColor || '#465fff',
    secondary: orgBranding.secondaryColor || '#9cb9ff',
    background: orgBranding.backgroundColor || '#ffffff',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: orgBranding.fontFamily || 'Inter, sans-serif',
  }
});
```

## 🔐 Мультиорганизационная безопасность

### 1. Context для организационной изоляции
```typescript
// src/context/OrganizationContext.tsx
interface OrganizationContextType {
  currentOrg: Organization | null;
  userPermissions: Permission[];
  switchOrganization: (orgId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const OrganizationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  
  const hasPermission = useCallback((permission: string) => {
    return userPermissions.some(p => p.name === permission && p.organizationId === currentOrg?.id);
  }, [userPermissions, currentOrg]);
  
  // Исправление проблемы с any типами из аудита
  const switchOrganization = useCallback(async (orgId: string): Promise<void> => {
    try {
      const org = await fetchOrganization(orgId);
      const permissions = await fetchUserPermissions(orgId);
      setCurrentOrg(org);
      setUserPermissions(permissions);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new OrganizationError(error.message, error.code);
      }
      throw new OrganizationError('Failed to switch organization', 'SWITCH_ERROR');
    }
  }, []);
  
  return (
    <OrganizationContext.Provider value={{ 
      currentOrg, 
      userPermissions, 
      switchOrganization, 
      hasPermission 
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};
```

### 2. HOC для проверки прав доступа
```typescript
// src/hoc/withPermission.tsx
export function withPermission<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  requiredPermission: string
) {
  return React.memo((props: T) => {
    const { hasPermission } = useOrganization();
    
    if (!hasPermission(requiredPermission)) {
      return <AccessDenied />;
    }
    
    return <WrappedComponent {...props} />;
  });
}

// Использование
const SecureSalesChart = withPermission(SalesChart, 'view:sales');
```

## 📈 Система виджетов для ML и прогнозов

### 1. Типобезопасные компоненты для графиков
```typescript
// src/components/charts/types.ts
interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ForecastChartProps {
  data: ForecastData;
  organizationId: string;
  timeRange: TimeRange;
  onDrillDown?: (dataPoint: DataPoint) => void;
}

// src/components/charts/ForecastChart.tsx
export const ForecastChart: React.FC<ForecastChartProps> = ({ 
  data, 
  organizationId, 
  timeRange,
  onDrillDown 
}) => {
  // Исправление проблем с мемоизацией из аудита
  const chartConfig = useMemo(() => ({
    type: 'line' as const,
    data: transformForecastData(data),
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            // Исправление any типов
            label: (context: TooltipItem<'line'>) => 
              `Прогноз: ${context.parsed.y} единиц`
          }
        }
      }
    }
  }), [data]);
  
  const handleChartClick = useCallback((event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0 && onDrillDown) {
      const dataIndex = elements[0].index;
      const dataPoint = data.points[dataIndex];
      onDrillDown(dataPoint);
    }
  }, [data.points, onDrillDown]);
  
  return (
    <Chart 
      {...chartConfig} 
      onClick={handleChartClick}
    />
  );
};
```

### 2. Система кеширования для производительности
```typescript
// src/hooks/useDataCache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  organizationId: string;
}

export function useDataCache<T>(
  key: string, 
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 минут
) {
  const { currentOrg } = useOrganization();
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());
  
  const getCachedData = useCallback(async (): Promise<T> => {
    const cacheKey = `${currentOrg?.id}-${key}`;
    const cached = cache.get(cacheKey);
    
    if (cached && 
        Date.now() - cached.timestamp < ttl && 
        cached.organizationId === currentOrg?.id) {
      return cached.data;
    }
    
    try {
      const data = await fetcher();
      setCache(prev => new Map(prev).set(cacheKey, {
        data,
        timestamp: Date.now(),
        organizationId: currentOrg?.id || ''
      }));
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new DataFetchError('Failed to fetch data', 'FETCH_ERROR');
    }
  }, [key, fetcher, ttl, currentOrg?.id, cache]);
  
  return { getCachedData };
}
```

## 🎛 Глобальные фильтры и состояние

### 1. Централизованное управление фильтрами
```typescript
// src/context/FiltersContext.tsx
interface DashboardFilters {
  dateRange: DateRange;
  selectedStores: string[];
  selectedProducts: string[];
  organizationId: string;
}

export const FiltersProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { currentOrg } = useOrganization();
  const [filters, setFilters] = useState<DashboardFilters>(() => ({
    dateRange: { start: new Date(), end: new Date() },
    selectedStores: [],
    selectedProducts: [],
    organizationId: currentOrg?.id || ''
  }));
  
  // Сброс фильтров при смене организации
  useEffect(() => {
    if (currentOrg?.id !== filters.organizationId) {
      setFilters(prev => ({
        ...prev,
        organizationId: currentOrg?.id || '',
        selectedStores: [],
        selectedProducts: []
      }));
    }
  }, [currentOrg?.id, filters.organizationId]);
  
  const updateFilters = useCallback((updates: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);
  
  return (
    <FiltersContext.Provider value={{ filters, updateFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};
```

### 2. URL-синхронизация фильтров
```typescript
// src/hooks/useFilterSync.ts
export function useFilterSync() {
  const { filters, updateFilters } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Синхронизация URL с фильтрами
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.dateRange.start) {
      params.set('from', filters.dateRange.start.toISOString());
    }
    if (filters.dateRange.end) {
      params.set('to', filters.dateRange.end.toISOString());
    }
    if (filters.selectedStores.length > 0) {
      params.set('stores', filters.selectedStores.join(','));
    }
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);
  
  // Восстановление фильтров из URL
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const stores = searchParams.get('stores');
    
    if (from || to || stores) {
      updateFilters({
        dateRange: {
          start: from ? new Date(from) : filters.dateRange.start,
          end: to ? new Date(to) : filters.dateRange.end
        },
        selectedStores: stores ? stores.split(',') : []
      });
    }
  }, [searchParams, updateFilters, filters.dateRange]);
}
```

## 🔧 Error Handling и Monitoring

### 1. Централизованная обработка ошибок
```typescript
// src/services/ErrorService.ts
export class ErrorService {
  static handleError(error: Error, context: ErrorContext) {
    if (error instanceof ApiError) {
      this.handleApiError(error, context);
    } else if (error instanceof ValidationError) {
      this.handleValidationError(error, context);
    } else {
      this.handleUnknownError(error, context);
    }
  }
  
  private static handleApiError(error: ApiError, context: ErrorContext) {
    // Логирование для мониторинга
    console.error('[API Error]', {
      message: error.message,
      status: error.status,
      context,
      organizationId: context.organizationId,
      userId: context.userId,
      timestamp: new Date().toISOString()
    });
    
    // Уведомление пользователя
    NotificationService.showError(error.userMessage || 'Произошла ошибка');
  }
}
```

### 2. Performance monitoring
```typescript
// src/hooks/usePerformanceMonitor.ts
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Медленный рендер > 100ms
        console.warn(`[Performance] ${componentName} slow render: ${renderTime}ms`);
      }
    };
  });
}
```

## 📱 Responsive и Accessibility

### 1. Адаптивные виджеты
```typescript
// src/hooks/useResponsiveLayout.ts
export function useResponsiveLayout() {
  const [layout, setLayout] = useState<LayoutType>('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setLayout('mobile');
      } else if (width < 1024) {
        setLayout('tablet');
      } else {
        setLayout('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return layout;
}
```

## 🚀 Внедрение рекомендаций

### Приоритет внедрения:
1. **Неделя 1**: Исправить критические проблемы из аудита
2. **Неделя 2**: Внедрить OrganizationContext и систему прав
3. **Неделя 3**: Создать систему виджетов и дизайн-токены
4. **Неделя 4**: Добавить кеширование и performance мониторинг

Эта архитектура учитывает все выявленные в аудите проблемы и создает масштабируемую основу для мультиорганизационного SaaS-дашборда с ML-функциональностью.
