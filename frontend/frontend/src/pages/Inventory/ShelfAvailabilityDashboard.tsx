
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, XCircle, Search, TrendingUp, BarChart3, Zap, Clock, Target, MessageSquare, Calendar, Filter, Download, Settings, HelpCircle, RefreshCw } from 'lucide-react';

import { shelfAvailabilityService } from '@/services/shelfAvailabilityService';
import Header from 'shelf-availability-dashboard/components/Header';
import Card from 'shelf-availability-dashboard/components/Card';
import ProductList from 'shelf-availability-dashboard/components/ProductList';
import ProductModal from 'shelf-availability-dashboard/components/ProductModal';
import OutOfStockTracker from 'shelf-availability-dashboard/components/OutOfStockTracker';
import NotificationsPanel from 'shelf-availability-dashboard/components/NotificationsPanel';
import QuickActions from 'shelf-availability-dashboard/components/QuickActions';
import Button from '@/components/ui/button/Button';
import { useModal } from '@/hooks/useModal';

const ShelfAvailabilityDashboard = () => {
  const [filters, setFilters] = useState({});
  const { data, isLoading, error } = useQuery(['shelfAvailability', filters], () => shelfAvailabilityService.fetchList(filters));
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [isOutOfStockModalOpen, setIsOutOfStockModalOpen] = useState(false);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    openModal();
  };

  return (
    <div>
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card title="Всего товаров" value={data?.total} icon={<Eye />} />
        <Card title="В наличии" value={data?.items.filter(p => p.status === 'available').length} icon={<TrendingUp />} />
        <Card title="Заканчиваются" value={data?.items.filter(p => p.status === 'low_stock').length} icon={<Clock />} />
        <Card title="Отсутствуют" value={data?.items.filter(p => p.status === 'out_of_stock').length} icon={<XCircle />} />
      </div>
      <div className="mb-4">
        <Button onClick={() => setIsOutOfStockModalOpen(true)}>Сообщить об отсутствии</Button>
      </div>
      <ProductList
        products={data?.items}
        onProductSelect={handleProductSelect}
        isLoading={isLoading}
        error={error}
      />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isOpen}
          onClose={closeModal}
        />
      )}
      {isOutOfStockModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsOutOfStockModalOpen(false)}></div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <OutOfStockTracker onClose={() => setIsOutOfStockModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelfAvailabilityDashboard;

