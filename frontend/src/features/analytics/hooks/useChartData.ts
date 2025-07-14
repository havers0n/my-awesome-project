import { useState, useCallback } from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  config?: ChartConfig;
}

export interface ChartConfig {
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  stacked?: boolean;
  responsive?: boolean;
  height?: number;
  width?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ChartFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  category?: string;
  type?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
}

// Мок данные для графиков
const mockChartData: ChartData[] = [
  {
    id: 'sales-chart',
    type: 'line',
    title: 'Продажи по месяцам',
    data: [
      { label: 'Январь', value: 65000 },
      { label: 'Февраль', value: 59000 },
      { label: 'Март', value: 80000 },
      { label: 'Апрель', value: 81000 },
      { label: 'Май', value: 56000 },
      { label: 'Июнь', value: 55000 },
      { label: 'Июль', value: 75000 },
    ],
    xAxisLabel: 'Месяц',
    yAxisLabel: 'Продажи (₽)',
    colors: ['#3b82f6'],
    config: {
      showLegend: true,
      showTooltip: true,
      showGrid: true,
      animate: true,
      responsive: true,
    }
  },
  {
    id: 'category-chart',
    type: 'bar',
    title: 'Продажи по категориям',
    data: [
      { label: 'Электроника', value: 45000 },
      { label: 'Одежда', value: 35000 },
      { label: 'Книги', value: 25000 },
      { label: 'Дом и сад', value: 30000 },
      { label: 'Спорт', value: 20000 },
    ],
    xAxisLabel: 'Категория',
    yAxisLabel: 'Продажи (₽)',
    colors: ['#10b981'],
    config: {
      showLegend: false,
      showTooltip: true,
      showGrid: true,
      animate: true,
      responsive: true,
    }
  },
  {
    id: 'status-chart',
    type: 'pie',
    title: 'Распределение заказов по статусам',
    data: [
      { label: 'Выполнено', value: 60, color: '#10b981' },
      { label: 'В процессе', value: 25, color: '#f59e0b' },
      { label: 'Отменено', value: 10, color: '#ef4444' },
      { label: 'Возврат', value: 5, color: '#6b7280' },
    ],
    config: {
      showLegend: true,
      showTooltip: true,
      animate: true,
      responsive: true,
    }
  }
];

interface UseChartDataReturn {
  charts: ChartData[];
  loading: boolean;
  error: string | null;
  fetchChartData: (filters?: ChartFilters) => Promise<void>;
  getChartById: (id: string) => ChartData | undefined;
  updateChartConfig: (id: string, config: Partial<ChartConfig>) => void;
  exportChartData: (id: string, format: 'json' | 'csv' | 'excel') => Promise<Blob>;
  refreshChart: (id: string) => Promise<void>;
  createChart: (chartData: Omit<ChartData, 'id'>) => Promise<ChartData>;
  deleteChart: (id: string) => Promise<void>;
}

export const useChartData = (): UseChartDataReturn => {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async (filters?: ChartFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredCharts = [...mockChartData];
      
      if (filters) {
        if (filters.type) {
          filteredCharts = filteredCharts.filter(chart => chart.type === filters.type);
        }
        
        if (filters.category) {
          filteredCharts = filteredCharts.filter(chart => 
            chart.title.toLowerCase().includes(filters.category!.toLowerCase())
          );
        }
        
        // Дополнительная фильтрация по дате и другим параметрам
        if (filters.dateRange) {
          // Здесь бы была логика фильтрации по дате
          console.log('Фильтрация по дате:', filters.dateRange);
        }
      }
      
      setCharts(filteredCharts);
    } catch (err) {
      setError('Ошибка при загрузке данных графиков');
      console.error('Ошибка при загрузке данных графиков:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getChartById = useCallback((id: string): ChartData | undefined => {
    return charts.find(chart => chart.id === id);
  }, [charts]);

  const updateChartConfig = useCallback((id: string, config: Partial<ChartConfig>) => {
    setCharts(prev => prev.map(chart => 
      chart.id === id 
        ? { ...chart, config: { ...chart.config, ...config } }
        : chart
    ));
  }, []);

  const exportChartData = useCallback(async (id: string, format: 'json' | 'csv' | 'excel'): Promise<Blob> => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const chart = charts.find(c => c.id === id);
      if (!chart) {
        throw new Error('График не найден');
      }
      
      let content = '';
      let mimeType = 'text/plain';
      
      switch (format) {
        case 'json':
          content = JSON.stringify(chart, null, 2);
          mimeType = 'application/json';
          break;
        case 'csv':
          content = 'Label,Value\n' + chart.data.map(d => `${d.label},${d.value}`).join('\n');
          mimeType = 'text/csv';
          break;
        case 'excel':
          content = 'Экспорт в Excel (здесь был бы Excel файл)';
          mimeType = 'application/vnd.ms-excel';
          break;
      }
      
      return new Blob([content], { type: mimeType });
    } catch (err) {
      setError('Ошибка при экспорте данных');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [charts]);

  const refreshChart = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Имитация обновления данных графика
      setCharts(prev => prev.map(chart => 
        chart.id === id 
          ? { 
              ...chart, 
              data: chart.data.map(d => ({ 
                ...d, 
                value: d.value + Math.random() * 1000 - 500 
              }))
            }
          : chart
      ));
    } catch (err) {
      setError('Ошибка при обновлении графика');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createChart = useCallback(async (chartData: Omit<ChartData, 'id'>): Promise<ChartData> => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newChart: ChartData = {
        id: Math.random().toString(36).substr(2, 9),
        ...chartData,
      };
      
      setCharts(prev => [...prev, newChart]);
      return newChart;
    } catch (err) {
      setError('Ошибка при создании графика');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChart = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCharts(prev => prev.filter(chart => chart.id !== id));
    } catch (err) {
      setError('Ошибка при удалении графика');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    charts,
    loading,
    error,
    fetchChartData,
    getChartById,
    updateChartConfig,
    exportChartData,
    refreshChart,
    createChart,
    deleteChart
  };
};
