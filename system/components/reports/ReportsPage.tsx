
import React, { useMemo, useState } from 'react';
import { Product, HistoryEntry } from '../../types';
import { DownloadIcon, FilterIcon } from '../shared/icons';
import { useToast } from '../../contexts/ToastProvider';

interface CombinedHistoryEntry extends HistoryEntry {
  productName: string;
}

interface ReportsPageProps {
  products: Product[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ products }) => {
  const { addToast } = useToast();
  const [dateFilter, setDateFilter] = useState('all'); // 'all', '7d', '30d'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'Поступление', ...

  const { filteredHistory, operationTypes } = useMemo(() => {
    const flatHistory: CombinedHistoryEntry[] = [];
    const types = new Set<string>();

    products.forEach(product => {
      product.history.forEach(entry => {
        flatHistory.push({
          ...entry,
          productName: product.name,
        });
        types.add(entry.type);
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
    
    // Sort by date, newest first
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { filteredHistory: result, operationTypes: Array.from(types) };
  }, [products, dateFilter, typeFilter]);

  const handleDownloadCSV = () => {
    if (filteredHistory.length === 0) {
        addToast('Нет данных для экспорта.', 'error');
        return;
    }
    const headers = "Date,Product,Operation,Quantity Change,New Quantity";
    const csvRows = [headers];

    filteredHistory.forEach(entry => {
      const date = `"${new Date(entry.date).toLocaleString('ru-RU')}"`;
      const product = `"${entry.productName.replace(/"/g, '""')}"`; // Escape double quotes
      const operation = `"${entry.type}"`;
      const change = entry.change;
      const newQuantity = entry.newQuantity;
      csvRows.push([date, product, operation, change, newQuantity].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `warehouse_history_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Загрузка CSV началась...', 'info');
  };

  const selectClassName = "w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">История операций</h2>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-amber-600 transition-colors duration-300"
        >
          <DownloadIcon />
          Скачать CSV
        </button>
      </div>

       <div className="flex flex-col sm:flex-row items-center gap-4 p-4 mb-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 font-semibold text-gray-600">
                <FilterIcon/>
                <span>Фильтры:</span>
            </div>
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={selectClassName}>
                <option value="all">За все время</option>
                <option value="7d">За последние 7 дней</option>
                <option value="30d">За последние 30 дней</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectClassName}>
                <option value="all">Все операции</option>
                {operationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </div>


      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата и время</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Операция</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Изменение</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Новый остаток</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistory.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.date).toLocaleString('ru-RU')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.productName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.type}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${entry.change > 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">{entry.newQuantity}</td>
              </tr>
            ))}
             {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  <h4 className="font-semibold text-lg text-gray-600">Записи не найдены</h4>
                  <p className="text-sm">Попробуйте изменить фильтры.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
