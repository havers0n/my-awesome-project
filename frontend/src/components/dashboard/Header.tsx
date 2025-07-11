
import React from 'react';
import { Product } from '@/types.admin';
import { Package, PieChart } from 'lucide-react';

interface HeaderProps {
  products: Product[];
  notificationCount: number;
}

const Header: React.FC<HeaderProps> = ({ products, notificationCount }) => {
  const getAnalyticsData = () => {
    if (!products || !Array.isArray(products)) {
      return { totalProducts: 0, availableProducts: 0, lowStockProducts: 0, outOfStockProducts: 0 };
    }
    const totalProducts = products.length;
    if (totalProducts === 0) {
        return { totalProducts: 0, availableProducts: 0, lowStockProducts: 0, outOfStockProducts: 0 };
    }
    const availableProducts = products.filter(p => p.status === 'available').length;
    const lowStockProducts = products.filter(p => p.status === 'low_stock' || p.status === 'critical').length;
    const outOfStockProducts = products.filter(p => p.status === 'out_of_stock').length;
    
    return {
      totalProducts,
      availableProducts,
      lowStockProducts,
      outOfStockProducts,
    };
  };

  const analytics = getAnalyticsData();

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 mb-8 shadow-2xl shadow-purple-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Package className="w-8 h-8" />
            Shelf Availability
          </h1>
          <p className="text-blue-100 text-lg">
            Manage and monitor your product inventory in real-time.
          </p>
        </div>
        <div className="hidden lg:block">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 relative">
            <PieChart className="w-12 h-12 text-white" />
            {notificationCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {notificationCount}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{analytics.totalProducts}</div>
          <div className="text-sm text-blue-100">Total SKUs</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-300">{analytics.availableProducts}</div>
          <div className="text-sm text-blue-100">Available</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-300">{analytics.lowStockProducts}</div>
          <div className="text-sm text-blue-100">Needs Attention</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-300">{analytics.outOfStockProducts}</div>
          <div className="text-sm text-blue-100">Out of Stock</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
