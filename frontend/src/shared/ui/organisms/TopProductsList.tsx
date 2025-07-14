import React from "react";

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  growth: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

const TopProductsList: React.FC<TopProductsListProps> = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Top Products</h3>
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <span className="font-medium">{product.name}</span>
              <div className="text-sm text-gray-600">{product.sales} sales</div>
            </div>
            <div className={`px-2 py-1 text-xs rounded ${
              product.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.growth > 0 ? '+' : ''}{product.growth}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsList;
