
import React, { useState, useMemo, useEffect } from 'react';
import { Product, AbcAnalysisData, XyzAnalysisData, ItemMetrics } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell, Sector } from 'recharts';
import * as api from '../../api';
import { SpinnerIcon } from '../shared/icons';

// A simple card component for consistent styling
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 ${className}`}>
        {children}
    </div>
);

// --- DETAILED ANALYSIS COMPONENTS ---

const KpiCard: React.FC<{ title: string; value: string | number; unit?: string }> = ({ title, value, unit }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">
            {value} <span className="text-lg font-medium text-gray-600">{unit}</span>
        </p>
    </div>
);

const DetailedAnalysis: React.FC<{ products: Product[] }> = ({ products }) => {
    const [selectedProductId, setSelectedProductId] = useState<string>('');

    const analyticsData = useMemo(() => {
        if (!selectedProductId) return null;
        
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return null;

        const sortedHistory = [...product.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const chartData = sortedHistory.map(entry => ({
            date: new Date(entry.date).toLocaleDateString('ru-RU'),
            quantity: entry.newQuantity
        }));

        const salesHistory = sortedHistory.filter(e => e.type === 'Списание');
        const reportHistory = sortedHistory.filter(e => e.type === 'Отчет о нехватке');
        const arrivalHistory = sortedHistory.filter(e => e.type === 'Поступление');

        let averageDailyConsumption = 0;
        if (salesHistory.length > 1) {
            const totalSold = salesHistory.reduce((sum, entry) => sum + Math.abs(entry.change), 0);
            const firstSale = new Date(salesHistory[0].date);
            const lastSale = new Date(salesHistory[salesHistory.length - 1].date);
            const days = Math.max(1, (lastSale.getTime() - firstSale.getTime()) / (1000 * 3600 * 24));
            averageDailyConsumption = totalSold / days;
        }

        const daysUntilStockout = (averageDailyConsumption > 0 && product.quantity > 0)
            ? (product.quantity / averageDailyConsumption).toFixed(1)
            : '∞';

        const lastArrival = arrivalHistory.length > 0
            ? new Date(arrivalHistory[arrivalHistory.length - 1].date).toLocaleDateString('ru-RU')
            : 'N/A';
        
        return {
            productName: product.name,
            chartData,
            kpis: {
                avgConsumption: averageDailyConsumption.toFixed(2),
                daysLeft: daysUntilStockout,
                lastArrival,
                reportsCount: reportHistory.length,
            }
        };

    }, [selectedProductId, products]);

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Анализ по товару</h2>
                <p className="text-gray-500 mb-4">Выберите товар, чтобы увидеть подробную статистику и график движения остатков.</p>
                <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full max-w-sm p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
                >
                    <option value="" disabled>-- Выберите товар --</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </Card>

            {analyticsData ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Card className="lg:col-span-3">
                         <h3 className="text-lg font-bold text-gray-800 mb-4">Динамика остатков: {analyticsData.productName}</h3>
                         <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analyticsData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={12} />
                                    <YAxis fontSize={12} unit=" шт" allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="quantity" name="Остаток" stroke="#b45309" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <div className="lg:col-span-2 space-y-4">
                         <KpiCard title="Средний расход" value={analyticsData.kpis.avgConsumption} unit="шт/день"/>
                         <KpiCard title="Прогноз остатка" value={analyticsData.kpis.daysLeft} unit="дней"/>
                         <KpiCard title="Последнее поступление" value={analyticsData.kpis.lastArrival} />
                         <KpiCard title="Отчеты о нехватке" value={analyticsData.kpis.reportsCount} unit="раз"/>
                    </div>
                </div>
            ) : (
                <Card className="text-center py-16">
                    <h3 className="text-lg font-semibold text-gray-600">Нет данных для отображения</h3>
                    <p className="text-gray-500">Пожалуйста, выберите товар из списка выше, чтобы начать анализ.</p>
                </Card>
            )}
        </div>
    )
};


// --- ABC ANALYSIS COMPONENTS ---

const AbcAnalysis: React.FC<{ products: Product[] }> = ({ products }) => {
    const abcData = useMemo((): AbcAnalysisData => {
        const salesData = products.map(product => {
            const salesVolume = product.history
                .filter(h => h.type === 'Списание')
                .reduce((sum, h) => sum + Math.abs(h.change), 0);
            return { product, salesVolume };
        }).filter(d => d.salesVolume > 0);

        const totalVolume = salesData.reduce((sum, d) => sum + d.salesVolume, 0);

        salesData.sort((a, b) => b.salesVolume - a.salesVolume);

        let cumulativePercentage = 0;
        const classCounts = { A: 0, B: 0, C: 0 };
        const classVolume = { A: 0, B: 0, C: 0 };
        
        const items = salesData.map(d => {
            const percentage = totalVolume > 0 ? (d.salesVolume / totalVolume) * 100 : 0;
            cumulativePercentage += percentage;
            
            let itemClass: 'A' | 'B' | 'C';
            if (cumulativePercentage <= 80) itemClass = 'A';
            else if (cumulativePercentage <= 95) itemClass = 'B';
            else itemClass = 'C';

            classCounts[itemClass]++;
            classVolume[itemClass] += d.salesVolume;

            return { ...d, percentage, cumulativePercentage, class: itemClass };
        });

        return { items, classCounts, classVolume };
    }, [products]);
    
    const chartData = [
        { name: 'Класс A', value: abcData.classVolume.A, fill: '#b45309' },
        { name: 'Класс B', value: abcData.classVolume.B, fill: '#d97706' },
        { name: 'Класс C', value: abcData.classVolume.C, fill: '#fbbf24' },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-2">ABC-анализ по объему продаж</h2>
                <p className="text-gray-500">Разделение товаров на классы A, B и C в зависимости от их вклада в общий объем продаж. Помогает выявить самые важные позиции.</p>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h3 className="font-bold mb-4">Вклад классов в объем продаж</h3>
                     <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                 <XAxis type="number" hide />
                                 <YAxis type="category" dataKey="name" width={60} />
                                 <Tooltip formatter={(value: number) => `${value.toFixed(0)} шт.`}/>
                                 <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                                     {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                 </Bar>
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                </Card>
                 <Card className="lg:col-span-2">
                     <h3 className="font-bold mb-4">Сводка по классам</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div><p className="text-3xl font-bold text-amber-700">{abcData.classCounts.A}</p><p className="text-sm text-gray-500">Товаров класса A</p></div>
                        <div><p className="text-3xl font-bold text-amber-600">{abcData.classCounts.B}</p><p className="text-sm text-gray-500">Товаров класса B</p></div>
                        <div><p className="text-3xl font-bold text-amber-400">{abcData.classCounts.C}</p><p className="text-sm text-gray-500">Товаров класса C</p></div>
                    </div>
                </Card>
            </div>
            <Card>
                 <h3 className="font-bold mb-4">Детальная таблица ABC-анализа</h3>
                 <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Объем продаж (шт)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Доля (%)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Накоп. доля (%)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Класс</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {abcData.items.map(item => (
                                <tr key={item.product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product.name}</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-500">{item.salesVolume}</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-500">{item.percentage.toFixed(2)}%</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-500">{item.cumulativePercentage.toFixed(2)}%</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold" style={{color: chartData.find(c => c.name.includes(item.class))?.fill }}>{item.class}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </Card>
        </div>
    )
}

// --- XYZ ANALYSIS COMPONENTS ---
const COLORS = ['#166534', '#a16207', '#991b1b'];

const XyzAnalysis: React.FC<{ products: Product[] }> = ({ products }) => {
    const [xyzData, setXyzData] = useState<XyzAnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const calculateXyz = async () => {
            setIsLoading(true);
            try {
                const metrics = await api.fetchItemMetrics();
                const classCounts = { X: 0, Y: 0, Z: 0 };

                const items = metrics.map(metric => {
                    const product = products.find(p => p.id === metric.productId);
                    if (!product) return null;

                    let itemClass: 'X' | 'Y' | 'Z';
                    if (metric.mape < 10) itemClass = 'X';
                    else if (metric.mape < 25) itemClass = 'Y';
                    else itemClass = 'Z';

                    classCounts[itemClass]++;

                    return { product, mape: metric.mape, class: itemClass };
                }).filter((item): item is NonNullable<typeof item> => item !== null)
                  .sort((a,b) => a.mape - b.mape);
                
                setXyzData({ items, classCounts });
            } catch (error) {
                console.error("Failed to fetch item metrics:", error);
            } finally {
                setIsLoading(false);
            }
        };
        calculateXyz();
    }, [products]);
    
    if (isLoading) return <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 text-amber-600"/></div>
    if (!xyzData) return <Card>Не удалось загрузить данные для XYZ-анализа.</Card>

    const chartData = [
        { name: `Класс X (Стабильные)`, value: xyzData.classCounts.X },
        { name: `Класс Y (Переменные)`, value: xyzData.classCounts.Y },
        { name: `Класс Z (Хаотичные)`, value: xyzData.classCounts.Z },
    ];
    
    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-2">XYZ-анализ по стабильности спроса</h2>
                <p className="text-gray-500">Разделение товаров на классы X, Y и Z на основе предсказуемости спроса (по метрике MAPE). Помогает выявить самые "проблемные" товары.</p>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h3 className="font-bold mb-4">Распределение по классам</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value} товаров`} />
                                <Legend />
                            </PieChart>
                         </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="lg:col-span-2">
                    <h3 className="font-bold mb-4">Детальная таблица XYZ-анализа</h3>
                    <div className="max-h-80 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">MAPE (%)</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Класс</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {xyzData.items.map(item => (
                                    <tr key={item.product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product.name}</td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-500">{item.mape.toFixed(1)}%</td>
                                        <td className="px-6 py-4 text-center text-sm font-bold" style={{color: COLORS[item.class === 'X' ? 0 : item.class === 'Y' ? 1 : 2]}}>{item.class}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
}


const AnalyticsPage: React.FC<{ products: Product[] }> = ({ products }) => {
    const [activeTab, setActiveTab] = useState<'detailed' | 'abc' | 'xyz'>('detailed');

    const TabButton: React.FC<{
        tabId: typeof activeTab;
        children: React.ReactNode;
    }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`whitespace-nowrap py-4 px-3 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tabId
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="space-y-6 animate-fadeIn">
             <div className="border-b border-gray-200 bg-white rounded-t-2xl shadow-lg px-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tabId="detailed">Детальный анализ</TabButton>
                    <TabButton tabId="abc">ABC-анализ</TabButton>
                    <TabButton tabId="xyz">XYZ-анализ</TabButton>
                </nav>
            </div>

            {activeTab === 'detailed' && <DetailedAnalysis products={products} />}
            {activeTab === 'abc' && <AbcAnalysis products={products} />}
            {activeTab === 'xyz' && <XyzAnalysis products={products} />}
        </div>
    );
};

export default AnalyticsPage;
