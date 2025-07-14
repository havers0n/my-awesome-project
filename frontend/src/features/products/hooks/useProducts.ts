import { useState, useCallback } from "react";
import { ProductData } from "@/shared/ui/organisms/ProductTable";

interface Category {
  id: string;
  name: string;
}

interface FetchProductsParams {
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories] = useState<Category[]>([
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'books', name: 'Books' },
    { id: 'home', name: 'Home & Garden' },
  ]);

  const fetchProducts = useCallback(async (params: FetchProductsParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data
      const mockProducts: ProductData[] = [
        {
          id: '1',
          name: 'Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 299.99,
          originalPrice: 399.99,
          status: 'in-stock',
          rating: 4.5,
          reviews: 128,
          badge: {
            text: 'Best Seller',
            variant: 'solid',
            color: 'success'
          }
        },
        {
          id: '2',
          name: 'Smart Watch',
          description: 'Fitness tracking smartwatch with health monitoring',
          price: 199.99,
          originalPrice: 249.99,
          status: 'in-stock',
          rating: 4.3,
          reviews: 89,
          badge: {
            text: 'New',
            variant: 'solid',
            color: 'primary'
          }
        },
        {
          id: '3',
          name: 'Laptop Stand',
          description: 'Ergonomic laptop stand for better productivity',
          price: 79.99,
          status: 'low-stock',
          rating: 4.7,
          reviews: 256
        },
        {
          id: '4',
          name: 'Wireless Mouse',
          description: 'Precision wireless mouse for gaming and work',
          price: 49.99,
          originalPrice: 69.99,
          status: 'in-stock',
          rating: 4.2,
          reviews: 45,
          badge: {
            text: 'Sale',
            variant: 'solid',
            color: 'error'
          }
        },
        {
          id: '5',
          name: 'USB-C Hub',
          description: 'Multi-port USB-C hub with fast charging',
          price: 89.99,
          status: 'out-of-stock',
          rating: 4.4,
          reviews: 67
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProducts(mockProducts);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    categories
  };
};
