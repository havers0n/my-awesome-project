import React from "react";
import { ProductItem } from "../molecules/ProductItem";

export interface ProductData {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  originalPrice?: string | number;
  image?: string;
  imageAlt?: string;
  badge?: {
    text: string;
    variant: 'solid' | 'outline' | 'light';
    color: 'primary' | 'success' | 'error' | 'warning' | 'info';
  };
  status?: 'in-stock' | 'out-of-stock' | 'low-stock';
  rating?: number;
  reviews?: number;
}

interface ProductTableProps {
  products: ProductData[];
  loading?: boolean;
  layout?: 'table' | 'grid';
  className?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading = false,
  layout = 'table',
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {products.map((product) => (
          <ProductItem
            key={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            originalPrice={product.originalPrice}
            image={product.image}
            imageAlt={product.imageAlt}
            badge={product.badge}
            status={product.status}
            rating={product.rating}
            reviews={product.reviews}
            layout="vertical"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {products.map((product) => (
        <ProductItem
          key={product.id}
          name={product.name}
          description={product.description}
          price={product.price}
          originalPrice={product.originalPrice}
          image={product.image}
          imageAlt={product.imageAlt}
          badge={product.badge}
          status={product.status}
          rating={product.rating}
          reviews={product.reviews}
          layout="horizontal"
        />
      ))}
    </div>
  );
};
