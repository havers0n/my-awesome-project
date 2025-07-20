import { 
  Product, 
  ForecastData, 
  ProductSnapshot, 
  ComparativeForecastData, 
  ItemMetrics, 
  OverallMetrics 
} from '@/types/warehouse';
import { supabase } from '@/services/supabaseClient';

// Use relative URLs to leverage the Vite proxy
const API_BASE_URL = '/api';

// Helper to get auth token from Supabase
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (e) {
    console.error("Failed to get Supabase auth token", e);
    return null;
  }
};

// Helper for making authenticated API requests
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  console.log('API Request:', url, options.method || 'GET', response.status);

  if (!response.ok) {
    let errorDetails = 'Request failed';
    let errorData = null;
    
    try {
      errorData = await response.json();
      errorDetails = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
      // Could not parse error JSON, use status text
      errorDetails = response.statusText;
    }
    
    // Log detailed error information for debugging
    console.error('API Request Failed:', {
      url: `${API_BASE_URL}${url}`,
      method: options.method || 'GET',
      status: response.status,
      statusText: response.statusText,
      errorDetails,
      errorData,
      hasAuthToken: !!token
    });
    
    // Create a more informative error object
    const error = new Error(`API Error: ${errorDetails} (Status: ${response.status})`);
    (error as any).status = response.status;
    (error as any).statusText = response.statusText;
    (error as any).url = `${API_BASE_URL}${url}`;
    (error as any).errorData = errorData;
    
    throw error;
  }

  // Handle cases where response body might be empty (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return Promise.resolve(undefined as unknown as T);
  }
}


// --- API Functions ---

export const fetchProducts = async (page: number = 1, limit: number = 50): Promise<{data: Product[], pagination: any}> => {
  const response = await apiFetch<{data: Product[], pagination: any}>(`/inventory/products?page=${page}&limit=${limit}`);
  
  // Проверяем формат ответа - если это старый формат (массив), преобразуем в новый
  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: {
        page: 1,
        limit: response.length,
        total: response.length
      }
    };
  }
  
  return response;
};

// Для обратной совместимости - функция которая возвращает только данные
export const fetchAllProducts = async (): Promise<Product[]> => {
  const response = await fetchProducts(1, 1000); // Получаем до 1000 продуктов на одной странице
  return response.data;
};

export const addProduct = (productData: Omit<Product, 'product_id' | 'stock_by_location'>): Promise<Product> => {
  return apiFetch('/inventory/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const updateProduct = (productId: number, productData: Omit<Product, 'product_id' | 'stock_by_location'>): Promise<Product> => {
  return apiFetch(`/inventory/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

export const updateProductQuantity = (productId: number, quantity: number, type: 'Поступление' | 'Списание' | 'Коррекция' | 'Отчет о нехватке'): Promise<Product> => {
  return apiFetch(`/inventory/products/${productId}/quantity`, {
    method: 'PUT',
    body: JSON.stringify({ quantity, type }),
  });
};

export async function deleteProduct(productId: number): Promise<void> {
  return apiFetch<void>(`/inventory/products/${productId}`, {
    method: 'DELETE',
  });
}

export async function getProductOperations(productId: number): Promise<{
  productId: number;
  operations: Array<{
    id: number;
    type: string;
    date: string;
    quantity: number;
    totalAmount?: number;
    costPrice?: number;
    shelfPrice?: number;
    stockOnHand?: number;
    deliveryDelayDays?: number;
    wasOutOfStock?: boolean;
    location?: {
      id: number;
      name: string;
    };
    supplier?: {
      id: number;
      name: string;
    };
    createdAt: string;
  }>;
  total: number;
}> {
  return apiFetch<{
    productId: number;
    operations: Array<{
      id: number;
      type: string;
      date: string;
      quantity: number;
      totalAmount?: number;
      costPrice?: number;
      shelfPrice?: number;
      stockOnHand?: number;
      deliveryDelayDays?: number;
      wasOutOfStock?: boolean;
      location?: {
        id: number;
        name: string;
      };
      supplier?: {
        id: number;
        name: string;
      };
      createdAt: string;
    }>;
    total: number;
  }>(`/inventory/products/${productId}/operations`);
}

export async function getSuppliers(): Promise<Array<{
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}>> {
  return apiFetch<Array<{
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }>>('/inventory/suppliers');
}

export async function getSupplierDeliveryInfo(supplierId: number): Promise<{
  supplierId: number;
  analytics: {
    totalDeliveries: number;
    averageDelay: number;
    totalAmount: number;
    onTimeDeliveries: number;
    delayedDeliveries: number;
    recentDeliveries: Array<{
      date: string;
      delay: number;
      amount: number;
      product: {
        id: number;
        name: string;
      } | null;
    }>;
  };
  deliveries: Array<{
    date: string;
    delay: number;
    quantity: number;
    amount: number;
    costPrice: number;
    product: {
      id: number;
      name: string;
    } | null;
  }>;
}> {
  return apiFetch<{
    supplierId: number;
    analytics: {
      totalDeliveries: number;
      averageDelay: number;
      totalAmount: number;
      onTimeDeliveries: number;
      delayedDeliveries: number;
      recentDeliveries: Array<{
        date: string;
        delay: number;
        amount: number;
        product: {
          id: number;
          name: string;
        } | null;
      }>;
    };
    deliveries: Array<{
      date: string;
      delay: number;
      quantity: number;
      amount: number;
      costPrice: number;
      product: {
        id: number;
        name: string;
      } | null;
    }>;
  }>(`/inventory/suppliers/${supplierId}/delivery-info`);
}

export async function getMLForecast(productId: number, days: number = 7): Promise<{
  productId: number;
  forecastDays: number;
  predictions: Array<{
    date: string;
    predictedQuantity: number;
    confidence: number;
  }>;
  recommendations: {
    recommendedOrder: number;
    stockoutRisk: 'low' | 'medium' | 'high';
    optimalOrderDate: string;
    reason: string;
  };
}> {
  return apiFetch<{
    productId: number;
    forecastDays: number;
    predictions: Array<{
      date: string;
      predictedQuantity: number;
      confidence: number;
    }>;
    recommendations: {
      recommendedOrder: number;
      stockoutRisk: 'low' | 'medium' | 'high';
      optimalOrderDate: string;
      reason: string;
    };
  }>(`/forecast`, {
    method: 'POST',
    body: JSON.stringify({
      DaysCount: days,
      products: [{ productId }]
    })
  });
}

export async function getOutOfStockReports(): Promise<Array<{
  id: number;
  quantityNeeded: number;
  priority: 'low' | 'medium' | 'high';
  notes: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    sku: string;
  } | null;
  location: {
    id: number;
    name: string;
  } | null;
  reporter: {
    id: string;
    name: string;
  } | null;
}>> {
  return apiFetch<Array<{
    id: number;
    quantityNeeded: number;
    priority: 'low' | 'medium' | 'high';
    notes: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    product: {
      id: number;
      name: string;
      sku: string;
    } | null;
    location: {
      id: number;
      name: string;
    } | null;
    reporter: {
      id: string;
      name: string;
    } | null;
  }>>('/inventory/out-of-stock-reports');
}

export async function createOutOfStockReport(data: {
  productId: number;
  locationId?: number;
  quantityNeeded?: number;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}): Promise<{
  id: number;
  message: string;
}> {
  return apiFetch<{
    id: number;
    message: string;
  }>('/inventory/out-of-stock-reports', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateOutOfStockReportStatus(
  reportId: number,
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
): Promise<{
  id: number;
  status: string;
  message: string;
}> {
  return apiFetch<{
    id: number;
    status: string;
    message: string;
  }>(`/inventory/out-of-stock-reports/${reportId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export const fetchProductSnapshot = (productId: number): Promise<ProductSnapshot> => {
  // This endpoint might not exist on the backend, this is a plausible implementation.
  // The original mock calculated this on the frontend from product history.
  // The backend might need a new endpoint, e.g., /api/products/{id}/snapshot
  console.warn("fetchProductSnapshot is using a placeholder endpoint. Backend implementation may be required.");
  return apiFetch(`/inventory/products/${productId}/snapshot`);
};

export const requestSalesForecast = async (days: number, product: Product, priceOverride?: number): Promise<ForecastData> => {
  // This is a two-step process now:
  // 1. Trigger the forecast generation on the backend.
  // 2. Fetch the results to display them.
  
  // Step 1: Trigger forecast generation
  // Backend endpoint handles org ID and fetches necessary data internally.
  await apiFetch('/forecast/predict', {
    method: 'POST',
    body: JSON.stringify({ 
      DaysCount: days,
      ProductId: product.product_id,
      PriceOverride: priceOverride
    }),
  });
  
  // Step 2: Fetch the latest forecast data to display on the page
  // The backend's getForecastData seems to be what we need.
  return apiFetch(`/forecast/forecast?days=${days}&productId=${product.product_id}`);
};

export const requestComparativeForecast = async (productIds: number[], days: number): Promise<ComparativeForecastData> => {
  // Make a direct call to the comparative forecast endpoint
  try {
    const response = await apiFetch<ComparativeForecastData>('/forecast/comparative', {
      method: 'POST',
      body: JSON.stringify({
        productIds,
        days
      })
    });

    // Validate response format
    if (!response || !Array.isArray(response)) {
      console.error('Invalid response format from comparative forecast API:', response);
      throw new Error('Некорректный формат данных от сервера');
    }

    // Validate each item in the response
    const validatedResponse = response.map(item => ({
      productName: item.productName || 'Неизвестный продукт',
      totalForecast: typeof item.totalForecast === 'number' ? item.totalForecast : 0,
      mape: typeof item.mape === 'number' ? item.mape : null,
      mae: typeof item.mae === 'number' ? item.mae : null,
      color: item.color || `hsl(${Math.random() * 360}, 70%, 50%)`
    }));

    return validatedResponse;
  } catch (error) {
    console.error('Error in requestComparativeForecast:', error);
    // Return empty array instead of mock data in case of error
    return [];
  }
};

export const fetchOverallMetrics = (): Promise<OverallMetrics> => {
  console.log("fetchOverallMetrics is using mock data as the backend endpoint is not yet implemented.");
  // Mock data until the backend is ready
  const mockMetrics: OverallMetrics = {
    avgMape: 0,
    avgMae: 0,
  } as OverallMetrics;
  return Promise.resolve(mockMetrics);
};

export const fetchItemMetrics = (): Promise<ItemMetrics[]> => {
  // This would need a backend endpoint like /api/metrics/items
  console.warn("fetchItemMetrics is using a placeholder endpoint. Backend implementation may be required.");
  return apiFetch('/forecast/metrics/items');
};

// --- CSV API Functions ---

export const fetchCSVProducts = async (): Promise<Product[]> => {
  const response = await apiFetch<{data: Product[], pagination: any, source: string}>('/forecast/csv-products');
  
  // Проверяем формат ответа
  if (Array.isArray(response)) {
    return response;
  }
  
  return response.data || [];
};

export const fetchCSVMetrics = async (): Promise<OverallMetrics> => {
  const response = await apiFetch<{data: OverallMetrics, source: string}>('/forecast/csv-metrics');
  
  if (response.data) {
    return response.data;
  }
  
  return response;
};

export const requestCSVForecast = async (days: number): Promise<ForecastData> => {
  const response = await apiFetch<{data: any, message: string, source: string}>('/forecast/predict-csv', {
    method: 'POST',
    body: JSON.stringify({ DaysCount: days }),
  });
  
  // Преобразуем ответ в формат ForecastData
  if (response.data && response.data.predictions) {
    return {
      totalForecastedQuantity: response.data.predictions.reduce((sum: number, p: any) => sum + (p.Количество || 0), 0),
      metrics: {
        mape: response.data.predictions[0]?.MAPE || 0,
        mae: response.data.predictions[0]?.MAE || 0
      },
      forecasts: response.data.predictions.slice(1).map((p: any) => ({
        date: p.Период,
        forecastedQuantity: p.Количество || 0,
        productName: p.Номенклатура || 'Unknown'
      })),
      historyEntry: {
        id: Date.now(),
        productName: 'CSV Forecast',
        forecastDate: new Date().toISOString(),
        accuracy: response.data.predictions[0]?.MAPE || 0,
        daysForecasted: days
      },
      source: 'CSV_ML_MODEL'
    };
  }
  
  throw new Error('Неверный формат ответа от CSV API');
};

// Dummy functions for any remaining calls, to avoid breaking the UI
export const getCategories = (): Promise<string[]> => Promise.resolve(['Мясные изделия', 'Сыры', 'Молочные продукты']);
export const getShelves = (): Promise<string[]> => Promise.resolve(['A1', 'B1', 'C2', 'E2']); 