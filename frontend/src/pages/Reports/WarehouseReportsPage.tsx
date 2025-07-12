import React, { useMemo, useState, useEffect } from 'react';
import { Product, HistoryEntry } from '@/types/warehouse';
import { fetchProducts } from '@/services/warehouseApi';
import { useToast } from '@/contexts/ToastContext';
import { Download, Filter, FileText, Calendar, Package, TrendingUp, TrendingDown } from 'lucide-react';

interface CombinedHistoryEntry extends HistoryEntry {
  productName: string;
  productCategory: string;
}

const WarehouseReportsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', '7d', '30d'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'Поступление', ...
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { addToast } = useToast();

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

  const { filteredHistory, operationTypes, categories, stats } = useMemo(() => {
    const flatHistory: CombinedHistoryEntry[] = [];
    const types = new Set<string>();
    const cats = new Set<string>();

    products.forEach(product => {
      product.history.forEach(entry => {
        flatHistory.push({
          ...entry,
          productName: product.name,
          productCategory: product.category,
        });
        types.add(entry.type);
        cats.add(product.category);
      });
    });

    let result = flatHistory;

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const days = dateFilter === '7d' ? 7 : 30;
      const cutoffDate = new Date(new Date().setDate(now.getDate() - days));
      result = result.filter(entry => new Date(entry.date) >= cutoffDate);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(entry => entry.type === typeFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(entry => entry.productCategory === categoryFilter);
    }
    
    // Sort by date, newest first
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate stats
    const totalOperations = result.length;
    const totalIncoming = result.filter(e => e.type === 'Поступление').reduce((sum, e) => sum + e.change, 0);
    const totalOutgoing = result.filter(e => e.type === 'Списание').reduce((sum, e) => sum + Math.abs(e.change), 0);
    const totalReports = result.filter(e => e.type === 'Отчет о нехватке').length;

    return { 
      filteredHistory: result, 
      operationTypes: Array.from(types),
      categories: Array.from(cats),
      stats: {
        totalOperations,
        totalIncoming,
        totalOutgoing,
        totalReports
      }
    };
  }, [products, dateFilter, typeFilter, categoryFilter]);

  const handleDownloadCSV = () => {
    if (filteredHistory.length === 0) {
      addToast('Нет данных для экспорта.', 'error');
      return;
    }
    
    const headers = "Date,Product,Category,Operation,Quantity Change,New Quantity";
    const csvRows = [headers];

    filteredHistory.forEach(entry => {
      const date = `"${new Date(entry.date).toLocaleString('ru-RU')}"`;
      const product = `"${entry.productName.replace(/"/g, '""')}"`;
      const category = `"${entry.productCategory.replace(/"/g, '""')}"`;
      const operation = `"${entry.type}"`;
      const change = entry.change;
      const newQuantity = entry.newQuantity;
      csvRows.push([date, product, category, operation, change, newQuantity].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `warehouse_history_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Экспорт CSV завершен успешно!', 'success');
  };

  const StatCard: React.FC<{ title: string; value: number; color: string; icon: React.ReactNode }> = ({ title, value, color, icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl" style={{ color }}>{icon}</div>
      </div>
    </div>
  );

  const selectClassName = "w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отчеты и история операций</h1>
          <p className="text-gray-600 mt-1">Полная история движения товаров на складе</p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
        >
          <Download size={20} />
          Скачать CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Всего операций" 
          value={stats.totalOperations} 
          color="#3B82F6" 
          icon={<FileText />} 
        />
        <StatCard 
          title="Поступления" 
          value={stats.totalIncoming} 
          color="#10B981" 
          icon={<TrendingUp />} 
        />
        <StatCard 
          title="Списания" 
          value={stats.totalOutgoing} 
          color="#EF4444" 
          icon={<TrendingDown />} 
        />
        <StatCard 
          title="Отчеты о нехватке" 
          value={stats.totalReports} 
          color="#F59E0B" 
          icon={<Package />} 
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-gray-600">
            <Filter size={20} />
            <span>Фильтры:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Период</label>
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={selectClassName}>
                <option value="all">За все время</option>
                <option value="7d">За последние 7 дней</option>
                <option value="30d">За последние 30 дней</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Тип операции</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectClassName}>
                <option value="all">Все операции</option>
                {operationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={selectClassName}>
                <option value="all">Все категории</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата и время
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Товар
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Операция
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Изменение
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Новый остаток
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.date).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.productCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.type === 'Поступление' ? 'bg-green-100 text-green-800' :
                      entry.type === 'Списание' ? 'bg-red-100 text-red-800' :
                      entry.type === 'Отчет о нехватке' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                    entry.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.change > 0 ? `+${entry.change}` : entry.change}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {entry.newQuantity}
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText size={48} className="text-gray-400 mb-4" />
                      <h4 className="font-semibold text-lg text-gray-600">Записи не найдены</h4>
                      <p className="text-sm">Попробуйте изменить фильтры или добавить операции.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Сводка по выбранному периоду</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">+{stats.totalIncoming}</p>
              <p className="text-sm text-gray-600">Общее поступление</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">-{stats.totalOutgoing}</p>
              <p className="text-sm text-gray-600">Общее списание</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalIncoming - stats.totalOutgoing}</p>
              <p className="text-sm text-gray-600">Чистое изменение</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseReportsPage; 