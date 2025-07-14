import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Loader2, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

// Типы данных (соответствуют system)
export enum ProductStatus {
  InStock = 'В наличии',
  LowStock = 'Мало',
  OutOfStock = 'Нет в наличии',
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: 'Поступление' | 'Списание' | 'Коррекция' | 'Отчет о нехватке';
  change: number;
  newQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  shelf: string;
  category: string;
  quantity: number;
  status: ProductStatus;
  history: HistoryEntry[];
  price?: number;
}

export interface AbcDataItem {
  product: Product;
  salesVolume: number;
  percentage: number;
  cumulativePercentage: number;
  class: 'A' | 'B' | 'C';
}

export interface AbcAnalysisData {
  items: AbcDataItem[];
  classCounts: { A: number; B: number; C: number };
  classVolume: { A: number; B: number; C: number };
}

export interface XyzDataItem {
  product: Product;
  mape: number;
  class: 'X' | 'Y' | 'Z';
}

export interface XyzAnalysisData {
  items: XyzDataItem[];
  classCounts: { X: number; Y: number; Z: number };
}

// Компоненты
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

const KpiCard: React.FC<{ title: string; value: string | number; unit?: string }> = ({ title, value, unit }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <p className="text-sm text-gray-500 font-medium">{title}</p>
    <p className="text-2xl font-bold text-gray-800">
      {value} <span className="text-lg font-medium text-gray-600">{unit}</span>
    </p>
  </div>
);

// Простой компонент линейного графика без recharts
const SimpleLineChart: React.FC<{ data: { date: string; quantity: number }[] }> = ({ data }) => {
  if (data.length === 0) return null;

  const maxQuantity = Math.max(...data.map(d => d.quantity));
  const minQuantity = Math.min(...data.map(d => d.quantity));
  const range = maxQuantity - minQuantity || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.quantity - minQuantity) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-700">Остаток (шт)</h4>
        <div className="text-sm text-gray-500">
          {data[0]?.date} - {data[data.length - 1]?.date}
        </div>
      </div>
      <div className="relative w-full h-64">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Line */}
          <polyline
            fill="none"
            stroke="#b45309"
            strokeWidth="2"
            points={points}
          />
          
          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.quantity - minQuantity) / range) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="#b45309"
                className="hover:r-3 transition-all"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxQuantity}</span>
          <span>{Math.round((maxQuantity + minQuantity) / 2)}</span>
          <span>{minQuantity}</span>
        </div>
      </div>
    </div>
  );
};

// Простой компонент горизонтального барчарта
const SimpleBarChart: React.FC<{ data: { name: string; value: number; fill: string }[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-16 text-sm text-gray-600">{item.name}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div
              className="h-6 rounded-full transition-all duration-300"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.fill
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Простой компонент круговой диаграммы
const SimplePieChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let currentAngle = 0;
  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="white"
        strokeWidth="2"
        className="hover:opacity-80 transition-opacity"
      />
    );
  });

  return (
    <div className="flex items-center gap-6">
      <div className="w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {slices}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map((item: { name: string; value: number; color: string }, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
            <SimpleLineChart data={analyticsData.chartData} />
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
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Нет данных для отображения</h3>
          <p className="text-gray-500">Пожалуйста, выберите товар из списка выше, чтобы начать анализ.</p>
        </Card>
      )}
    </div>
  );
};

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
            <SimpleBarChart data={chartData} />
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
  );
};

const XyzAnalysis: React.FC<{ products: Product[] }> = ({ products }) => {
  const [xyzData, setXyzData] = useState<XyzAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateXyz = async () => {
      setIsLoading(true);
      try {
        // Имитация расчета XYZ-анализа
        const classCounts = { X: 0, Y: 0, Z: 0 };

        const items = products.map(product => {
          // Имитация расчета MAPE на основе истории продаж
          const salesHistory = product.history.filter(h => h.type === 'Списание');
          let mape = 0;
          
          if (salesHistory.length > 0) {
            // Простая имитация MAPE
            const avgSales = salesHistory.reduce((sum, h) => sum + Math.abs(h.change), 0) / salesHistory.length;
            const variance = salesHistory.reduce((sum, h) => sum + Math.pow(Math.abs(h.change) - avgSales, 2), 0) / salesHistory.length;
            mape = avgSales > 0 ? (Math.sqrt(variance) / avgSales) * 100 : 0;
          } else {
            mape = Math.random() * 30; // Случайное значение для товаров без истории
          }

          let itemClass: 'X' | 'Y' | 'Z';
          if (mape < 10) itemClass = 'X';
          else if (mape < 25) itemClass = 'Y';
          else itemClass = 'Z';

          classCounts[itemClass]++;

          return { product, mape: parseFloat(mape.toFixed(1)), class: itemClass };
        }).sort((a, b) => a.mape - b.mape);
        
        setXyzData({ items, classCounts });
      } catch (error) {
        console.error("Failed to calculate XYZ analysis:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateXyz();
  }, [products]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin"/>
      </div>
    );
  }
  
  if (!xyzData) {
    return <Card>Не удалось загрузить данные для XYZ-анализа.</Card>;
  }

  const chartData = [
    { name: `Класс X (Стабильные)`, value: xyzData.classCounts.X, color: '#166534' },
    { name: `Класс Y (Переменные)`, value: xyzData.classCounts.Y, color: '#a16207' },
    { name: `Класс Z (Хаотичные)`, value: xyzData.classCounts.Z, color: '#991b1b' },
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-2">XYZ-анализ по стабильности спроса</h2>
        <p className="text-gray-500">Разделение товаров на классы X, Y и Z на основе предсказуемости спроса (по метрике MAPE). Помогает выявить самые "проблемные" товары.</p>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold mb-4">Распределение по классам</h3>
          <SimplePieChart data={chartData} />
        </Card>
        <Card>
          <h3 className="font-bold mb-4">Детальная таблица XYZ-анализа</h3>
          <div className="max-h-96 overflow-y-auto">
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
                    <td className="px-6 py-4 text-right text-sm text-gray-500">{item.mape}%</td>
                    <td className="px-6 py-4 text-center text-sm font-bold" style={{color: chartData.find(c => c.name.includes(item.class))?.color }}>{item.class}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

type ActiveTab = 'detailed' | 'abc' | 'xyz';

const WarehouseAnalyticsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('detailed');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Имитация загрузки данных с историей для анализа
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Колбаса докторская',
            shelf: 'B1',
            category: 'Мясные изделия',
            quantity: 36,
            status: ProductStatus.InStock,
            history: [
              { id: '1', date: '2025-01-01', type: 'Поступление', change: 50, newQuantity: 50 },
              { id: '2', date: '2025-01-03', type: 'Списание', change: -14, newQuantity: 36 },
            ],
            price: 450
          },
          {
            id: '2',
            name: 'Сыр российский',
            shelf: 'B1',
            category: 'Молочные продукты',
            quantity: 7,
            status: ProductStatus.LowStock,
            history: [
              { id: '3', date: '2025-01-01', type: 'Поступление', change: 20, newQuantity: 20 },
              { id: '4', date: '2025-01-02', type: 'Списание', change: -13, newQuantity: 7 },
            ],
            price: 380
          },
          {
            id: '3',
            name: 'Молоко 3.2%',
            shelf: 'E2',
            category: 'Молочные продукты',
            quantity: 0,
            status: ProductStatus.OutOfStock,
            history: [
              { id: '5', date: '2024-12-30', type: 'Поступление', change: 30, newQuantity: 30 },
              { id: '6', date: '2025-01-01', type: 'Списание', change: -18, newQuantity: 12 },
              { id: '7', date: '2025-01-02', type: 'Списание', change: -12, newQuantity: 0 },
            ],
            price: 65
          },
          {
            id: '4',
            name: 'Хлеб белый',
            shelf: 'A1',
            category: 'Хлебобулочные изделия',
            quantity: 33,
            status: ProductStatus.InStock,
            history: [
              { id: '8', date: '2025-01-01', type: 'Поступление', change: 40, newQuantity: 40 },
              { id: '9', date: '2025-01-02', type: 'Списание', change: -7, newQuantity: 33 },
            ],
            price: 45
          },
          {
            id: '5',
            name: 'Рис круглозерный 1кг',
            shelf: 'A1',
            category: 'Крупы',
            quantity: 8,
            status: ProductStatus.LowStock,
            history: [
              { id: '10', date: '2024-12-28', type: 'Поступление', change: 15, newQuantity: 15 },
              { id: '11', date: '2025-01-01', type: 'Списание', change: -7, newQuantity: 8 },
            ],
            price: 85
          }
        ];
        
        setProducts(mockProducts);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  const TabButton: React.FC<{
    tabId: ActiveTab;
    children: React.ReactNode;
    icon: React.ReactNode;
  }> = ({ tabId, children, icon }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-semibold text-sm transition-colors ${
        activeTab === tabId
          ? 'border-amber-600 text-amber-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {icon}
      {children}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="space-y-6 animate-fadeIn">
          <div className="border-b border-gray-200 bg-white rounded-t-2xl shadow-lg px-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <TabButton tabId="detailed" icon={<LineChartIcon className="w-4 h-4" />}>
                Детальный анализ
              </TabButton>
              <TabButton tabId="abc" icon={<BarChart3 className="w-4 h-4" />}>
                ABC-анализ
              </TabButton>
              <TabButton tabId="xyz" icon={<PieChartIcon className="w-4 h-4" />}>
                XYZ-анализ
              </TabButton>
            </nav>
          </div>

          {activeTab === 'detailed' && <DetailedAnalysis products={products} />}
          {activeTab === 'abc' && <AbcAnalysis products={products} />}
          {activeTab === 'xyz' && <XyzAnalysis products={products} />}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default WarehouseAnalyticsPage; 