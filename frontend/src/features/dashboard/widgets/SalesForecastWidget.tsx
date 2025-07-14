import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Target, AlertTriangle, Clock } from 'lucide-react';

interface ForecastData {
  period: string;
  predicted: number;
  actual?: number;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
}

interface ForecastSummary {
  totalForecast: number;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
  topProducts: Array<{
    name: string;
    forecast: number;
    change: number;
  }>;
  weeklyData: ForecastData[];
}

const SalesForecastWidget: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Генерация моковых данных для демонстрации
  const generateForecastData = (): ForecastSummary => {
    return {
      totalForecast: 145230,
      accuracy: 87.5,
      trend: 'up',
      topProducts: [
        { name: 'Молоко 3.2%', forecast: 1250, change: 12.5 },
        { name: 'Хлеб белый', forecast: 890, change: -3.2 },
        { name: 'Яйца С1', forecast: 670, change: 8.7 },
        { name: 'Масло сливочное', forecast: 445, change: 15.3 },
      ],
      weeklyData: [
        { period: 'Пн', predicted: 18500, actual: 17800, accuracy: 96.2, trend: 'up' },
        { period: 'Вт', predicted: 21200, actual: 20950, accuracy: 98.8, trend: 'up' },
        { period: 'Ср', predicted: 19800, actual: 19200, accuracy: 97.0, trend: 'stable' },
        { period: 'Чт', predicted: 22100, actual: 21800, accuracy: 98.6, trend: 'up' },
        { period: 'Пт', predicted: 25400, actual: 24900, accuracy: 98.0, trend: 'up' },
        { period: 'Сб', predicted: 28200, accuracy: 0, trend: 'up' },
        { period: 'Вс', predicted: 24100, accuracy: 0, trend: 'stable' },
      ]
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setForecast(generateForecastData());
      setLoading(false);
    };

    loadData();
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      case 'stable':
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Не удалось загрузить прогноз</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-amber-600" />
          Прогноз продаж
        </h3>
        <span className="text-xs text-gray-500 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          На 7 дней
        </span>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600">Прогноз</p>
              <p className="text-lg font-bold text-blue-700">{formatNumber(forecast.totalForecast)}</p>
            </div>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600">Точность</p>
              <p className="text-lg font-bold text-green-700">{forecast.accuracy}%</p>
            </div>
            <div className="text-green-600">
              {getTrendIcon(forecast.trend)}
            </div>
          </div>
        </div>
      </div>

      {/* Топ товары */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Топ товары:
        </h4>
        <div className="space-y-2">
          {forecast.topProducts.slice(0, 3).map((product, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-500 mr-2">#{index + 1}</span>
                <span className="text-sm truncate">{product.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatNumber(product.forecast)}</p>
                <p className={`text-xs ${product.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.change >= 0 ? '+' : ''}{product.change.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Мини-график недели */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Прогноз на неделю:
        </h4>
        <div className="flex justify-between items-end space-x-1 h-16">
          {forecast.weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full rounded-t ${
                  day.actual ? 'bg-green-500' : 'bg-blue-400'
                }`}
                style={{ 
                  height: `${Math.max(10, (day.predicted / Math.max(...forecast.weeklyData.map(d => d.predicted))) * 100)}%` 
                }}
              ></div>
              <span className="text-xs text-gray-500 mt-1">{day.period}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesForecastWidget; 