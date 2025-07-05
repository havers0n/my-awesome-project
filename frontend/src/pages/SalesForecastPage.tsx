import React, { useEffect, useRef, useState } from 'react';
import { fetchForecastData, postForecast, fetchForecastHistory } from '../api/forecast';
import { TrendingUp, Calendar, Search, RefreshCw } from 'lucide-react';

// Dynamic Chart.js import for better code splitting
const loadChart = async () => {
  const { default: Chart } = await import('chart.js/auto');
  return Chart;
};
import {
  TopProduct,
  TrendPoint,
  ForecastHistoryItem,
  ForecastApiResponse
} from './types';
import QualityMetricsDashboard from '../components/QualityMetricsDashboard';

const accuracyColor = {
  'Высокая': 'bg-green-100 text-green-800',
  'Средняя': 'bg-yellow-100 text-yellow-800',
  'Низкая': 'bg-red-100 text-red-800',
};

const SalesForecastPage: React.FC = () => {
  // Стейт для переключения режимов
  const [mode, setMode] = useState<'trend' | 'metrics'>('trend');
  // ...existing code...
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [days, setDays] = useState<number>(14);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [history, setHistory] = useState<ForecastHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
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
            external: (context: { tooltip: any; chart: any }) => {
              if (!tooltipRef.current) return;
              const tooltip = tooltipRef.current;
              if (context.tooltip.opacity === 0) {
                tooltip.classList.add('hidden');
                return;
              }
              const dataIndex = context.tooltip.dataPoints[0].dataIndex;
              const value = context.tooltip.dataPoints[0].raw;
              tooltip.innerHTML = `
                <div class="font-bold">${value} шт</div>
                <div>${context.tooltip.dataPoints[0].label}</div>
              `;
              const chartRect = context.chart.canvas.getBoundingClientRect();
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
    // eslint-disable-next-line
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

  // Skeletons
  const Skeleton = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="skeleton h-8 w-48 mb-4 rounded" />
        <div className="skeleton h-64 w-full rounded" />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="skeleton h-8 w-48 mb-4 rounded" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-full rounded" />
          <div className="skeleton h-6 w-3/4 rounded" />
          <div className="skeleton h-6 w-5/6 rounded" />
          <div className="skeleton h-6 w-2/3 rounded" />
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
    else if (type === 'info') bg = 'bg-blue-600';
    return (
      <div className={`toast text-white px-4 py-2 rounded shadow-lg ${bg}`}>{message}</div>
    );
  };

  // Custom styles for skeleton, toast, etc.
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .chart-container { position: relative; height: 300px; width: 100%; }
      .progress-bar { transition: width 0.5s ease-in-out; }
      .toast { animation: slideIn 0.5s forwards, fadeOut 0.5s 2.5s forwards; }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
      @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      .tooltip { position: absolute; padding: 8px; background: rgba(0,0,0,0.8); color: white; border-radius: 4px; pointer-events: none; font-size: 12px; z-index: 100; transform: translate(-50%, -100%); }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Toast Notification */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
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
                ${mode === 'trend' ? 'bg-blue-600 text-white scale-105 shadow-lg' : 'bg-white text-gray-800 hover:bg-blue-50'}`}
              onClick={() => setMode('trend')}
              aria-pressed={mode === 'trend'}
            >
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span>Тренд продаж</span>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                ${mode === 'metrics' ? 'bg-blue-600 text-white scale-105 shadow-lg' : 'bg-white text-gray-800 hover:bg-blue-50'}`}
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
            {mode === 'trend' && (loading ? (
              <Skeleton />
            ) : (
              <div id="contentContainer">
                {/* Forecast Trend Section */}
                <section className="bg-white p-6 rounded-lg shadow mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Тренд продаж</h2>
                    <div className="flex space-x-2">
                      <select
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                        value={days}
                        onChange={handleDaysChange}
                      >
                        <option value={7}>7 дней</option>
                        <option value={14}>14 дней</option>
                        <option value={30}>30 дней</option>
                      </select>
                    </div>
                  </div>
                  <div className="chart-container">
                    <canvas ref={chartRef} />
                    <div ref={tooltipRef} className="tooltip hidden" />
                  </div>
                </section>
                {/* Top Products Section */}
                <section className="bg-white p-6 rounded-lg shadow mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Топ продуктов</h2>
                  <div className="space-y-4">
                    {topProducts.length === 0 ? (
                      <div className="text-gray-400">Нет данных</div>
                    ) : (
                      topProducts.map((item, idx) => (
                        <div className="top-product-item" key={item.name}>
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
            ))}
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
  );
};

export default SalesForecastPage;
