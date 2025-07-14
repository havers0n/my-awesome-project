import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ProcessingStatus, QualityMetrics } from '../../types/forecast';

interface ForecastResultsProps {
  loading: boolean;
  error: string | null;
  data: unknown;
  onRefresh?: () => void;
  status?: ProcessingStatus;
}

// Компонент для отображения метрик качества
const QualityMetricsDisplay = ({ metrics }: { metrics: QualityMetrics }) => {
  if (!metrics) {
    return null;
  }
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-700 mb-2">Метрики качества</h4>
      <div className="text-sm text-gray-600">
        <div>MAPE: {metrics.mape !== undefined ? metrics.mape.toFixed(2) : 'N/A'}%</div>
        <div>MAE: {metrics.mae !== undefined ? metrics.mae.toFixed(2) : 'N/A'}</div>
        <div>Уровень достоверности: {metrics.confidence !== undefined ? metrics.confidence : 'N/A'}%</div>
        {metrics.rmse !== undefined && (
          <div>RMSE: {metrics.rmse.toFixed(2)}</div>
        )}
        {metrics.r2 !== undefined && (
          <div>R²: {metrics.r2.toFixed(3)}</div>
        )}
        {metrics.dataQuality && (
          <div>Качество данных: {metrics.dataQuality}</div>
        )}
        {metrics.recommendations && metrics.recommendations.length > 0 && (
          <div className="mt-2">
            <h5 className="text-gray-700">Рекомендации:</h5>
            <ul className="list-disc list-inside">
              {metrics.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loader компонент
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-32 bg-gray-200 rounded mt-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// Анимированные иконки состояния
const AnimatedIcon = ({ type }: { type: 'success' | 'error' | 'warning' }) => {
  const iconConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      animation: 'animate-bounce'
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      animation: 'animate-pulse'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      animation: 'animate-pulse'
    }
  };

  const { icon: Icon, color, animation } = iconConfig[type];
  
  return (
    <div className={`${animation} inline-flex items-center`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
  );
};

// Компонент для отображения результатов с анимацией
const ResultsContent = ({ data, isVisible }: { data: unknown; isVisible: boolean }) => {
  return (
    <div className={`transform transition-all duration-700 ease-in-out ${
      isVisible 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-4 opacity-0 scale-95'
    }`}>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Результаты прогноза</h3>
          <AnimatedIcon type="success" />
        </div>
        
        {data && typeof data === 'object' && data !== null && (
          <div className="space-y-4">
            {/* Отображение данных тренда */}
            {(data as { trend?: { points?: unknown[] } }).trend && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Прогноз тренда</h4>
                <div className="text-sm text-gray-600">
                  Точек данных: {(data as { trend?: { points?: unknown[] } }).trend?.points?.length || 0}
                </div>
              </div>
            )}
            
            {/* Отображение топ продуктов */}
            {(data as { topProducts?: { name: string; amount: number }[] }).topProducts && 
             (data as { topProducts?: { name: string; amount: number }[] }).topProducts!.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Топ продукты</h4>
                <div className="space-y-2">
                  {(data as { topProducts: { name: string; amount: number }[] }).topProducts.map((product, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{product.name}</span>
                      <span className="text-sm font-medium text-gray-800">{product.amount} шт</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Добавляем QualityMetricsDisplay в визуализацию */}
        {data && typeof data === 'object' && data !== null && (data as { qualityMetrics?: QualityMetrics }).qualityMetrics && (
          <QualityMetricsDisplay metrics={(data as { qualityMetrics: QualityMetrics }).qualityMetrics} />
        )}
      </div>
    </div>
  );
};

// Компонент для отображения ошибки
const ErrorContent = ({ error }: { error: string }) => {
  return (
    <div className="transform transition-all duration-500 ease-in-out animate-fadeIn">
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <AnimatedIcon type="error" />
          <h3 className="text-lg font-semibold text-red-800 ml-2">Ошибка загрузки</h3>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    </div>
  );
};

const ForecastResults: React.FC<ForecastResultsProps> = ({ 
  loading, 
  error, 
  data, 
  onRefresh, 
  status = {
    stage: 'idle',
    message: 'Готов к работе',
    progress: 0,
    timestamp: Date.now()
  },
}) => {
  const [showResults, setShowResults] = useState(false);

  // Анимация появления результатов
  useEffect(() => {
    if (!loading && !error && data) {
      const timer = setTimeout(() => {
        setShowResults(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [loading, error, data]);

  // Добавляем CSS для анимаций
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideIn {
        from { transform: translateX(-20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
      }
      
      .animate-slideIn {
        animation: slideIn 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-800">{status.message}</h3>
          </div>
          <SkeletonLoader />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Этап: {status.stage} ({status.progress}%)</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorContent error={error} />;
  }

  return (
    <div className="space-y-6">
      <ResultsContent data={data} isVisible={showResults} />
      
      {onRefresh && (
        <div className="flex justify-center">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 transform hover:scale-105"
            title="Обновить график с текущими данными"
            aria-label="Обновить график с текущими данными"
          >
            <span role="img" aria-label="Обновить">🔄</span> Обновить прогноз
          </button>
        </div>
      )}
    </div>
  );
};

export default ForecastResults;
