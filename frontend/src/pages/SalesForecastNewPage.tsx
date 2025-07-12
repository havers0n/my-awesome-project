import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Product, Forecast, ForecastData, ProductSnapshot, ComparativeForecastData, OverallMetrics } from '@/types/warehouse';
import { fetchProducts, requestSalesForecast, requestComparativeForecast, fetchProductSnapshot, fetchOverallMetrics } from '@/services/warehouseApi';
import { useToast } from '@/contexts/ToastContext';
import { TrendingUp, Wand2, Search, AlertTriangle, Info, CheckSquare, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Компоненты
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
  if (mape === null) return null;
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
      title={`MAPE: ${mape.toFixed(1)}%, MAE: ${mae?.toFixed(1)}`} 
      className={`px-2 py-1 text-xs font-semibold rounded-md ${classes}`}
    >
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

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedIds.length > 0 ? `Выбрано: ${selectedIds.length}` : placeholder}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <label key={option.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => handleToggle(option.id)}
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

const SalesForecastNewPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trendSubMode, setTrendSubMode] = useState<TrendSubMode>('detailed');
  const { addToast } = useToast();

  // --- Trend State ---
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
  const itemsPerPage = 5;
  const [lowConfidence, setLowConfidence] = useState(false);

  // --- Comparative State ---
  const [selectedComparativeIds, setSelectedComparativeIds] = useState<string[]>([]);
  const [comparativeData, setComparativeData] = useState<ComparativeForecastData | null>(null);
  const [isComparativeLoading, setIsComparativeLoading] = useState(false);

  // --- Metrics State ---
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        addToast(error instanceof Error ? error.message : 'Не удалось загрузить данные', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [addToast]);

  // Load metrics
  useEffect(() => {
    const fetchMetricsData = async () => {
      setIsMetricsLoading(true);
      try {
        const data = await fetchOverallMetrics();
        setOverallMetrics(data);
      } catch (error) {
        addToast(error instanceof Error ? error.message : 'Ошибка при загрузке метрик.', 'error');
      } finally {
        setIsMetricsLoading(false);
      }
    };
    fetchMetricsData();
  }, [addToast]);

  const fetchTrendData = useCallback(async (days: number, product: Product, price?: number) => {
    setIsTrendLoading(true);
    setLowConfidence(false);
    try {
      const data = await requestSalesForecast(days, product, price);
      setForecastData(data);
      setHistory(prev => [data.historyEntry, ...prev]);

      const salesHistoryCount = product.history.filter(h => h.type === 'Списание').length;
      if (salesHistoryCount < 3) {
        setLowConfidence(true);
      }
      addToast(`Прогноз для "${product.name}" успешно сгенерирован!`, 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Ошибка при запросе прогноза.', 'error');
    } finally {
      setIsTrendLoading(false);
    }
  }, [addToast]);

  const handleProductSelectionChange = useCallback(async (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (!product) {
      setSnapshot(null);
      setForecastData(null);
      setWhatIfPrice(undefined);
      return;
    }

    setWhatIfPrice(product.price);
    setIsSnapshotLoading(true);
    try {
      const snapshotData = await fetchProductSnapshot(productId);
      setSnapshot(snapshotData);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Не удалось загрузить снимок товара.', 'error');
      setSnapshot(null);
    } finally {
      setIsSnapshotLoading(false);
    }
  }, [products, addToast]);

  useEffect(() => {
    if (products.length > 0 && !initialLoadDone.current) {
      const initialProduct = products[0];
      if (initialProduct) {
        handleProductSelectionChange(initialProduct.id);
      }
      initialLoadDone.current = true;
    }
  }, [products, handleProductSelectionChange]);

  const handleForecastRequest = () => {
    const productToForecast = products.find(p => p.id === selectedProductId);
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
    setComparativeData(null);
    try {
      const productsToCompare = products.filter(p => selectedComparativeIds.includes(p.id));
      const data = await requestComparativeForecast(productsToCompare, daysToForecast);
      setComparativeData(data);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Ошибка при запросе сравнительного прогноза.', 'error');
    } finally {
      setIsComparativeLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(item => searchQuery ? item.productName.toLowerCase().includes(searchQuery.toLowerCase()) : true);
  }, [history, searchQuery]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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

      {/* Режимы */}
      <Card>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setTrendSubMode('detailed')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              trendSubMode === 'detailed'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Детальный прогноз
          </button>
          <button
            onClick={() => setTrendSubMode('comparative')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              trendSubMode === 'comparative'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Сравнительный прогноз
          </button>
        </div>

        {trendSubMode === 'detailed' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - настройки */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Товар</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelectionChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите товар</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Период прогноза (дней)</label>
                <input
                  type="number"
                  value={daysToForecast}
                  onChange={(e) => setDaysToForecast(parseInt(e.target.value) || 7)}
                  min="1"
                  max="365"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (₽) - что если?
                  </label>
                  <input
                    type="number"
                    value={whatIfPrice || ''}
                    onChange={(e) => setWhatIfPrice(parseInt(e.target.value) || undefined)}
                    placeholder={`Текущая: ${selectedProduct.price || 0}₽`}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                onClick={handleForecastRequest}
                disabled={!selectedProductId || isTrendLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isTrendLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Генерация прогноза...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Создать прогноз
                  </>
                )}
              </button>
            </div>

            {/* Правая колонка - данные товара */}
            <div className="space-y-4">
              {isSnapshotLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : snapshot && selectedProduct ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Снимок товара: {selectedProduct.name}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <SnapshotCard title="Средние продажи 7д" value={`${snapshot.avgSales7d.toFixed(1)} шт/день`} />
                    <SnapshotCard title="Средние продажи 30д" value={`${snapshot.avgSales30d.toFixed(1)} шт/день`} />
                    <SnapshotCard title="Продажи вчера" value={`${snapshot.salesLag1d} шт`} />
                    <SnapshotCard title="Текущий остаток" value={`${selectedProduct.quantity} шт`} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Выберите товар для просмотра данных
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Товары для сравнения</label>
              <MultiSelectDropdown
                options={products.map(p => ({ id: p.id, name: p.name }))}
                selectedIds={selectedComparativeIds}
                onSelectionChange={setSelectedComparativeIds}
                placeholder="Выберите товары для сравнения"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Период прогноза (дней)</label>
              <input
                type="number"
                value={daysToForecast}
                onChange={(e) => setDaysToForecast(parseInt(e.target.value) || 7)}
                min="1"
                max="365"
                className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleComparativeRequest}
              disabled={selectedComparativeIds.length === 0 || isComparativeLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isComparativeLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Генерация сравнительного прогноза...
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  Создать сравнительный прогноз
                </>
              )}
            </button>
          </div>
        )}
      </Card>

      {/* Результаты прогноза */}
      {trendSubMode === 'detailed' && forecastData && (
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Результат прогноза</h3>
            {lowConfidence && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle size={16} />
                <span className="text-sm">Низкая достоверность - мало данных</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              title="Прогнозируемые продажи"
              value={forecastData.totalForecastedQuantity}
              unit="шт"
            />
            <KpiCard
              title="MAPE"
              value={forecastData.historyEntry.mape?.toFixed(1) || 'N/A'}
              unit="%"
            />
            <KpiCard
              title="MAE"
              value={forecastData.historyEntry.mae?.toFixed(1) || 'N/A'}
              unit=""
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Точность прогноза:</span>
            <AccuracyBadge 
              mape={forecastData.historyEntry.mape} 
              mae={forecastData.historyEntry.mae} 
            />
          </div>
        </Card>
      )}

      {/* Сравнительный прогноз */}
      {trendSubMode === 'comparative' && comparativeData && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Сравнительный прогноз</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Прогноз
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MAPE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MAE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Точность
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparativeData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.totalForecast} шт
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.mape?.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.mae?.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <AccuracyBadge mape={item.mape} mae={item.mae} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* История прогнозов */}
      {history.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">История прогнозов</h3>
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по товару..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Прогноз
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Точность
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.forecastedQuantity} шт
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <AccuracyBadge mape={item.mape} mae={item.mae} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SalesForecastNewPage; 