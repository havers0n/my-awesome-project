import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Product, Forecast, ForecastData, ProductSnapshot, ComparativeForecastData, OverallMetrics } from '@/types/warehouse';
import { fetchAllProducts, requestSalesForecast, requestComparativeForecast, fetchProductSnapshot, fetchOverallMetrics } from '@/services/warehouseApi';
import { useToast } from '@/contexts/ToastContext';
import { Loader2, Wand2, TrendingUp, AlertTriangle, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper Components
const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const KpiCard: React.FC<{ title: string; value: string | number; unit?: string, className?: string }> = ({ title, value, unit, className }) => (
  <div className={`bg-gray-50 p-4 rounded-lg border border-gray-200 ${className}`}>
    <p className="text-sm text-gray-500 font-medium">{title}</p>
    <p className="text-3xl font-bold text-gray-800">
      {value} <span className="text-lg font-medium text-gray-600">{unit}</span>
    </p>
  </div>
);

const AccuracyBadge: React.FC<{ mape: number | null, mae: number | null }> = ({ mape, mae }) => {
  if (mape === null || mae === null) return null;
  const mapeValue = mape;
  let accuracyText = 'Средняя';
  let classes = 'bg-yellow-100 text-yellow-800';

  if (mapeValue < 10) {
    accuracyText = 'Высокая';
    classes = 'bg-green-100 text-green-800';
  } else if (mapeValue > 25) {
    accuracyText = 'Низкая';
    classes = 'bg-red-100 text-red-800';
  }

  return (
    <span 
      title={`MAPE: ${mape.toFixed(1)}%, MAE: ${mae.toFixed(1)}`} 
      className={`px-2 py-1 text-xs font-semibold rounded-md ${classes}`}>
      {accuracyText}
    </span>
  );
};

const SnapshotCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-gray-100 p-3 rounded-md">
    <p className="text-xs text-gray-500 font-medium">{title}</p>
    <p className="text-lg font-bold text-gray-800">{value}</p>
  </div>
);

const MultiSelectDropdown: React.FC<{ 
  options: { id: string; name: string }[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder: string;
}> = ({ options, selectedIds, onSelectionChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
      >
        <span>{selectedIds.length > 0 ? `Выбрано: ${selectedIds.length}` : placeholder}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <label key={option.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => handleToggle(option.id)}
                className="mr-2 form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
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

const SalesForecastNewPage: React.FC = () => {
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
        const fetchedProducts = await fetchAllProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        addToast(error instanceof Error ? error.message : 'Не удалось загрузить товары', 'error');
      } finally {
        setIsLoading(false);
      }

      try {
        const metricsData = await fetchOverallMetrics();
        setOverallMetrics(metricsData);
      } catch (error) {
        addToast(error instanceof Error ? error.message : 'Не удалось загрузить общие метрики', 'error');
        // Set to null or default state if metrics fail
        setOverallMetrics(null);
      } finally {
        setIsMetricsLoading(false);
      }
    };

    loadInitialData();
  }, [addToast]);

  const fetchTrendData = useCallback(async (days: number, product: Product, price?: number) => {
    setIsTrendLoading(true);
    setLowConfidence(false);
    try {
      const data = await requestSalesForecast(days, product, price);
      setForecastData(data);
      if (data.historyEntry) {
        setHistory(prev => [data.historyEntry, ...prev].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i));
      }
      // Note: product.history is not available in the current Product type
      // We'll set low confidence based on other criteria or remove this check
      addToast(`Прогноз для "${product.product_name}" успешно сгенерирован!`, 'success');
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
    setIsSnapshotLoading(true);
    try {
      const snapshotData = await fetchProductSnapshot(parseInt(productId));
      setSnapshot(snapshotData);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Не удалось загрузить снимок товара.', 'error');
      setSnapshot(null);
    } finally {
      setIsSnapshotLoading(false);
    }
  }, [products, addToast]);

  useEffect(() => {
    if (products?.length > 0 && !initialLoadDone.current) {
      const initialProduct = products[0];
      if (initialProduct) handleProductSelectionChange(initialProduct.product_id.toString());
      initialLoadDone.current = true;
    }
  }, [products, handleProductSelectionChange]);

  // --- Event Handlers ---
  const handleForecastRequest = () => {
    const productToForecast = products.find(p => p.product_id.toString() === selectedProductId);
    if (productToForecast) {
      setForecastData(null);
      fetchTrendData(daysToForecast, productToForecast, whatIfPrice);
    } else {
      addToast('Пожалуйста, выберите товар для прогноза.', 'info');
    }
  };

  const handleComparativeRequest = async () => {
    if (selectedComparativeIds.length === 0) {
      addToast('Выберите хотя бы один товар для сравнения.', 'info');
      return;
    }
    setIsComparativeLoading(true);
    setComparativeData([]);
    try {
      // Преобразуем selectedComparativeIds в массив чисел
      const ids = selectedComparativeIds.map(id => parseInt(id));
      const response = await requestComparativeForecast(ids, daysToForecast);
      setComparativeData(response || []);
      if (!response || response.length === 0) {
        addToast('Нет данных для сравнительного прогноза.', 'info');
      }
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
            <h1 className="text-2xl font-bold text-gray-900">Прогноз продаж</h1>
            <p className="text-gray-600 mt-1">Генерация прогнозов продаж на основе машинного обучения</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Товар</label>
                <select value={selectedProductId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProductSelectionChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Выберите товар</option>
                  {products?.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>) ?? []}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Период прогноза (дней)</label>
                <input type="number" value={daysToForecast} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDaysToForecast(parseInt(e.target.value) || 7)} min="1" max="365" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {selectedProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽) - "что если?"</label>
                  <input type="number" value={whatIfPrice || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatIfPrice(parseInt(e.target.value) || undefined)} placeholder={`Текущая: ${selectedProduct.price || 0}₽`} min="0" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <button onClick={handleForecastRequest} disabled={!selectedProductId || isTrendLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
                {isTrendLoading ? <><Loader2 className="animate-spin" size={20} />Генерация...</> : <><Wand2 size={20} />Создать прогноз</>}
              </button>
            </div>
            <div className="space-y-4">
              {isSnapshotLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin"/></div> : 
                selectedProduct && snapshot ? (
                  <Card className="bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3">Снимок товара: {selectedProduct.product_name}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <SnapshotCard title="Средние продажи 7д" value={`${snapshot.avgSales7d.toFixed(1)} шт/день`} />
                      <SnapshotCard title="Средние продажи 30д" value={`${snapshot.avgSales30d.toFixed(1)} шт/день`} />
                      <SnapshotCard title="Продажи вчера" value={`${snapshot.salesLag1d} шт`} />
                      <SnapshotCard title="Текущий остаток" value={`${selectedProduct.stock_by_location?.[0]?.stock ?? 0} шт`} />
                    </div>
                  </Card>
                ) : <div className="text-center py-8 text-gray-500">Выберите товар для просмотра данных</div>
              }
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
            <button onClick={handleComparativeRequest} disabled={selectedComparativeIds.length === 0 || isComparativeLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
              {isComparativeLoading ? <><Loader2 className="animate-spin" size={20} />Сравнение...</> : <>Сравнить прогнозы</>}
            </button>
            {isComparativeLoading ? <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin"/></div> : 
              comparativeData && comparativeData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparativeData.map((data, index) => (
                    <Card key={index}>
                      <h4 className="font-bold text-md mb-2 truncate">{data.productName}</h4>
                      <div className="space-y-2">
                        <KpiCard title="Суммарный прогноз" value={data.totalForecast} unit="шт" />
                        <KpiCard title="Точность (MAPE)" value={`${data.mape?.toFixed(1) ?? 'N/A'}%`} />
                      </div>
                    </Card>
                  ))}
                </div>
              )
            }
          </div>
        )}
      </Card>

      {history.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold mb-4">История прогнозов</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Поиск по названию..." value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded-md" />
          </div>
          <div className="space-y-3">
            {paginatedHistory.map(h => (
              <div key={h.id} className="p-4 border rounded-md grid grid-cols-4 gap-4 items-center bg-gray-50">
                <span className="font-semibold col-span-2">{h.productName}</span>
                <span className="text-gray-600">{new Date(h.date).toLocaleDateString('ru-RU')}</span>
                <div className="flex justify-end">
                  <AccuracyBadge mape={h.mape} mae={h.mae} />
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium">
                Страница {currentPage} из {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SalesForecastNewPage;