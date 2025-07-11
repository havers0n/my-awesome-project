import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/modules/inventory/services/inventoryService';

interface OutOfStockReporterProps {
  products: any[];
  outOfStockItems: OutOfStockItem[];
  onUpdateOutOfStock: (items: OutOfStockItem[]) => void;
}

interface OutOfStockItem {
  id: string;
  productName: string;
  hours: number;
  minutes: number;
  reportedAt: Date;
}

const OutOfStockReporter: React.FC<OutOfStockReporterProps> = ({ products, outOfStockItems, onUpdateOutOfStock }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [manualProduct, setManualProduct] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [outOfStockList, setOutOfStockList] = useState<OutOfStockItem[]>(outOfStockItems);
  const [isManualEntry, setIsManualEntry] = useState(false);

  useEffect(() => {
    setOutOfStockList(outOfStockItems);
  }, [outOfStockItems]);

  const handleAdd = () => {
    const productName = isManualEntry ? manualProduct : selectedProduct;
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;

    if (!productName || (hoursNum === 0 && minutesNum === 0)) {
      alert('Пожалуйста, выберите продукт и укажите время отсутствия');
      return;
    }

    const newItem: OutOfStockItem = {
      id: Date.now().toString(),
      productName,
      hours: hoursNum,
      minutes: minutesNum,
      reportedAt: new Date()
    };

    const updatedList = [...outOfStockList, newItem];
    setOutOfStockList(updatedList);
    onUpdateOutOfStock(updatedList);
    
    // Reset form
    setSelectedProduct('');
    setManualProduct('');
    setHours('');
    setMinutes('');
  };

  const handleRemove = (id: string) => {
    const updatedList = outOfStockList.filter(item => item.id !== id);
    setOutOfStockList(updatedList);
    onUpdateOutOfStock(updatedList);
  };

  return (
    <div className="bg-white rounded-lg shadow-theme-md p-6">
      <h2 className="text-title-md font-bold text-gray-900 mb-6">Сообщить об отсутствии товара</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выберите товар
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setIsManualEntry(false);
            }}
            disabled={isManualEntry}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
          >
            <option value="">-- Выберите товар --</option>
            {products.map((product: any) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="manual-entry"
            checked={isManualEntry}
            onChange={(e) => {
              setIsManualEntry(e.target.checked);
              if (e.target.checked) {
                setSelectedProduct('');
              }
            }}
            className="mr-2"
          />
          <label htmlFor="manual-entry" className="text-sm text-gray-700">
            Ввести название вручную
          </label>
        </div>

        {isManualEntry && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название товара
            </label>
            <input
              type="text"
              value={manualProduct}
              onChange={(e) => setManualProduct(e.target.value)}
              placeholder="Введите название товара"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Часов отсутствует
            </label>
            <input
              type="number"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Минут отсутствует
            </label>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-brand-500 text-white py-2 px-4 rounded-lg hover:bg-brand-600 transition-colors font-medium"
        >
          Добавить
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Зарегистрированные отсутствующие товары</h3>
        {outOfStockList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Нет зарегистрированных товаров</p>
        ) : (
          <div className="space-y-2">
            {outOfStockList.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="font-medium text-gray-900">{item.productName}</span>
                  <span className="text-theme-sm text-gray-500 ml-2">
                    - Отсутствует {item.hours}ч {item.minutes}м
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-error-500 hover:text-error-700 text-theme-sm font-medium transition-colors"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutOfStockReporter;
