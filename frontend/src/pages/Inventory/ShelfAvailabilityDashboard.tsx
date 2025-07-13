import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, XCircle, Search, TrendingUp, BarChart3, Zap, Clock, Target, MessageSquare, Calendar, Filter, Download, Settings, HelpCircle, RefreshCw } from 'lucide-react';

import { inventoryService as shelfAvailabilityService } from '@/modules/inventory/services/inventoryService';
import Header from '@/components/dashboard/Header';
import { Card } from '@/components/dashboard/Card';
import ProductList from '@/components/dashboard/ProductList';
import ProductModal from '@/components/dashboard/ProductModal';
import OutOfStockReporter from '@/components/dashboard/OutOfStockReporter';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import QuickActions from '@/components/dashboard/QuickActions';

import { useModal } from '@/hooks/useModal';

const ShelfAvailabilityDashboard = () => {
  const [filters, setFilters] = useState({});
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['shelfAvailability', filters], 
    queryFn: () => shelfAvailabilityService.getProductsPaginated(
      { page: 1, limit: 100 }, 
      filters
    ) 
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    openModal();
  };

  const handleOutOfStockUpdate = (items) => {
    setOutOfStockItems(items);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-25">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <span className="ml-3 text-theme-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-error-50 text-error-700 p-6 rounded-lg shadow-theme-md">
        <h2 className="text-lg font-semibold mb-4">Something went wrong</h2>
        <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
        <pre className="mt-4 text-sm bg-error-100 p-2 rounded">{error.message}</pre>
      </div>
    );
  }

  return (
    <div>
      <Header products={data?.data?.items || []} notificationCount={data?.data?.items.filter(p => p.status === 'low_stock' || p.status === 'critical' || p.status === 'out_of_stock').length || 0} />
      <div className="my-6">
        <OutOfStockReporter 
          products={data?.data?.items || []}
          outOfStockItems={outOfStockItems}
          onUpdateOutOfStock={handleOutOfStockUpdate}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <div className="flex items-center p-4">
            <div className="flex-shrink-0 bg-brand-500 text-white rounded-full p-3 shadow-theme-sm">
              <Eye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Всего товаров</div>
              <div className="text-lg font-semibold text-gray-900">{data?.data?.total || 0}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center p-4">
            <div className="flex-shrink-0 bg-success-500 text-white rounded-full p-3 shadow-theme-sm"><TrendingUp className="h-6 w-6" /></div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">В наличии</div>
              <div className="text-lg font-semibold text-gray-900">{data?.data?.items.filter(p => p.status === 'available').length || 0}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center p-4">
            <div className="flex-shrink-0 bg-warning-500 text-white rounded-full p-3 shadow-theme-sm"><Clock className="h-6 w-6" /></div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Заканчиваются</div>
              <div className="text-lg font-semibold text-gray-900">{data?.data?.items.filter(p => p.status === 'low_stock').length || 0}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center p-4">
            <div className="flex-shrink-0 bg-error-500 text-white rounded-full p-3 shadow-theme-sm"><XCircle className="h-6 w-6" /></div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Отсутствуют</div>
              <div className="text-lg font-semibold text-gray-900">{data?.data?.items.filter(p => p.status === 'out_of_stock').length || 0}</div>
            </div>
          </div>
        </Card>
      </div>
      <ProductList
        products={data?.data?.items || []}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onProductSelect={handleProductSelect}
      />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ShelfAvailabilityDashboard;

