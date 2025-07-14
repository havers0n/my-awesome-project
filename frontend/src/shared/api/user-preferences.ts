import api from './index';

export interface SidebarPreferences {
  order: string[];
  hiddenItems: string[];
}

export interface UserPreferences {
  sidebar?: SidebarPreferences;
  theme?: string;
  language?: string;
  [key: string]: any;
}

const API_BASE_URL = '/user-preferences';

export const userPreferencesApi = {
  async get(): Promise<UserPreferences> {
    try {
      const response = await api.get(API_BASE_URL);
      return response.data.preferences || {};
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  },

  async save(preferences: UserPreferences): Promise<void> {
    try {
      await api.post(API_BASE_URL, { preferences });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  },

  async saveSidebar(order: string[], hiddenItems: string[]): Promise<void> {
    try {
      await api.post(`${API_BASE_URL}/sidebar`, { order, hiddenItems });
    } catch (error) {
      console.error('Error saving sidebar preferences:', error);
      throw error;
    }
  },

  async getSidebar(): Promise<SidebarPreferences> {
    try {
      const preferences = await this.get();
      return preferences.sidebar || { order: [], hiddenItems: [] };
    } catch (error) {
      console.error('Error fetching sidebar preferences:', error);
      return { order: [], hiddenItems: [] };
    }
  },
};

