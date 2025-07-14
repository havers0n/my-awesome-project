



import { INITIAL_PRODUCTS } from './constants';
import { Product, ProductStatus, HistoryEntry, ForecastData, Forecast, ProductSnapshot, ComparativeForecastData, ComparativeForecastItem, ItemMetrics, OverallMetrics } from './types';

const STORAGE_KEY = 'warehouse-products';
const API_DELAY = 700; // ms
const ERROR_RATE = 0.1; // 10% chance of error

// Helper to simulate API calls
function simulateApi<T>(dataFn: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < ERROR_RATE) {
        reject(new Error('Не удалось подключиться к серверу. Попробуйте снова.'));
      } else {
        try {
          const result = dataFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    }, API_DELAY + Math.random() * 400); // Add jitter
  });
}

// Helper to get all products from localStorage
function getProductsFromStorage(): Product[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

// Helper to save all products to localStorage
function saveProductsToStorage(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// --- API Functions ---

export const fetchProducts = (): Promise<Product[]> => {
    return simulateApi(() => {
        // Initialize if not present
        const products = getProductsFromStorage();
        if(!localStorage.getItem(STORAGE_KEY)) {
            saveProductsToStorage(products);
        }
        return products;
    });
};

export const addProduct = (productData: Omit<Product, 'id' | 'status' | 'history'>): Promise<Product> => {
    return simulateApi(() => {
        const products = getProductsFromStorage();
        const clampedQuantity = Math.max(0, productData.quantity);

        let status = ProductStatus.InStock;
        if (clampedQuantity === 0) status = ProductStatus.OutOfStock;
        else if (clampedQuantity <= 10) status = ProductStatus.LowStock;

        const newProduct: Product = {
            id: crypto.randomUUID(),
            name: productData.name,
            shelf: productData.shelf,
            category: productData.category,
            quantity: clampedQuantity,
            price: productData.price,
            status,
            history: [{
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                type: 'Поступление',
                change: clampedQuantity,
                newQuantity: clampedQuantity,
            }],
        };

        const newProducts = [newProduct, ...products];
        saveProductsToStorage(newProducts);
        return newProduct;
    });
};

export const updateProductDetails = (productId: string, updates: Partial<Pick<Product, 'name' | 'shelf' | 'price'>>): Promise<Product> => {
    return simulateApi(() => {
        const products = getProductsFromStorage();
        let updatedProduct: Product | undefined;
        const newProducts = products.map(p => {
            if (p.id === productId) {
                updatedProduct = { ...p, ...updates };
                return updatedProduct;
            }
            return p;
        });
        if (!updatedProduct) throw new Error('Product not found');
        saveProductsToStorage(newProducts);
        return updatedProduct;
    });
};


export const updateProductQuantity = (productId: string, newQuantity: number, type: HistoryEntry['type']): Promise<Product> => {
    return simulateApi(() => {
        const products = getProductsFromStorage();
        let updatedProduct: Product | undefined;
        
        const newProducts = products.map(p => {
            if (p.id === productId) {
                const clampedQuantity = Math.max(0, newQuantity);
                const change = clampedQuantity - p.quantity;

                if (change === 0 && type !== 'Отчет о нехватке') {
                    updatedProduct = p;
                    return p;
                };

                const newHistoryEntry: HistoryEntry = {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    type,
                    change,
                    newQuantity: clampedQuantity,
                };

                let newStatus = ProductStatus.InStock;
                if (clampedQuantity === 0) newStatus = ProductStatus.OutOfStock;
                else if (clampedQuantity <= 10) newStatus = ProductStatus.LowStock;

                updatedProduct = {
                    ...p,
                    quantity: clampedQuantity,
                    status: newStatus,
                    history: [newHistoryEntry, ...p.history],
                };
                return updatedProduct;
            }
            return p;
        });

        if (!updatedProduct) throw new Error('Product not found');
        saveProductsToStorage(newProducts);
        return updatedProduct;
    });
};

export const deleteProduct = (productId: string): Promise<{ id: string }> => {
    return simulateApi(() => {
        const products = getProductsFromStorage();
        const newProducts = products.filter(p => p.id !== productId);
        if (products.length === newProducts.length) {
            throw new Error('Product not found');
        }
        saveProductsToStorage(newProducts);
        return { id: productId };
    });
};

export const fetchProductSnapshot = (productId: string): Promise<ProductSnapshot> => {
    return simulateApi(() => {
        const products = getProductsFromStorage();
        const product = products.find(p => p.id === productId);
        if (!product) {
            throw new Error('Product not found for snapshot');
        }

        const salesHistory = product.history.filter(e => e.type === 'Списание');
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const calcAvgSales = (days: number): number => {
            const cutoffDate = new Date(new Date().setDate(today.getDate() - days));
            const relevantSales = salesHistory.filter(s => new Date(s.date) >= cutoffDate);
            if (relevantSales.length === 0) return 0;
            const totalSold = relevantSales.reduce((sum, entry) => sum + Math.abs(entry.change), 0);
            return totalSold / days;
        };
        
        const yesterday = new Date(new Date().setDate(today.getDate() - 1));
        const salesLag1d = salesHistory
            .filter(s => new Date(s.date).toDateString() === yesterday.toDateString())
            .reduce((sum, entry) => sum + Math.abs(entry.change), 0);
            
        return {
            avgSales7d: calcAvgSales(7),
            avgSales30d: calcAvgSales(30),
            salesLag1d: salesLag1d
        };
    });
};


export const requestSalesForecast = (days: number, product: Product, priceOverride?: number): Promise<ForecastData> => {
  return simulateApi(() => {
    const basePrice = product.price || 150; // default price if not set
    const forecastPrice = priceOverride !== undefined ? priceOverride : basePrice;

    // Simulate price elasticity. A 10% price increase reduces sales by 8%.
    const priceElasticityFactor = 0.8;
    const priceFactor = 1 - priceElasticityFactor * ((forecastPrice - basePrice) / basePrice);

    const baseDailyPrediction = product.quantity * (0.1 + Math.random() * 0.05);
    const priceAdjustedPrediction = baseDailyPrediction * priceFactor;

    const totalForecastedQuantity = Math.max(1, Math.round(priceAdjustedPrediction * days * (0.8 + Math.random() * 0.4)));
    
    const historyEntry: Forecast = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        productName: product.name,
        category: product.category,
        forecastedQuantity: totalForecastedQuantity,
        mape: (Math.random() * 0.15 + 0.05) * 100, // Dummy MAPE
        mae: Math.random() * 1.5 + 0.5, // Dummy MAE
    };
    
    return {
        totalForecastedQuantity,
        historyEntry,
    };
  });
};

export const requestComparativeForecast = (products: Product[], days: number): Promise<ComparativeForecastData> => {
    return simulateApi(() => {
        const results: ComparativeForecastItem[] = [];
        const colors = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899'];

        products.forEach((product, index) => {
            const baseDailyPrediction = product.quantity * (0.1 + Math.random() * 0.05);
            const totalForecast = Math.max(1, Math.round(baseDailyPrediction * days * (0.8 + Math.random() * 0.4)));

            results.push({
                productName: product.name,
                totalForecast,
                mape: (Math.random() * 0.15 + 0.05) * 100,
                mae: Math.random() * 1.5 + 0.5,
                color: colors[index % colors.length]
            });
        });

        return results.sort((a,b) => b.totalForecast - a.totalForecast);
    });
};

export const fetchOverallMetrics = (): Promise<OverallMetrics> => {
    return simulateApi(() => {
        // This simulates the /metrics endpoint
        return {
            avgMape: 10.83 + (Math.random() - 0.5) * 2, // Average MAPE in %
            avgMae: 0.89 + (Math.random() - 0.5) * 0.2,
        };
    });
};

export const fetchItemMetrics = (): Promise<ItemMetrics[]> => {
    return simulateApi(() => {
        const products = getProductsFromStorage();
        return products.map(p => ({
            productId: p.id,
            // Simulate MAPE between 1% and 40%
            mape: 1 + Math.random() * 39, 
            // Simulate MAE
            mae: 0.5 + Math.random() * 5,
        }));
    });
};