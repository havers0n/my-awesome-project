import { useState, useCallback } from 'react';

export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'financial' | 'analytics';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  data: Record<string, any>;
  config: ReportConfig;
}

export interface ReportConfig {
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: Record<string, any>;
  format: 'table' | 'chart' | 'mixed';
  groupBy: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ReportFilters {
  type?: string;
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Мок данные для отчетов
const mockReports: Report[] = [
  {
    id: '1',
    title: 'Отчет по продажам за месяц',
    type: 'sales',
    status: 'published',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    data: {
      totalSales: 125000,
      ordersCount: 245,
      avgOrderValue: 510.2,
      topProducts: [
        { name: 'Товар 1', sales: 25000 },
        { name: 'Товар 2', sales: 20000 },
        { name: 'Товар 3', sales: 15000 }
      ]
    },
    config: {
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      },
      filters: { category: 'all' },
      format: 'mixed',
      groupBy: ['category'],
      sortBy: 'sales',
      sortOrder: 'desc'
    }
  },
  {
    id: '2',
    title: 'Отчет по складским остаткам',
    type: 'inventory',
    status: 'draft',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
    data: {
      totalItems: 1250,
      lowStockItems: 45,
      outOfStockItems: 12,
      totalValue: 850000
    },
    config: {
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      },
      filters: { warehouse: 'all' },
      format: 'table',
      groupBy: ['warehouse'],
      sortBy: 'quantity',
      sortOrder: 'asc'
    }
  }
];

interface UseReportsReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  fetchReports: (filters?: ReportFilters) => Promise<void>;
  createReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Report>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  generateReport: (config: ReportConfig) => Promise<Report>;
  exportReport: (id: string, format: 'pdf' | 'excel' | 'csv') => Promise<Blob>;
  scheduleReport: (id: string, schedule: string) => Promise<void>;
  getReportById: (id: string) => Report | undefined;
}

export const useReports = (): UseReportsReturn => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (filters?: ReportFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredReports = [...mockReports];
      
      if (filters) {
        if (filters.type) {
          filteredReports = filteredReports.filter(report => report.type === filters.type);
        }
        
        if (filters.status) {
          filteredReports = filteredReports.filter(report => report.status === filters.status);
        }
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredReports = filteredReports.filter(report => 
            report.title.toLowerCase().includes(searchTerm)
          );
        }
      }
      
      setReports(filteredReports);
    } catch (err) {
      setError('Ошибка при загрузке отчетов');
      console.error('Ошибка при загрузке отчетов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newReport: Report = {
        id: Math.random().toString(36).substr(2, 9),
        ...reportData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      setError('Ошибка при создании отчета');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReport = useCallback(async (id: string, updates: Partial<Report>): Promise<Report> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, ...updates, updatedAt: new Date().toISOString() } : report
      ));
      
      const updatedReport = reports.find(report => report.id === id);
      if (!updatedReport) {
        throw new Error('Отчет не найден');
      }
      
      return { ...updatedReport, ...updates };
    } catch (err) {
      setError('Ошибка при обновлении отчета');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reports]);

  const deleteReport = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      setError('Ошибка при удалении отчета');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (config: ReportConfig): Promise<Report> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация генерации отчета
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReport: Report = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Сгенерированный отчет',
        type: 'analytics',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          // Мок данные для сгенерированного отчета
          summary: 'Отчет успешно сгенерирован',
          metrics: {
            totalRecords: 1000,
            processedRecords: 950,
            errorCount: 50
          }
        },
        config
      };
      
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      setError('Ошибка при генерации отчета');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (id: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация экспорта
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const content = `Экспорт отчета ${id} в формате ${format}`;
      const blob = new Blob([content], { type: 'text/plain' });
      
      return blob;
    } catch (err) {
      setError('Ошибка при экспорте отчета');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleReport = useCallback(async (id: string, schedule: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация планирования
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`Отчет ${id} запланирован на: ${schedule}`);
    } catch (err) {
      setError('Ошибка при планировании отчета');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReportById = useCallback((id: string): Report | undefined => {
    return reports.find(report => report.id === id);
  }, [reports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    exportReport,
    scheduleReport,
    getReportById
  };
};
