import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Activity, Server, Database, Wifi, Users } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

interface SystemMetric {
  id: string;
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

interface SystemEvent {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source: string;
}

const MonitoringPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      id: '1',
      name: 'Загрузка CPU',
      value: '45%',
      status: 'healthy',
      icon: <Activity className="w-5 h-5" />,
      trend: 'stable',
      change: '+2%'
    },
    {
      id: '2',
      name: 'Использование памяти',
      value: '78%',
      status: 'warning',
      icon: <Server className="w-5 h-5" />,
      trend: 'up',
      change: '+12%'
    },
    {
      id: '3',
      name: 'Подключения к БД',
      value: '156',
      status: 'healthy',
      icon: <Database className="w-5 h-5" />,
      trend: 'stable',
      change: '0%'
    },
    {
      id: '4',
      name: 'Активные пользователи',
      value: '234',
      status: 'healthy',
      icon: <Users className="w-5 h-5" />,
      trend: 'up',
      change: '+8%'
    },
    {
      id: '5',
      name: 'Сетевой трафик',
      value: '2.3 GB/s',
      status: 'healthy',
      icon: <Wifi className="w-5 h-5" />,
      trend: 'down',
      change: '-5%'
    }
  ]);

  const [events, setEvents] = useState<SystemEvent[]>([
    {
      id: '1',
      type: 'info',
      message: 'Система успешно обновлена до версии 2.1.0',
      timestamp: '2024-01-16 14:30:00',
      source: 'System Update'
    },
    {
      id: '2',
      type: 'warning',
      message: 'Высокое использование памяти на сервере DB-01',
      timestamp: '2024-01-16 14:25:00',
      source: 'Database Monitor'
    },
    {
      id: '3',
      type: 'error',
      message: 'Ошибка подключения к внешнему API',
      timestamp: '2024-01-16 14:20:00',
      source: 'API Gateway'
    },
    {
      id: '4',
      type: 'info',
      message: 'Запущена процедура резервного копирования',
      timestamp: '2024-01-16 14:15:00',
      source: 'Backup Service'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  return (
    <>
      <PageMeta
        title="Мониторинг системы | Admin Dashboard"
        description="Мониторинг производительности и состояния системы"
      />
      
      <div className="p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Мониторинг системы
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Отслеживание производительности и состояния системы в реальном времени
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Система работает</span>
            </div>
          </div>
        </div>

        {/* Метрики системы */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  {metric.icon}
                </div>
                <span className="text-sm text-gray-500">
                  {getTrendIcon(metric.trend)} {metric.change}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.name}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Последние события */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Последние события
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {event.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {event.source}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {event.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Быстрые действия
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Перезапустить службы</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">Очистить кэш</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">Создать резервную копию</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Проверить подключения</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MonitoringPage; 