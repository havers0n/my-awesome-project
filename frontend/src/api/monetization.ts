import axios from 'axios';
import { API_BASE_URL } from '@/config';

// Types for monetization data
export interface MonetizationDetail {
  type: 'subscription' | 'savings_percentage' | 'pay_per_use';
  planName?: string;
  status?: string;
  expiresAt?: string;
  costPerPeriod?: string;
  renewalDate?: string;
  metricName?: string;
  currentSavings?: string;
  period?: string;
  commissionRate?: string;
  commissionAmount?: string;
  usage?: number;
  costPerUnit?: string;
  totalCost?: string;
}

export interface UserMonetizationResponse {
  userId: number;
  email: string;
  userRole: 'employee' | 'franchisee' | 'admin';
  monetizationDetails: MonetizationDetail[];
}

/**
 * Fetches monetization information for a specific user
 * @param userId - The ID of the user to fetch monetization details for
 * @returns Promise with the user's monetization information
 */
export const fetchUserMonetization = async (userId: number): Promise<UserMonetizationResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/monetization`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user monetization:', error);
    throw error;
  }
};

/**
 * Updates subscription settings for a user
 * @param userId - The ID of the user
 * @param subscriptionData - The updated subscription data
 * @returns Promise with the updated subscription information
 */
export const updateSubscriptionSettings = async (
  userId: number,
  subscriptionData: {
    planName: string;
    autoRenew: boolean;
    paymentMethod: string;
  }
): Promise<MonetizationDetail> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/users/${userId}/monetization/subscription`,
      subscriptionData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating subscription settings:', error);
    throw error;
  }
};

/**
 * Cancels a user's subscription
 * @param userId - The ID of the user
 * @returns Promise with the cancellation confirmation
 */
export const cancelSubscription = async (userId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/${userId}/monetization/subscription/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Fetches savings percentage details for a user
 * @param userId - The ID of the user
 * @param period - Optional period to filter by (e.g., 'Июнь 2025')
 * @returns Promise with the savings percentage details
 */
export const fetchSavingsPercentageDetails = async (
  userId: number,
  period?: string
): Promise<MonetizationDetail[]> => {
  try {
    const url = period
      ? `${API_BASE_URL}/api/users/${userId}/monetization/savings?period=${encodeURIComponent(period)}`
      : `${API_BASE_URL}/api/users/${userId}/monetization/savings`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching savings percentage details:', error);
    throw error;
  }
};

/**
 * Fetches pay-per-use details for a user
 * @param userId - The ID of the user
 * @param period - Optional period to filter by (e.g., 'Июнь 2025')
 * @returns Promise with the pay-per-use details
 */
export const fetchPayPerUseDetails = async (
  userId: number,
  period?: string
): Promise<MonetizationDetail[]> => {
  try {
    const url = period
      ? `${API_BASE_URL}/api/users/${userId}/monetization/pay-per-use?period=${encodeURIComponent(period)}`
      : `${API_BASE_URL}/api/users/${userId}/monetization/pay-per-use`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching pay-per-use details:', error);
    throw error;
  }
};

/**
 * Fetches all monetization details for a user
 * @param userId - The ID of the user
 * @returns Promise with all monetization details for the user
 */
export const fetchAllMonetizationDetails = async (userId: number): Promise<UserMonetizationResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/monetization/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all monetization details:', error);
    throw error;
  }
}; 