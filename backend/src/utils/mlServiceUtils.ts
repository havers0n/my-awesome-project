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
