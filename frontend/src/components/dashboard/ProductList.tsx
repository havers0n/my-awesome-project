import React from 'react';
import { Product, ProductStatus } from '@/types.admin';
import { STATUS_CONFIG } from '@/constants';
import { Card, CardHeader, CardContent, CardTitle } from './Card';
import { Search } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: ProductStatus | 'all';
  onStatusFilterChange: (status: ProductStatus | 'all') => void;
  onProductSelect: (product: Product) => void;
}

const ProductCard: React.FC<{ product: Product; onSelect: (product: Product) => void }> = ({ product, onSelect }) => {
  const config = STATUS_CONFIG[product.status];
  return (
    <div
      onClick={() => onSelect(product)}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-400 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <h4 className="font-semibold text-gray-800 truncate">{product.product_name}</h4>
          <p className="text-sm text-gray-500">Shelf: {product.shelf_location}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-gray-600">Available</p>
            <p className="font-bold text-lg text-gray-800">{product.available_stock}</p>
          </div>
          <div className={`flex items-center gap-2 ${config.bgColor} ${config.borderColor} border rounded-lg px-3 py-1.5`}>
            <div className={config.iconColor}>{config.icon}</div>
            <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductList: React.FC<ProductListProps> = ({
  products,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  onProductSelect
}) => {
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.shelf_location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Card>
      <CardHeader className="bg-slate-50">
        <CardTitle icon={<Search className="w-5 h-5 text-blue-600"/>} title="Product Status" subtitle="Find products and check their availability" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or shelf..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as ProductStatus | 'all')}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Statuses</option>
            <option value={ProductStatus.Available}>Available</option>
            <option value={ProductStatus.LowStock}>Low Stock</option>
            <option value={ProductStatus.Critical}>Critical</option>
            <option value={ProductStatus.OutOfStock}>Out of Stock</option>
          </select>
        </div>
        
        <div className="grid gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onSelect={onProductSelect} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No products found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;