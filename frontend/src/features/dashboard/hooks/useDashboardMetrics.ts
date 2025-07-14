import { useState, useCallback } from "react";
import { MetricData } from "@/shared/ui/organisms/MetricsGrid";

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (period: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data
      const mockMetrics: MetricData[] = [
        {
          id: 'revenue',
          title: 'Revenue',
          value: '$12,345',
          change: 12.5,
          changeType: 'increase',
          iconName: 'dollar',
          badge: {
            text: '+12.5%',
            variant: 'solid',
            color: 'success'
          }
        },
        {
          id: 'orders',
          title: 'Orders',
          value: '1,234',
          change: -5.2,
          changeType: 'decrease',
          iconName: 'shopping-cart',
          badge: {
            text: '-5.2%',
            variant: 'solid',
            color: 'error'
          }
        },
        {
          id: 'customers',
          title: 'Customers',
          value: '567',
          change: 8.1,
          changeType: 'increase',
          iconName: 'users',
          badge: {
            text: '+8.1%',
            variant: 'solid',
            color: 'success'
          }
        },
        {
          id: 'conversion',
          title: 'Conversion Rate',
          value: '3.4%',
          change: 2.3,
          changeType: 'increase',
          iconName: 'trending-up',
          badge: {
            text: '+2.3%',
            variant: 'solid',
            color: 'success'
          }
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics(mockMetrics);
    } catch (err) {
      setError('Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMetrics = useCallback((period: string) => {
    fetchMetrics(period);
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    refreshMetrics
  };
};
