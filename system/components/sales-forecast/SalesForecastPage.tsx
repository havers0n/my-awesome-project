
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Product, Forecast, ForecastData, ProductSnapshot, ComparativeForecastData, OverallMetrics } from '../../types';
import * as api from '../../api';
import { useToast } from '../../contexts/ToastProvider';
import { CheckSquareIcon, SpinnerIcon, TrendingUpIcon, WandIcon, SearchIcon, AlertTriangleIcon, InfoIcon } from '../shared/icons';
import MultiSelectDropdown from './MultiSelectDropdown';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
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

    return <span title={`MAPE: ${mape.toFixed(1)}%, MAE: ${mae?.toFixed(1)}`} className={`px-2 py-1 text-xs font-semibold rounded-md ${classes}`}>{accuracyText}</span>
}

const SnapshotCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-100 p-3 rounded-md">
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
);


type TrendSubMode = 'detailed' | 'comparative';

interface SalesForecastPageProps {
    products: Product[];
}

const SalesForecastPage: React.FC<SalesForecastPageProps> = ({ products }) => {
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
    
    useEffect(() => {
        const fetchMetricsData = async () => {
            setIsMetricsLoading(true);
            try {
                const data = await api.fetchOverallMetrics();
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
            const data = await api.requestSalesForecast(days, product, price);
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
            const snapshotData = await api.fetchProductSnapshot(productId);
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
            const data = await api.requestComparativeForecast(productsToCompare, daysToForecast);
            setComparativeData(data);
        } catch(error) {
            addToast(error instanceof Error ? error.message : 'Ошибка при запросе сравнительного прогноза.', 'error');
        } finally {
            setIsComparativeLoading(false);
        }
    };
    
    const filteredHistory = useMemo(() => {
        return history
            .filter(item => searchQuery ? item.productName.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    }, [history, searchQuery]);
    
    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredHistory, currentPage]);

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

    return (
        <div className="space-y-6 animate-fadeIn">
            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Прогноз продаж</h1>
                        <p className="text-gray-500">Создание и анализ прогнозов на основе AI</p>
                    </div>
                     <div className="text-right">
                        <h3 className="text-sm font-semibold text-gray-600">Качество модели (в среднем)</h3>
                        {isMetricsLoading ? (
                            <SpinnerIcon className="w-5 h-5 text-gray-400 mt-1 ml-auto" />
                        ) : overallMetrics ? (
                            <div className="flex gap-4 mt-1">
                                <div className="text-xs">
                                    <span className="font-bold text-gray-800">{overallMetrics.avgMape.toFixed(2)}%</span>
                                    <span className="text-gray-500 ml-1">MAPE</span>
                                </div>
                                <div className="text-xs">
                                    <span className="font-bold text-gray-800">{overallMetrics.avgMae.toFixed(2)}</span>
                                    <span className="text-gray-500 ml-1">MAE</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-red-500 mt-1">Ошибка</p>
                        )}
                    </div>
                </div>
            </Card>

            
                <>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setTrendSubMode('detailed')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${trendSubMode === 'detailed' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Детальный анализ
                        </button>
                         <button onClick={() => setTrendSubMode('comparative')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${trendSubMode === 'comparative' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Сравнительный анализ
                        </button>
                    </nav>
                </div>
                
                {trendSubMode === 'detailed' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="!p-4 border-l-4 border-green-500 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="lg:col-span-1">
                                <h2 className="font-bold text-lg text-gray-800 mb-2">Параметры прогноза</h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700" htmlFor="product-select">1. Выберите товар</label>
                                        <select id="product-select" value={selectedProductId} onChange={e => handleProductSelectionChange(e.target.value)} className="w-full mt-1 bg-white border border-gray-300 rounded-md p-2">
                                            <option value="" disabled>-- Выберите товар --</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700" htmlFor="days-forecast">2. Укажите период (дней)</label>
                                        <input id="days-forecast" type="number" value={daysToForecast} onChange={(e) => setDaysToForecast(Math.max(1, parseInt(e.target.value, 10)))} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                         <label className="text-sm font-medium text-gray-700 flex items-center gap-1" htmlFor="what-if-price">
                                            3. Укажите цену (what-if)
                                            <span className="group relative">
                                                <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                                                <span className="absolute bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Измените цену, чтобы увидеть, как это может повлиять на спрос. Модель учитывает ценовую эластичность.
                                                </span>
                                            </span>
                                        </label>
                                        <div className="relative mt-1">
                                            <input id="what-if-price" type="number" value={whatIfPrice === undefined ? '' : whatIfPrice} onChange={(e) => setWhatIfPrice(e.target.value === '' ? undefined : parseFloat(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md pr-10" />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">руб.</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleForecastRequest}
                                        disabled={isTrendLoading || !selectedProductId}
                                        className="w-full flex justify-center items-center gap-2 font-semibold py-3 px-4 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isTrendLoading ? <SpinnerIcon /> : <><WandIcon />Предсказать</>}
                                    </button>
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <h2 className="font-bold text-lg text-gray-800 mb-2">Контекст прогноза</h2>
                                {isSnapshotLoading ? <div className="h-full flex items-center justify-center"><SpinnerIcon /></div> : snapshot ? (
                                    <div className="space-y-2">
                                        <SnapshotCard title="Продажи за вчера (Лаг-1)" value={`${snapshot.salesLag1d.toFixed(0)} шт.`}/>
                                        <SnapshotCard title="Средние продажи (7 дней)" value={`${snapshot.avgSales7d.toFixed(1)} шт/день`}/>
                                        <SnapshotCard title="Средние продажи (30 дней)" value={`${snapshot.avgSales30d.toFixed(1)} шт/день`}/>
                                        <SnapshotCard title="Текущая цена" value={`${selectedProduct?.price?.toLocaleString('ru-RU') ?? 'N/A'} руб.`}/>
                                    </div>
                                ) : <p className="text-sm text-gray-500">Выберите товар для загрузки снимка.</p>}
                            </div>
                        </Card>
                         <Card>
                            <h2 className="font-bold text-lg text-gray-800 mb-4">История прогнозов</h2>
                            <div className="flex justify-between items-center mb-4">
                                <div className="relative flex-grow max-w-xs">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="w-5 h-5 text-gray-400" /></span>
                                    <input type="text" placeholder="Поиск по товару..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full"><thead className="bg-gray-50"><tr>{['Дата', 'Товар', 'Прогноз (шт.)', 'Качество'].map(h => <th key={h} className="px-4 py-2 text-left text-sm font-semibold text-gray-600">{h}</th>)}</tr></thead>
                                    <tbody>{paginatedHistory.map(item => (<tr key={item.id} className="border-b"><td className="px-4 py-3 text-sm text-gray-500">{new Date(item.date).toLocaleDateString('ru-RU')}</td><td className="px-4 py-3 text-sm font-semibold text-gray-800">{item.productName}</td><td className="px-4 py-3 text-sm text-gray-800">{item.forecastedQuantity}</td><td className="px-4 py-3 text-sm"><AccuracyBadge mape={item.mape} mae={item.mae} /></td></tr>))}</tbody>
                                </table>
                            </div>
                            {paginatedHistory.length === 0 && <div className="text-center py-8 text-gray-500">Нет записей, соответствующих вашему запросу.</div>}
                            <div className="flex justify-between items-center mt-4 text-sm"><p>Показано {paginatedHistory.length} из {filteredHistory.length} записей</p><div className="flex items-center gap-2"><button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border rounded-md disabled:opacity-50">Назад</button><span>{currentPage}</span><button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border rounded-md disabled:opacity-50">Вперед</button></div></div>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                         <Card className="h-full">
                            <h2 className="font-bold text-lg text-gray-800 mb-4">
                                Результат прогноза
                            </h2>
                            {isTrendLoading ? <div className="h-full flex items-center justify-center"><SpinnerIcon className="w-10 h-10 text-amber-600"/></div> : forecastData ? (
                                <div className="text-center flex flex-col items-center justify-center h-full space-y-4">
                                    <p className="text-sm text-gray-500">Прогноз для <span className="font-bold text-gray-700">{forecastData.historyEntry.productName}</span> на <span className="font-bold text-gray-700">{daysToForecast}</span> дней при цене <span className="font-bold text-gray-700">{whatIfPrice?.toLocaleString('ru-RU')} руб.</span></p>
                                    <p className="text-8xl font-bold text-amber-600">{forecastData.totalForecastedQuantity}</p>
                                    <p className="text-2xl font-semibold text-gray-700 -mt-2">шт.</p>
                                    <div className="pt-4 flex gap-4">
                                        <KpiCard title="MAPE" value={`${forecastData.historyEntry.mape?.toFixed(1)}%`} className="bg-white" />
                                        <KpiCard title="MAE" value={forecastData.historyEntry.mae?.toFixed(1)} unit="шт." className="bg-white" />
                                    </div>
                                    {lowConfidence && (
                                        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-2 text-sm">
                                            <AlertTriangleIcon className="w-5 h-5"/>
                                            <div>
                                                <span className="font-bold">Низкая точность:</span> Недостаточно данных по продажам. Прогноз основан на общих трендах.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center text-gray-500">
                                    <p>Выберите товар и нажмите "Предсказать", чтобы увидеть результат.</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
                ) : ( // Comparative Analysis View
                <>
                    <Card>
                        <div className="flex items-end gap-4">
                           <div className="flex-grow">
                             <label className="text-sm font-medium text-gray-700" htmlFor="multi-product-select">1. Выберите товары для сравнения</label>
                             <MultiSelectDropdown 
                                options={products.map(p => ({id: p.id, name: p.name}))}
                                selectedIds={selectedComparativeIds}
                                onChange={setSelectedComparativeIds}
                             />
                           </div>
                            <div className="flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700" htmlFor="days-forecast-comp">2. Период (дней)</label>
                                <input id="days-forecast-comp" type="number" value={daysToForecast} onChange={(e) => setDaysToForecast(Math.max(1, parseInt(e.target.value, 10)))} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
                            </div>
                           <div className="flex-shrink-0">
                               <button
                                    onClick={handleComparativeRequest}
                                    disabled={isComparativeLoading || selectedComparativeIds.length === 0}
                                    className="w-full flex justify-center items-center gap-2 font-semibold py-3 px-4 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isComparativeLoading ? <SpinnerIcon /> : <><WandIcon />Предсказать</>}
                                </button>
                           </div>
                        </div>
                    </Card>
                    {isComparativeLoading ? (
                        <Card className="flex items-center justify-center h-96"><SpinnerIcon className="w-10 h-10 text-amber-600"/></Card>
                    ) : comparativeData && comparativeData.length > 0 ? (
                        <Card>
                            <h2 className="font-bold text-lg text-gray-800 mb-4">Итоги сравнительного прогноза</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Товар</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Прогноз (шт.)</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">MAPE</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">MAE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparativeData.map(item => (
                                            <tr key={item.productName} className="border-b">
                                                <td className="px-4 py-3 text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                                                    {item.productName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800 text-right font-bold">{item.totalForecast}</td>
                                                <td className="px-4 py-3 text-sm text-gray-800 text-right">{item.mape?.toFixed(1)}%</td>
                                                <td className="px-4 py-3 text-sm text-gray-800 text-right">{item.mae?.toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ) : (
                        <Card className="h-96 flex items-center justify-center text-gray-500">
                             <p>Выберите товары и нажмите "Предсказать", чтобы увидеть сравнение.</p>
                        </Card>
                    )}
                </>
                )}
                </>
        </div>
    );
};

export default SalesForecastPage;
