import React, { useEffect, useState } from 'react';
import { fetchForecastData, postForecast, fetchForecastHistory, startNewForecast } from '../api/forecast';
import { TrendingUp, Search, RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import {
  TopProduct,
  TrendPoint,
  ForecastHistoryItem
} from './types';
import QualityMetricsDashboard from '../components/QualityMetricsDashboard';
import { useWebSocket } from '../hooks/useWebSocket';
import Tooltip, { TooltipIcon } from '../components/common/Tooltip';
import { useWelcomeModal } from '../components/common/WelcomeModal';
import TopProductsList from '../components/organisms/TopProductsList';
import { ForecastHistoryTable } from '../components/organisms/ForecastHistoryTable';
import ForecastTrendChart from '../components/organisms/ForecastTrendChart';
import { ForecastCreationPanel } from '../components/organisms/ForecastCreationPanel';

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
  const [predictionLoading, setPredictionLoading] = useState(false); // For new prediction loading
  const { toast } = useToast();
  const { status, isConnected, error: wsError, reconnect } = useWebSocket('wss://your.websocket.url');

  // Загрузка тренда и топ-продуктов
  useEffect(() => {
    setLoading(true);
    fetchForecastData(days)
      .then((data) => {
        setTrendData(data.trend.points);
        setTopProducts(data.topProducts);
      })
      .catch(() => toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось загрузить прогноз' }))
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
      .catch(() => toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось загрузить историю' }))
      .finally(() => setLoadingHistory(false));
  }, [page, limit, search, category]);

  // Handlers
  const handleDaysChange = (newDays: number) => {
    setDays(newDays);
    setPage(1); // Reset pagination on period change
    toast({ title: 'Информация', description: `Период изменён на ${newDays} дней` });
  };

  const handleFetchForecast = async () => {
    setLoading(true);
    try {
      const data = await postForecast();
      setTrendData(data.trend.points);
      setTopProducts(data.topProducts);
      toast({ variant: 'success', title: 'Успех', description: 'Прогноз успешно обновлён' });
      // Обновить историю после прогноза
      fetchForecastHistory(page, limit, search, category).then((data) => {
        setHistory(data.items);
        setHistoryTotal(data.total);
      });
    } catch {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Ошибка прогноза' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewForecast = async (predictionDays: number) => {
    setPredictionLoading(true);
    try {
      // Step 1: Initiate the forecast prediction process
      await startNewForecast(predictionDays);
      toast({ variant: 'success', title: 'Успех', description: 'Прогноз запущен успешно' });
      
      // Step 2: Fetch the updated forecast data for the dashboard
      const data = await postForecast();
      setTrendData(data.trend.points);
      setTopProducts(data.topProducts);
      toast({ variant: 'success', title: 'Успех', description: `Новый прогноз на ${predictionDays} дней создан успешно` });
      
      // Step 3: Refresh history to show the new prediction
      fetchForecastHistory(page, limit, search, category).then((data) => {
        setHistory(data.items);
        setHistoryTotal(data.total);
      });
    } catch (error) {
      console.error('Failed to start new forecast:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Ошибка при создании нового прогноза' });
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
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

  // Enhanced custom styles for skeleton, toast, and animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
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
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading && trendData.length === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Skeleton />
      </div>
    );
  }

  return (
    <>
      <WelcomeModal
        isOpen={welcomeModalOpen}
        onClose={closeWelcomeModal}
        onStartForecast={() => {
          closeWelcomeModal();
          // This could now trigger a default forecast, e.g., for 7 days
          handleStartNewForecast(7); 
        }}
        isLoading={predictionLoading}
      />
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen animate-fadeIn">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Прогноз продаж</h1>
            <div className="flex items-center space-x-2">
            <Tooltip content={
              <div>
                <p>WebSocket Status: <span className={
                  isConnected ? "text-green-500" : "text-red-500"
                }>{status}</span></p>
                {wsError && <p>Error: {wsError}</p>}
                {!isConnected && 
                  <button onClick={reconnect} className="text-blue-500 hover:underline">
                    Reconnect
                  </button>
                }
              </div>
            }>
              <TooltipIcon isConnected={isConnected} />
            </Tooltip>
            </div>
          </div>
          <p className="text-gray-500 mt-1">Анализ и прогнозирование будущих объемов продаж.</p>
        </header>
        
        {/* Mode switcher */}
        <div className="mb-6 flex justify-center bg-gray-200 rounded-lg p-1">
          <button 
            onClick={() => setMode('trend')}
            className={`px-4 py-2 text-sm font-medium rounded-md w-1/2 transition-colors ${mode === 'trend' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:bg-gray-300'}`}
          >
            Прогноз и история
          </button>
          <button 
            onClick={() => setMode('metrics')}
            className={`px-4 py-2 text-sm font-medium rounded-md w-1/2 transition-colors ${mode === 'metrics' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:bg-gray-300'}`}
          >
            Качество данных
          </button>
        </div>

        {mode === 'trend' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              <ForecastCreationPanel
                isLoading={predictionLoading}
                onStartForecast={handleStartNewForecast}
              />

              <ForecastTrendChart
                trendData={trendData}
                isLoading={loading}
                initialDays={days}
                onDaysChange={handleDaysChange}
                onRefresh={handleFetchForecast}
              />

              <ForecastHistoryTable
                history={history}
                total={historyTotal}
                page={page}
                limit={limit}
                loading={loadingHistory}
                onPageChange={setPage}
                onSearchChange={handleSearchChange}
                onCategoryChange={handleCategoryChange}
              />

            </div>
            <div className="lg:col-span-1">
              <TopProductsList products={topProducts} isLoading={loading} />
            </div>
          </div>
        ) : (
          <QualityMetricsDashboard />
        )}
      </div>
    </>
  );
};

export default SalesForecastPage;
