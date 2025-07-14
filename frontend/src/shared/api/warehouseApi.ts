import { 
  Product, 
  ProductStatus, 
  HistoryEntry, 
  ForecastData, 
  Forecast, 
  ProductSnapshot, 
  ComparativeForecastData, 
  ComparativeForecastItem, 
  ItemMetrics, 
  OverallMetrics 
} from "@/types/warehouse";

// Базовый URL для API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Временные данные для разработки (заменить на реальные API вызовы)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Колбаса докторская',
    shelf: 'B1',
    category: 'Мясные изделия',
    quantity: 36,
    status: ProductStatus.InStock,
    price: 550,
    history: [
      { id: 'h-1-1', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 50, newQuantity: 50 },
      { id: 'h-1-2', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'Списание', change: -14, newQuantity: 36 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Сыр российский',
    shelf: 'B1',
    category: 'Сыры',
    quantity: 7,
    status: ProductStatus.LowStock,
    price: 800,
    history: [
      { id: 'h-2-1', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 20, newQuantity: 20 },
      { id: 'h-2-2', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'Списание', change: -13, newQuantity: 7 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Молоко 3.2%',
    shelf: 'E2',
    category: 'Молочные продукты',
    quantity: 0,
    status: ProductStatus.OutOfStock,
    price: 90,
    history: [
      { id: 'h-3-1', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 12, newQuantity: 12 },
      { id: 'h-3-2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'Списание', change: -12, newQuantity: 0 },
    ],
  },
];

const STORAGE_KEY = 'warehouse-products';
const API_DELAY = 700; // ms
const ERROR_RATE = 0.05; // 5% chance of error

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
    }, API_DELAY + Math.random() * 400);
  });
}

// Helper to get all products from localStorage (временно)
function getProductsFromStorage(): Product[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

// Helper to save all products to localStorage (временно)
function saveProductsToStorage(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// --- API Functions ---

export const fetchProducts = (): Promise<Product[]> => {
  return simulateApi(() => {
    // TODO: Заменить на реальный API вызов
    // return fetch(`${API_BASE_URL}/api/products`).then(res => res.json());
    
    const products = getProductsFromStorage();
    if (!localStorage.getItem(STORAGE_KEY)) {
      saveProductsToStorage(products);
    }
    return products;
  });
};

export const addProduct = (productData: Omit<Product, 'id' | 'status' | 'history'>): Promise<Product> => {
  return simulateApi(() => {
    // TODO: Заменить на реальный API вызов
    // return fetch(`${API_BASE_URL}/api/products`, { method: 'POST', body: JSON.stringify(productData) });
    
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

export const updateProductQuantity = (productId: string, newQuantity: number, type: HistoryEntry['type']): Promise<Product> => {
  return simulateApi(() => {
    // TODO: Заменить на реальный API вызов
    
    const products = getProductsFromStorage();
    let updatedProduct: Product | undefined;
    
    const newProducts = products.map(p => {
      if (p.id === productId) {
        const clampedQuantity = Math.max(0, newQuantity);
        const change = clampedQuantity - p.quantity;

        if (change === 0 && type !== 'Отчет о нехватке') {
          updatedProduct = p;
          return p;
        }

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
    // TODO: Заменить на реальный API вызов
    
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
    // TODO: Заменить на реальный API вызов
    
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
    // TODO: Заменить на реальный API вызов к ML сервису
    // return fetch(`${API_BASE_URL}/api/forecast`, { method: 'POST', body: JSON.stringify({ days, product, priceOverride }) });
    
    const basePrice = product.price || 150;
    const effectivePrice = priceOverride || basePrice;
    const priceMultiplier = basePrice > 0 ? effectivePrice / basePrice : 1;
    
    const salesHistory = product.history.filter(e => e.type === 'Списание');
    const avgDailySales = salesHistory.length > 0 
      ? salesHistory.reduce((sum, entry) => sum + Math.abs(entry.change), 0) / Math.max(1, salesHistory.length)
      : 1;
    
    const forecastedQuantity = Math.round(avgDailySales * days * priceMultiplier * (0.8 + Math.random() * 0.4));
    const mape = 5 + Math.random() * 20;
    const mae = Math.round(forecastedQuantity * 0.1 * (0.5 + Math.random()));
    
    const forecast: Forecast = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      productName: product.name,
      category: product.category,
      forecastedQuantity,
      mape,
      mae,
    };
    
    return {
      totalForecastedQuantity: forecastedQuantity,
      historyEntry: forecast,
    };
  });
};

export const requestComparativeForecast = (products: Product[], days: number): Promise<ComparativeForecastData> => {
  return simulateApi(() => {
    // TODO: Заменить на реальный API вызов к ML сервису
    
    const colors = ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'];
    
    return products.map((product, index): ComparativeForecastItem => {
      const salesHistory = product.history.filter(e => e.type === 'Списание');
      const avgDailySales = salesHistory.length > 0 
        ? salesHistory.reduce((sum, entry) => sum + Math.abs(entry.change), 0) / Math.max(1, salesHistory.length)
        : 1;
      
      const totalForecast = Math.round(avgDailySales * days * (0.8 + Math.random() * 0.4));
      const mape = 5 + Math.random() * 20;
      const mae = Math.round(totalForecast * 0.1 * (0.5 + Math.random()));
      
      return {
        productName: product.name,
        totalForecast,
        mape,
        mae,
        color: colors[index % colors.length],
      };
    });
  });
};

export const fetchOverallMetrics = (): Promise<OverallMetrics> => {
  return simulateApi(() => {
    // TODO: Заменить на реальный API вызов
    
    return {
      avgMape: 12.5 + Math.random() * 5,
      avgMae: 8.2 + Math.random() * 3,
    };
  });
};

export const fetchItemMetrics = (): Promise<ItemMetrics[]> => {
  return simulateApi(() => {
    // TODO: Заменить на реальный API вызов
    
    const products = getProductsFromStorage();
    return products.map(product => ({
      productId: product.id,
      mape: 5 + Math.random() * 25,
      mae: Math.round(product.quantity * 0.1 * (0.5 + Math.random())),
    }));
  });
}; 