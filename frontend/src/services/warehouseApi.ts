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
} from '@/types/warehouse';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  const authData = localStorage.getItem('supabase.auth.token');
  if (!authData) return null;
  try {
    const parsedData = JSON.parse(authData);
    return parsedData.access_token;
  } catch (e) {
    console.error("Failed to parse Supabase auth token from localStorage", e);
    return null;
  }
};


// Helper for making authenticated API requests
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

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

  if (!response.ok) {
    let errorDetails = 'Request failed';
    try {
      const errorData = await response.json();
      errorDetails = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
      // Could not parse error JSON, use status text
      errorDetails = response.statusText;
    }
    throw new Error(`API Error: ${errorDetails} (Status: ${response.status})`);
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

export const fetchProducts = (): Promise<Product[]> => {
  return apiFetch('/inventory/products');
};

export const addProduct = (productData: Omit<Product, 'id' | 'status' | 'history'>): Promise<Product> => {
  return apiFetch('/inventory/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const updateProductQuantity = (productId: string, newQuantity: number, type: HistoryEntry['type']): Promise<Product> => {
  return apiFetch(`/inventory/products/${productId}/quantity`, {
    method: 'PUT',
    body: JSON.stringify({ newQuantity, type }),
  });
};

export const deleteProduct = (productId: string): Promise<{ id: string }> => {
  return apiFetch(`/inventory/products/${productId}`, {
    method: 'DELETE',
  }).then(() => ({ id: productId }));
};


export const fetchProductSnapshot = (productId: string): Promise<ProductSnapshot> => {
  // This endpoint might not exist on the backend, this is a plausible implementation.
  // The original mock calculated this on the frontend from product history.
  // The backend might need a new endpoint, e.g., /api/products/{id}/snapshot
  console.warn("fetchProductSnapshot is using a placeholder endpoint. Backend implementation may be required.");
  return apiFetch(`/inventory/products/${productId}/snapshot`);
};


export const requestSalesForecast = async (days: number): Promise<any> => {
  // This is a two-step process now:
  // 1. Trigger the forecast generation on the backend.
  // 2. Fetch the results to display them.
  
  // Step 1: Trigger forecast generation
  // Backend endpoint handles org ID and fetches necessary data internally.
  await apiFetch('/forecast/predict', {
    method: 'POST',
    body: JSON.stringify({ DaysCount: days }),
  });
  
  // Step 2: Fetch the latest forecast data to display on the page
  // The backend's getForecastData seems to be what we need.
  return apiFetch(`/forecast/forecast?days=${days}`);
};


export const requestComparativeForecast = async (productIds: string[], days: number): Promise<ComparativeForecastData> => {
  console.warn("requestComparativeForecast is not fully implemented on the backend yet.");
  // This would need a dedicated backend endpoint.
  // For now, we can try to call the main forecast and filter on the frontend,
  // or return mock data.
  const allForecastData = await requestSalesForecast(days);
  
  const filteredItems = allForecastData.history.items
    .filter((item: any) => productIds.includes(item.product_id))
    .map((item: any) => ({
      id: item.product_id,
      name: item.product,
      totalForecast: item.forecast,
      // The detailed daily breakdown is not provided by the current backend endpoint,
      // so we have to generate some plausible data.
      daily_forecast: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        quantity: parseFloat((item.forecast / days).toFixed(1)),
      })),
    }));
      
      return {
    items: filteredItems,
    days,
  };
};

export const fetchOverallMetrics = (): Promise<OverallMetrics> => {
  // This would need a backend endpoint like /api/metrics/overall
  console.warn("fetchOverallMetrics is using a placeholder endpoint. Backend implementation may be required.");
  return apiFetch('/forecast/metrics');
};

export const fetchItemMetrics = (): Promise<ItemMetrics[]> => {
  // This would need a backend endpoint like /api/metrics/items
  console.warn("fetchItemMetrics is using a placeholder endpoint. Backend implementation may be required.");
  return apiFetch('/forecast/metrics/items');
};

// Dummy functions for any remaining calls, to avoid breaking the UI
export const getCategories = (): Promise<string[]> => Promise.resolve(['Мясные изделия', 'Сыры', 'Молочные продукты']);
export const getShelves = (): Promise<string[]> => Promise.resolve(['A1', 'B1', 'C2', 'E2']); 