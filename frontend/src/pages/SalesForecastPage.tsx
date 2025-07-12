import React, { useEffect, useRef, useState } from 'react';
import { fetchForecastData, postForecast, fetchForecastHistory, startNewForecast } from '../api/forecast';
import { TrendingUp, Search, RefreshCw } from 'lucide-react';

// Dynamic Chart.js import for better code splitting
const loadChart = async () => {
  const { default: Chart } = await import('chart.js/auto');
  return Chart;
};
import {
  TopProduct,
  TrendPoint,
  ForecastHistoryItem
} from './types';
import QualityMetricsDashboard from '../components/QualityMetricsDashboard';
import { useWebSocket } from '../hooks/useWebSocket';
import Tooltip, { TooltipIcon } from '../components/common/Tooltip';
import { useWelcomeModal } from '../components/common/WelcomeModal';

const accuracyColor = {
  'Высокая': 'bg-green-100 text-green-800',
  'Средняя': 'bg-yellow-100 text-yellow-800',
  'Низкая': 'bg-red-100 text-red-800',
};

const SalesForecastPage: React.FC = () => {
  // --- Welcome Modal Logic ---
  const { WelcomeModal, welcomeModalOpen, closeWelcomeModal } = useWelcomeModal();
  // Стейт для переключения режимов
  const [mode, setMode] = useState<'trend' | 'metrics'>('trend');
  // ...existing code...
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [days, setDays] = useState<number>(14);
  const [predictionDays, setPredictionDays] = useState<number>(7); // For new prediction input
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [history, setHistory] = useState<ForecastHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false); // For new prediction loading
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const { status, isConnected, error: wsError, reconnect } = useWebSocket('wss://your.websocket.url');
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Загрузка тренда и топ-продуктов
  useEffect(() => {
    setLoading(true);
    fetchForecastData(days)
      .then((data) => {
        setTrendData(data.trend.points);
        setTopProducts(data.topProducts);
        setTrendLabels(data.trend.points.map((p) => p.date));
      })
      .catch(() => setToast({ message: 'Не удалось загрузить прогноз', type: 'error' }))
      .finally(() => setLoading(false));
  }, [days]);

  // Загрузка истории
  useEffect(() => {
    setLoadingHistory(true);
    fetchForecastHistory(page, limit, search, category)
      .then((data) => {
        setHistory(data.items);
        setHistoryTotal(data.total);
      })
      .catch(() => setToast({ message: 'Не удалось загрузить историю', type: 'error' }))
      .finally(() => setLoadingHistory(false));
  }, [page, limit, search, category]);

  // Chart.js init/update with dynamic loading
  useEffect(() => {
    if (!chartRef.current) return;
    
    const initChart = async () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const Chart = await loadChart();
      chartInstance.current = new Chart(chartRef.current!, {
      type: 'line',
      data: {
        labels: trendLabels,
        datasets: [
          {
            label: 'Прогноз продаж',
            data: trendData.map((p) => p.value),
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(79, 70, 229, 1)',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: (context: { tooltip: { opacity: number; dataPoints: { raw: number; label: string; element: { x: number; y: number } }[] }; chart: { canvas: HTMLCanvasElement } }) => {
              if (!tooltipRef.current) return;
              const tooltip = tooltipRef.current;
              if (context.tooltip.opacity === 0) {
                tooltip.classList.add('hidden');
                return;
              }
              const value = context.tooltip.dataPoints[0].raw;
              tooltip.innerHTML = `
                <div class="font-bold">${value} шт</div>
                <div>${context.tooltip.dataPoints[0].label}</div>
              `;
              const pointX = context.tooltip.dataPoints[0].element.x;
              const pointY = context.tooltip.dataPoints[0].element.y;
              tooltip.style.left = pointX + 'px';
              tooltip.style.top = pointY + 'px';
              tooltip.classList.remove('hidden');
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              callback: (value: number) => value + ' шт',
            },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
    };
    
    initChart();
  }, [trendLabels, trendData]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handlers
  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDays(parseInt(e.target.value));
    setPage(1);
    setToast({ message: `Период изменён на ${e.target.value} дней`, type: 'info' });
  };

  const handleFetchForecast = async () => {
    setLoading(true);
    try {
      const data = await postForecast();
      setTrendData(data.trend.points);
      setTopProducts(data.topProducts);
      setTrendLabels(data.trend.points.map((p) => p.date));
      setToast({ message: 'Прогноз успешно обновлён', type: 'success' });
      // Обновить историю после прогноза
      fetchForecastHistory(page, limit, search, category).then((data) => {
        setHistory(data.items);
        setHistoryTotal(data.total);
      });
    } catch {
      setToast({ message: 'Ошибка прогноза', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewForecast = async () => {
    setPredictionLoading(true);
    try {
      // Step 1: Initiate the forecast prediction process
      await startNewForecast(predictionDays);
      setToast({ message: 'Прогноз запущен успешно', type: 'success' });
      
      // Step 2: Fetch the updated forecast data for the dashboard
      const data = await postForecast();
      setTrendData(data.trend.points);
      setTopProducts(data.topProducts);
      setTrendLabels(data.trend.points.map((p) => p.date));
      setToast({ message: `Новый прогноз на ${predictionDays} дней создан успешно`, type: 'success' });
      
      // Step 3: Refresh history to show the new prediction
      fetchForecastHistory(page, limit, search, category).then((data) => {
        setHistory(data.items);
        setHistoryTotal(data.total);
      });
    } catch (error) {
      console.error('Failed to start new forecast:', error);
      setToast({ message: 'Ошибка при создании нового прогноза', type: 'error' });
    } finally {
      setPredictionLoading(false);
    }
  };

  // Enhanced Skeleton Loader
  const Skeleton = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="skeleton h-8 w-48 mb-4 rounded" />
        <div className="skeleton h-64 w-full rounded" />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="skeleton h-8 w-48 mb-4 rounded" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-full rounded" style={{ animationDelay: '0.1s' }} />
          <div className="skeleton h-6 w-3/4 rounded" style={{ animationDelay: '0.2s' }} />
          <div className="skeleton h-6 w-5/6 rounded" style={{ animationDelay: '0.3s' }} />
          <div className="skeleton h-6 w-2/3 rounded" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <div className="skeleton h-8 w-48 mb-4 rounded" />
        <div className="skeleton h-64 w-full rounded" />
      </div>
    </div>
  );

  // Toast
  const Toast = ({ message, type }: { message: string; type: string }) => {
    let bg = 'bg-indigo-600';
    if (type === 'success') bg = 'bg-green-600';
    else if (type === 'error') bg = 'bg-red-600';
    else if (type === 'info') bg = 'bg-amber-600';
    return (
      <div className={`toast text-white px-4 py-2 rounded shadow-lg ${bg}`}>{message}</div>
    );
  };

  // Enhanced custom styles for skeleton, toast, and animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .chart-container { position: relative; height: 300px; width: 100%; }
      .progress-bar { transition: width 0.5s ease-in-out; }
      
      /* Toast animations */
      .toast { 
        animation: slideIn 0.5s forwards, fadeOut 0.5s 2.5s forwards; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      /* Enhanced skeleton loader */
      .skeleton { 
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); 
        background-size: 200% 100%; 
        animation: shimmer 1.5s infinite; 
      }
      
      /* Smooth fade-in animations */
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out forwards;
      }
      
      .animate-slideUp {
        animation: slideUp 0.4s ease-out forwards;
      }
      
      .animate-scaleIn {
        animation: scaleIn 0.3s ease-out forwards;
      }
      
      /* Staggered animations */
      .stagger-1 { animation-delay: 0.1s; }
      .stagger-2 { animation-delay: 0.2s; }
      .stagger-3 { animation-delay: 0.3s; }
      .stagger-4 { animation-delay: 0.4s; }
      
      /* Keyframe definitions */
      @keyframes slideIn { 
        from { transform: translateX(100%); opacity: 0; } 
        to { transform: translateX(0); opacity: 1; } 
      }
      
      @keyframes fadeOut { 
        from { opacity: 1; } 
        to { opacity: 0; } 
      }
      
      @keyframes shimmer { 
        0% { background-position: 200% 0; } 
        100% { background-position: -200% 0; } 
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      
      /* Tooltip styling */
      .tooltip { 
        position: absolute; 
        padding: 8px; 
        background: rgba(0,0,0,0.8); 
        color: white; 
        border-radius: 4px; 
        pointer-events: none; 
        font-size: 12px; 
        z-index: 100; 
        transform: translate(-50%, -100%);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      /* Hover effects */
      .hover-lift:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
      }
      
      /* Button pulse animation */
      .pulse-on-hover:hover {
        animation: pulse 0.6s ease-in-out;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <>
      <WelcomeModal open={welcomeModalOpen} onClose={closeWelcomeModal} />
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Toast Notification */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
        {/* WebSocket статус */}
        {wsError !== null && <div className="toast bg-red-600 text-white px-4 py-2 rounded shadow-lg">
          Ошибка WebSocket соединения: {wsError}, пытаемся переподключиться
        </div>}
        {!isConnected && !wsError && <div className="toast bg-orange-600 text-white px-4 py-2 rounded shadow-lg">
          Ожидаем подключения...
        </div>}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
      {/* Header + Sticky Mode Switcher */}
      <header className="bg-white shadow-sm sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Прогноз продаж</h1>
            <p className="text-gray-600">Прогнозирование продаж вашей выпечки</p>
          </div>
          {/* Переключатель режимов с иконками, выпуклостью, анимацией */}
          <div className="flex gap-2 mt-4 md:mt-0 bg-gray-100 rounded-full p-1 shadow-inner sticky-switcher">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                ${mode === 'trend' ? 'bg-amber-600 text-white scale-105 shadow-lg' : 'bg-white text-gray-800 hover:bg-amber-50'}`}
              onClick={() => setMode('trend')}
              aria-pressed={mode === 'trend'}
            >
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span>Тренд продаж</span>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                ${mode === 'metrics' ? 'bg-amber-600 text-white scale-105 shadow-lg' : 'bg-white text-gray-800 hover:bg-amber-50'}`}
              onClick={() => setMode('metrics')}
              aria-pressed={mode === 'metrics'}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Метрики качества</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Анимация fade/slide между режимами */}
        <div className="relative min-h-[400px]">
          <div
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${mode === 'trend' ? 'opacity-100 translate-x-0 z-10 pointer-events-auto' : 'opacity-0 -translate-x-8 z-0 pointer-events-none'}`}
            style={{ willChange: 'opacity, transform' }}
          >
            {loading ? (
              <Skeleton />
            ) : (
              <div id="contentContainer">
                {/* New Prediction Section */}
                <section className="bg-white p-6 rounded-lg shadow mb-6 hover-lift animate-slideUp border-l-4 border-l-green-500">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Создать новый прогноз</h2>
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700">Дней для прогноза:</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={predictionDays}
                        onChange={(e) => setPredictionDays(parseInt(e.target.value) || 7)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm w-20 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        onClick={handleStartNewForecast}
                        disabled={predictionLoading}
                        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 pulse-on-hover transition-all duration-200 font-medium"
                        title="Создать новый прогноз (займет 5-10 сек)"
                        aria-label="Создать новый прогноз (займет 5-10 сек)"
                      >
                        <span role="img" aria-label="Прогноз">📊</span>
                        <TrendingUp className={`w-4 h-4 ${predictionLoading ? 'animate-spin' : ''}`} />
                        <span>{predictionLoading ? 'Создаю прогноз...' : 'Предсказать'}</span>
                      </button>
                    </div>
                  </div>
                  {predictionLoading && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-2 text-amber-700">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Обрабатываю данные и создаю прогноз...</span>
                      </div>
                    </div>
                  )}
                </section>
                
                {/* Forecast Trend Section */}
                <section className="bg-white p-6 rounded-lg shadow mb-6 hover-lift animate-slideUp">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Тренд продаж</h2>
                    <div className="flex space-x-2">
                      <select
                        className="border border-gray-300 rounded px-3 py-1 text-sm hover:border-blue-400 transition-colors"
                        value={days}
                        onChange={handleDaysChange}
                      >
                        <option value={7}>7 дней</option>
                        <option value={14}>14 дней</option>
                        <option value={30}>30 дней</option>
                      </select>
                      <button
                        onClick={handleFetchForecast}
                        disabled={loading}
                        className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 pulse-on-hover transition-all duration-200"
                        title="Обновить график с текущими данными"
                        aria-label="Обновить график с текущими данными"
                      >
                        <span role="img" aria-label="Обновить">🔄</span>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Запросить прогноз продаж</span>
                      </button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <canvas ref={chartRef} />
                    <div ref={tooltipRef} className="tooltip hidden" />
                  </div>
                </section>
                {/* Top Products Section */}
                <section className="bg-white p-6 rounded-lg shadow mb-6 hover-lift animate-slideUp stagger-1">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Топ продуктов</h2>
                  <div className="space-y-4">
                    {topProducts.length === 0 ? (
                      <div className="text-gray-400">Нет данных</div>
                    ) : (
                      topProducts.map((item, idx) => (
                        <div className={`top-product-item animate-fadeIn hover:bg-gray-50 p-2 rounded transition-all duration-200 stagger-${idx + 1}`} key={item.name}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-semibold text-indigo-600">{item.amount} шт</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full progress-bar ${item.colorClass}`}
                              style={{ width: item.barWidth }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
                {/* Forecast History Section */}
                <section className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">История прогнозов</h2>
                    <TooltipIcon data={{
                      title: 'История прогнозов',
                      description: 'Здесь вы можете увидеть предыдущие прогнозы продаж и сравнить их точность.',
                      examples: ['Прогноз на 2025-07-01: 45 шт.', 'Прогноз на 2025-07-02: 50 шт.'],
                      links: [
                        { text: 'Узнать больше о прогнозах', url: 'https://example.com/forecast-info' },
                      ],
                    }} />
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Поиск..."
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                      />
                      <select
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                        value={category}
                        onChange={e => { setCategory(e.target.value); setPage(1); }}
                      >
                        <option value="">Все категории</option>
                        <option value="Хлеб">Хлеб</option>
                        <option value="Выпечка">Выпечка</option>
                        <option value="Десерты">Десерты</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {loadingHistory ? (
                      <div className="skeleton h-64 w-full rounded" />
                    ) : history.length === 0 ? (
                      <div className="text-gray-400 p-8 text-center">Нет данных</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Прогноз (шт.)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Точность</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {history.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.forecast}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${accuracyColor[item.accuracy]}`}>{item.accuracy}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Показано <span>{history.length}</span> из <span>{historyTotal}</span> записей
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loadingHistory}
                      >Назад</button>
                      <span className="px-2 py-1 text-sm text-gray-600">{page}</span>
                      <button
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page * limit >= historyTotal || loadingHistory}
                      >Вперед</button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
          <div
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${mode === 'metrics' ? 'opacity-100 translate-x-0 z-10 pointer-events-auto' : 'opacity-0 translate-x-8 z-0 pointer-events-none'}`}
            style={{ willChange: 'opacity, transform' }}
          >
            {mode === 'metrics' && <QualityMetricsDashboard />}
          </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SalesForecastPage;
