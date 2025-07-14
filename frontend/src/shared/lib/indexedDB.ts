import type { LayoutItem } from "../store/layoutStore";

const DB_NAME = 'DashboardLayoutDB';
const DB_VERSION = 1;
const STORE_NAME = 'layouts';

export interface StoredLayout {
  id: string;
  layout: LayoutItem[];
  timestamp: number;
  version: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  async saveLayout(id: string, layout: LayoutItem[]): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data: StoredLayout = {
      id,
      layout,
      timestamp: Date.now(),
      version: 1,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save layout'));
    });
  }

  async loadLayout(id: string): Promise<LayoutItem[] | null> {
    const db = await this.openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as StoredLayout;
        resolve(result ? result.layout : null);
      };

      request.onerror = () => reject(new Error('Failed to load layout'));
    });
  }

  async getAllLayouts(): Promise<StoredLayout[]> {
    const db = await this.openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all layouts'));
    });
  }

  async deleteLayout(id: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete layout'));
    });
  }

  async clearAllLayouts(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear layouts'));
    });
  }

  async getLayoutsByTimestamp(fromTimestamp: number): Promise<StoredLayout[]> {
    const db = await this.openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.lowerBound(fromTimestamp));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get layouts by timestamp'));
    });
  }
}

// Singleton instance
export const indexedDBManager = new IndexedDBManager();

// Helper functions for easier usage
export const saveLayoutToIndexedDB = async (id: string, layout: LayoutItem[]): Promise<void> => {
  try {
    await indexedDBManager.saveLayout(id, layout);
  } catch (error) {
    console.error('Failed to save layout to IndexedDB:', error);
    throw error;
  }
};

export const loadLayoutFromIndexedDB = async (id: string): Promise<LayoutItem[] | null> => {
  try {
    return await indexedDBManager.loadLayout(id);
  } catch (error) {
    console.error('Failed to load layout from IndexedDB:', error);
    return null;
  }
};

export const getAllLayoutsFromIndexedDB = async (): Promise<StoredLayout[]> => {
  try {
    return await indexedDBManager.getAllLayouts();
  } catch (error) {
    console.error('Failed to get all layouts from IndexedDB:', error);
    return [];
  }
};

// Check if IndexedDB is supported
export const isIndexedDBSupported = (): boolean => {
  return typeof indexedDB !== 'undefined';
};

// Migration helper for localStorage to IndexedDB
export const migrateFromLocalStorage = async (storageKey: string): Promise<void> => {
  if (!isIndexedDBSupported()) {
    return;
  }

  try {
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      const { layout } = JSON.parse(localData);
      await saveLayoutToIndexedDB('default', layout);

      // Optionally remove from localStorage after successful migration
      localStorage.removeItem(storageKey);
    }
  } catch (error) {
    console.error('Failed to migrate from localStorage to IndexedDB:', error);
  }
};
