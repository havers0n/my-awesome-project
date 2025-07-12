import React from 'react';

const SalesReports: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Отчеты по продажам</h1>
        <p className="text-gray-600 mt-2">Анализ продаж и выручки</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Продажи за период</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Сегодня</span>
              <span className="text-sm font-medium text-gray-900">₽45,678</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">За неделю</span>
              <span className="text-sm font-medium text-gray-900">₽234,567</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">За месяц</span>
              <span className="text-sm font-medium text-gray-900">₽1,234,567</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">За год</span>
              <span className="text-sm font-medium text-gray-900">₽12,345,678</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ товары</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Хлеб белый</span>
              <span className="text-sm font-medium text-gray-900">1,234 шт</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Молоко 1л</span>
              <span className="text-sm font-medium text-gray-900">856 шт</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Яйца С1</span>
              <span className="text-sm font-medium text-gray-900">723 шт</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Масло сливочное</span>
              <span className="text-sm font-medium text-gray-900">456 шт</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Детализированный отчет</h3>
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
            Экспорт в Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Дата</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Товар</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Количество</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-900">2024-01-15</td>
                <td className="py-3 px-4 text-sm text-gray-900">Хлеб белый</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">45</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">₽1,350</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-900">2024-01-15</td>
                <td className="py-3 px-4 text-sm text-gray-900">Молоко 1л</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">23</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">₽1,840</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-900">2024-01-15</td>
                <td className="py-3 px-4 text-sm text-gray-900">Яйца С1</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">12</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">₽1,200</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReports; 