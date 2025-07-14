import axios, { AxiosError } from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Retry logic for ML service requests
 * @param url - ML service URL
 * @param data - Request payload
 * @param retries - Number of retry attempts (default: MAX_RETRIES)
 * @returns Promise with ML service response
 */
export async function retryMLRequest(url: string, data: any, retries: number = MAX_RETRIES): Promise<any> {
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    return response.data;
  } catch (error) {
    if (retries > 0 && error instanceof AxiosError) {
      // Retry on network errors or 5xx errors
      if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
        console.log(`ML service request failed, retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryMLRequest(url, data, retries - 1);
      }
    }
    
    // Re-throw error if no retries left or it's a client error
    throw error;
  }
}

/**
 * Format ML service response to a standard format
 */
export function formatMLResponse(mlResponse: any[]): {
  metrics: { MAPE: number; MAE: number; DaysPredict: number };
  predictions: any[];
} {
  if (!Array.isArray(mlResponse) || mlResponse.length === 0) {
    return {
      metrics: { MAPE: 0, MAE: 0, DaysPredict: 0 },
      predictions: []
    };
  }

  const metrics = mlResponse[0] || {};
  
  // Check if first element is metrics or a prediction
  const hasMetrics = metrics.MAPE !== undefined || metrics.MAE !== undefined || metrics.DaysPredict !== undefined;
  const startIndex = hasMetrics ? 1 : 0;
  
  const predictions = mlResponse.slice(startIndex)
    .filter(pred => pred.product_id || pred.Номенклатура) // Filter out entries without product ID
    .map(pred => ({
      product_id: pred.product_id || pred.Номенклатура,
      quantity: pred.quantity || pred.Количество || 0,
      item_mape: parseFloat(String(pred.MAPE || 0).replace('%', '')),
      item_mae: pred.MAE || pred.item_mae || 0
    }));

  return {
    metrics: {
      MAPE: parseFloat(String(metrics.MAPE || 0).replace('%', '')),
      MAE: metrics.MAE || 0,
      DaysPredict: metrics.DaysPredict || 0
    },
    predictions
  };
}

/**
 * Validate ML service response
 */
export function validateMLResponse(response: any): {
  valid: boolean;
  error?: string;
} {
  if (!Array.isArray(response)) {
    return { valid: false, error: 'Response must be an array' };
  }

  if (response.length === 0) {
    return { valid: false, error: 'Response cannot be empty' };
  }

  const metrics = response[0];
  if (!metrics.MAPE || !metrics.MAE || !metrics.DaysPredict) {
    return { valid: false, error: 'First element must contain metrics (MAPE, MAE, DaysPredict)' };
  }

  return { valid: true };
}

/**
 * Transform operations data to ML service payload format
 */
export function transformMLPayload(operations: any[], daysCount: number): {
  DaysCount: number;
  events: any[];
} {
  const events = operations.map(op => ({
    Type: op.operation_type === 'sale' ? 'Продажа' : 'Поставка',
    Период: op.operation_date,
    Номенклатура: op.product_id,
    Код: op.product_id,
    Количество: op.quantity,
    Цена: op.cost_price || 100.0
  }));

  return {
    DaysCount: daysCount,
    events
  };
}
