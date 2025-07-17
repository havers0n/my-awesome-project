import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { ForecastComparison as ForecastComparisonType } from '../../types/forecast';

interface ForecastComparisonProps {
  comparison: ForecastComparisonType;
  className?: string;
}

const ForecastComparison: React.FC<ForecastComparisonProps> = ({ 
  comparison, 
  className = '' 
}) => {
  const { current, previous, changes } = comparison;

  if (!previous) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-blue-800 font-medium">Первый прогноз</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Это ваш первый прогноз. Следующие прогнозы будут сравниваться с текущим.
        </p>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (changes.trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (changes.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendLabel = () => {
    switch (changes.trend) {
      case 'up':
        return 'Рост';
      case 'down':
        return 'Снижение';
      default:
        return 'Стабильно';
    }
  };

  // Вычисляем средние значения для сравнения
  const currentAvg = current.trend.points.reduce((sum, point) => sum + point.value, 0) / current.trend.points.length;
  const previousAvg = previous.trend.points.reduce((sum, point) => sum + point.value, 0) / previous.trend.points.length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Сравнение с предыдущим прогнозом</h3>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <span className={`font-medium ${getTrendColor()}`}>
            {getTrendLabel()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Текущий прогноз */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <ArrowUp className="w-4 h-4 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Текущий прогноз</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {currentAvg.toFixed(1)} шт.
          </div>
          <div className="text-sm text-green-700">
            Топ продуктов: {current.topProducts.length}
          </div>
        </div>

        {/* Предыдущий прогноз */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <ArrowDown className="w-4 h-4 text-gray-600 mr-2" />
            <span className="font-medium text-gray-800">Предыдущий прогноз</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {previousAvg.toFixed(1)} шт.
          </div>
          <div className="text-sm text-gray-700">
            Топ продуктов: {previous.topProducts.length}
          </div>
        </div>
      </div>

      {/* Детальная информация об изменениях */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Изменения:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Изменение среднего значения:</span>
            <span className={`font-medium ${getTrendColor()}`}>
              {changes.percentage > 0 ? '+' : ''}{changes.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Изменение топ продуктов:</span>
            <span className={`font-medium ${changes.topProductsChanged ? 'text-orange-600' : 'text-gray-600'}`}>
              {changes.topProductsChanged ? 'Да' : 'Нет'}
            </span>
          </div>
        </div>
      </div>

      {/* Рекомендации на основе сравнения */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Рекомендации:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          {changes.trend === 'up' && (
            <p>• Положительный тренд! Рассмотрите возможность увеличения запасов.</p>
          )}
          {changes.trend === 'down' && (
            <p>• Снижение прогноза. Проверьте факторы влияния и скорректируйте стратегию.</p>
          )}
          {changes.topProductsChanged && (
            <p>• Изменился состав топ продуктов. Проанализируйте причины изменений.</p>
          )}
          {Math.abs(changes.percentage) > 20 && (
            <p>• Значительное изменение прогноза (более 20%). Рекомендуется детальный анализ.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastComparison;
