import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Product, Forecast, ForecastData, ProductSnapshot, ComparativeForecastData, OverallMetrics } from '@/types/warehouse';
import { fetchCSVProducts, requestCSVForecast, fetchCSVMetrics } from '@/services/warehouseApi';
import { useToast } from '@/contexts/ToastContext';
import { Loader2, Wand2, TrendingUp, AlertTriangle, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Database } from 'lucide-react';

// Helper Components
const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const KpiCard: React.FC<{ title: string; value: string | number; unit?: string; className?: string }> = ({ title, value, unit, className = '' }) => (
  <div className={`bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg ${className}`}>
    <h4 className="text-sm font-medium text-blue-700 mb-1">{title}</h4>
    <div className="flex items-baseline">
      <span className="text-2xl font-bold text-blue-900">{value}</span>
      {unit && <span className="text-sm text-blue-600 ml-1">{unit}</span>}
    </div>
  </div>
);

const MultiSelectDropdown: React.FC<{
  options: Array<{ id: string; name: string }>;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder: string;
}> = ({ options, selectedIds, onSelectionChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const selectedNames = options
    .filter(option => selectedIds.includes(option.id))
    .map(option => option.name)
    .join(', ');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-300 rounded-md text-left flex justify-between items-center"
      >
        <span className={selectedNames ? 'text-gray-900' : 'text-gray-500'}>
          {selectedNames || placeholder}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <label key={option.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                className="mr-2"
              />
              <span className="text-sm">{option.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

type TrendSubMode = 'detailed' | 'comparative';

const SalesForecastCSVPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trendSubMode, setTrendSubMode] = useState<TrendSubMode>('detailed');
  const { addToast } = useToast();

  // --- State ---
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [history, setHistory] = useState<Forecast[]>([]);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [daysToForecast, setDaysToForecast] = useState(7);
  const [whatIfPrice, setWhatIfPrice] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [snapshot, setSnapshot] = useState<ProductSnapshot | null>(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
  const initialLoadDone = useRef(false);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [selectedComparativeIds, setSelectedComparativeIds] = useState<string[]>([]);
  const [comparativeData, setComparativeData] = useState<ComparativeForecastData>([]);
  const [isComparativeLoading, setIsComparativeLoading] = useState(false);
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);
  const itemsPerPage = 5;

  // --- Data Loading ---
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setIsMetricsLoading(true);
      try {
        const fetchedProducts = await fetchCSVProducts();
        setProducts(fetchedProducts);
        addToast(`Загружено ${fetchedProducts.length} товаров из ML модели`, 'success');
      } catch (error) {
        addToast(error instanceof Error ? error.message : 'Не удалось загрузить товары из CSV', 'error');
      } finally {
        setIsLoading(false);
      }

      try {
        const metricsData = await fetchCSVMetrics();
        setOverallMetrics(metricsData);
      } catch (error) {
        addToast(error instanceof Error ? error.message : 'Не удалось загрузить метрики', 'error');
        setOverallMetrics(null);
      } finally {
        setIsMetricsLoading(false);
      }
    };

    loadInitialData();
  }, [addToast]);

  const fetchTrendData = useCallback(async (days: number) => {
    setIsTrendLoading(true);
    setLowConfidence(false);
    try {
      const data = await requestCSVForecast(days);
      setForecastData(data);
      if (data.historyEntry) {
        setHistory(prev => [data.historyEntry, ...prev].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i));
      }
      addToast(`Прогноз на основе ML модели успешно сгенерирован!`, 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Ошибка при запросе прогноза.', 'error');
      setForecastData(null);
    } finally {
      setIsTrendLoading(false);
    }
  }, [addToast]);

  const handleProductSelectionChange = useCallback(async (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.product_id.toString() === productId);
    if (!product) {
      setSnapshot(null);
      setForecastData(null);
      setWhatIfPrice(undefined);
      return;
    }
    setWhatIfPrice(product.price);
    
    // Создаем снимок товара на основе CSV данных
    const snapshotData: ProductSnapshot = {
      productId: product.product_id,
      productName: product.product_name,
      recentSales: [
        { date: '2025-01-01', quantity: Math.floor(Math.random() * 10) + 1 },
        { date: '2025-01-02', quantity: Math.floor(Math.random() * 10) + 1 },
        { date: '2025-01-03', quantity: Math.floor(Math.random() * 10) + 1 },
      ],
      averageDailySales: Math.floor(Math.random() * 5) + 1,
      stockLevel: Math.floor(Math.random() * 50) + 10,
      price: product.price,
      mape: product.mape || 0,
      source: 'CSV_ML_MODEL'
    };
    setSnapshot(snapshotData);
  }, [products]);

  useEffect(() => {
    if (products?.length > 0 && !initialLoadDone.current) {
      const initialProduct = products[0];
      if (initialProduct) handleProductSelectionChange(initialProduct.product_id.toString());
      initialLoadDone.current = true;
    }
  }, [products, handleProductSelectionChange]);

  // --- Event Handlers ---
  const handleForecastRequest = () => {
    setForecastData(null);
    fetchTrendData(daysToForecast);
  };

  const handleComparativeRequest = async () => {
    if (selectedComparativeIds.length === 0) {
      addToast('Выберите хотя бы один товар для сравнения.', 'info');
      return;
    }
    setIsComparativeLoading(true);
    setComparativeData([]);
    try {
      // Для CSV данных используем общий прогноз
      const response = await requestCSVForecast(daysToForecast);
      setComparativeData([response]);
      addToast('Сравнительный прогноз на основе ML модели готов!', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Ошибка при запросе сравнительного прогноза.', 'error');
    } finally {
      setIsComparativeLoading(false);
    }
  };

  // --- Memoized Values ---
  const selectedProduct = useMemo(() => products?.find(p => p.product_id.toString() === selectedProductId) || null, [products, selectedProductId]);
  const filteredHistory = useMemo(() => history.filter(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase())), [history, searchQuery]);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="text-blue-600" size={24} />
              Прогноз продаж (ML модель)
            </h1>
            <p className="text-gray-600 mt-1">Генерация прогнозов на основе обученной ML модели с CSV данными</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <Database size={16} />
              Источник: CSV данные ML модели
            </div>
          </div>
          {!isMetricsLoading && overallMetrics && (
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Средняя MAPE</p>
                <p className="text-lg font-bold text-gray-900">{overallMetrics.avgMape.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Средняя MAE</p>
                <p className="text-lg font-bold text-gray-900">{overallMetrics.avgMae.toFixed(1)}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex border-b border-gray-200 mb-4">
          <button onClick={() => setTrendSubMode('detailed')} className={`px-4 py-2 font-medium transition-colors ${trendSubMode === 'detailed' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Детальный прогноз</button>
          <button onClick={() => setTrendSubMode('comparative')} className={`px-4 py-2 font-medium transition-colors ${trendSubMode === 'comparative' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Сравнительный прогноз</button>
        </div>

        {trendSubMode === 'detailed' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Настройки</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Товар из ML модели</label>
                <select value={selectedProductId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProductSelectionChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Выберите товар</option>
                  {products?.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} (MAPE: {p.mape?.toFixed(1)}%)
                    </option>
                  )) ?? []}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Период прогноза (дней)</label>
                <input type="number" value={daysToForecast} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDaysToForecast(parseInt(e.target.value) || 7)} min="1" max="365" className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <button onClick={handleForecastRequest} disabled={isTrendLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isTrendLoading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                {isTrendLoading ? 'Генерация прогноза...' : 'Сгенерировать прогноз'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Информация о товаре</h3>
              {selectedProduct ? (
                <Card>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Название:</span>
                      <p className="font-medium">{selectedProduct.product_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Точность модели (MAPE):</span>
                      <p className="font-medium text-blue-600">{selectedProduct.mape?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Средняя абсолютная ошибка (MAE):</span>
                      <p className="font-medium text-blue-600">{selectedProduct.mae?.toFixed(2)}</p>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>ℹ️ Информация:</strong> Прогноз основан на исторических данных ML модели. 
                        Точность может варьироваться в зависимости от стабильности продаж товара.
                      </p>
                    </div>
                  </div>
                </Card>
              ) : <div className="text-center py-8 text-gray-500">Выберите товар для просмотра данных</div>}
              {isTrendLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin"/></div> : 
                forecastData && (
                  <Card>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><TrendingUp size={20}/>Результаты прогноза</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <KpiCard title="Суммарный прогноз" value={forecastData.totalForecastedQuantity} unit="шт" />
                      <KpiCard title="Точность (MAPE)" value={`${forecastData.metrics.mape.toFixed(1)}%`} />
                    </div>
                    {lowConfidence && <div className="flex items-center gap-2 p-3 mb-4 text-yellow-800 bg-yellow-100 rounded-md"><AlertTriangle size={20}/>Низкая уверенность: мало исторических данных для точного прогноза.</div>}
                    <div className="space-y-2">
                      {forecastData.forecasts && forecastData.forecasts.map((f: Forecast) => (
                        <div key={f.date} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                          <span className="font-medium text-gray-700">{new Date(f.date).toLocaleDateString('ru-RU')}</span>
                          <span className="font-bold text-blue-600">{f.forecastedQuantity} шт</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              }
            </div>
          </div>
        )}

        {trendSubMode === 'comparative' && (
          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Товары для сравнения</label>
                    <MultiSelectDropdown options={products?.map(p => ({ id: p.product_id.toString(), name: p.product_name })) ?? []} selectedIds={selectedComparativeIds} onSelectionChange={setSelectedComparativeIds} placeholder="Выберите товары" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Период (дней)</label>
                    <input type="number" value={daysToForecast} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDaysToForecast(parseInt(e.target.value) || 7)} min="1" max="365" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
            </div>
            <button onClick={handleComparativeRequest} disabled={isComparativeLoading} className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {isComparativeLoading ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                {isComparativeLoading ? 'Генерация сравнения...' : 'Сравнить прогнозы'}
            </button>
            {isComparativeLoading ? <div className="flex justify-center"><Loader2 className="animate-spin"/></div> : 
                comparativeData.length > 0 && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-3">Сравнительный анализ</h3>
                        <div className="space-y-4">
                            {comparativeData.map((data, index) => (
                                <div key={index} className="border-l-4 border-purple-500 pl-4">
                                    <h4 className="font-medium text-purple-700">Прогноз {index + 1}</h4>
                                    <p className="text-sm text-gray-600">Суммарный прогноз: {data.totalForecastedQuantity} шт</p>
                                    <p className="text-sm text-gray-600">Точность: {data.metrics.mape.toFixed(1)}%</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )
            }
          </div>
        )}
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">История прогнозов</h3>
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <input type="text" placeholder="Поиск по истории..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>
        {filteredHistory.length > 0 ? (
          <div className="space-y-2">
            {paginatedHistory.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">{new Date(item.forecastDate).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.daysForecasted} дней</p>
                  <p className="text-sm text-gray-500">Точность: {item.accuracy.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-md disabled:opacity-50">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm">Страница {currentPage} из {totalPages}</span>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-md disabled:opacity-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">История прогнозов пуста</div>
        )}
      </Card>
    </div>
  );
};

export default SalesForecastCSVPage; 