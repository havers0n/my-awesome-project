import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import { produce } from "immer";
import debounce from "lodash.debounce";
import {
  saveLayoutToIndexedDB,
  loadLayoutFromIndexedDB,
  isIndexedDBSupported,
  migrateFromLocalStorage,
} from "@/shared/lib/indexedDB";

export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component: string;
  props?: Record<string, any>;
  static?: boolean;
  resizable?: boolean;
  draggable?: boolean;
}

export interface LayoutState {
  layout: LayoutItem[];
  history: LayoutItem[][];
  currentIndex: number;
  maxHistorySize: number;
  isDirty: boolean;
  lastSaved: number;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  error: string | null;
}

export interface LayoutActions {
  // Layout management
  updateLayout: (layout: LayoutItem[]) => void;
  addItem: (item: LayoutItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<LayoutItem>) => void;

  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;

  // Persistence
  save: () => Promise<void>;
  load: () => Promise<void>;
  autoSave: () => void;

  // Sync
  sync: () => Promise<void>;
  setSyncStatus: (status: LayoutState['syncStatus']) => void;
  setError: (error: string | null) => void;

  // Utility
  markClean: () => void;
  reset: () => void;
}

const initialState: LayoutState = {
  layout: [],
  history: [[]],
  currentIndex: 0,
  maxHistorySize: 50,
  isDirty: false,
  lastSaved: Date.now(),
  syncStatus: 'idle',
  error: null,
};

const STORAGE_KEY = 'dashboard-layout';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const useLayoutStore = create<LayoutState & LayoutActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // Layout management
      updateLayout: (layout: LayoutItem[]) => {
        set(state => {
          state.layout = layout;
          state.isDirty = true;

          // Add to history
          const newHistory = state.history.slice(0, state.currentIndex + 1);
          newHistory.push(layout);

          if (newHistory.length > state.maxHistorySize) {
            newHistory.shift();
          } else {
            state.currentIndex++;
          }

          state.history = newHistory;
        });
      },

      addItem: (item: LayoutItem) => {
        set(state => {
          const newLayout = [...state.layout, item];
          state.layout = newLayout;
          state.isDirty = true;

          // Add to history
          const newHistory = state.history.slice(0, state.currentIndex + 1);
          newHistory.push(newLayout);

          if (newHistory.length > state.maxHistorySize) {
            newHistory.shift();
          } else {
            state.currentIndex++;
          }

          state.history = newHistory;
        });
      },

      removeItem: (id: string) => {
        set(state => {
          const newLayout = state.layout.filter(item => item.id !== id);
          state.layout = newLayout;
          state.isDirty = true;

          // Add to history
          const newHistory = state.history.slice(0, state.currentIndex + 1);
          newHistory.push(newLayout);

          if (newHistory.length > state.maxHistorySize) {
            newHistory.shift();
          } else {
            state.currentIndex++;
          }

          state.history = newHistory;
        });
      },

      updateItem: (id: string, updates: Partial<LayoutItem>) => {
        set(state => {
          const newLayout = state.layout.map(item =>
            item.id === id ? { ...item, ...updates } : item
          );
          state.layout = newLayout;
          state.isDirty = true;

          // Add to history
          const newHistory = state.history.slice(0, state.currentIndex + 1);
          newHistory.push(newLayout);

          if (newHistory.length > state.maxHistorySize) {
            newHistory.shift();
          } else {
            state.currentIndex++;
          }

          state.history = newHistory;
        });
      },

      // History management
      undo: () => {
        set(state => {
          if (state.currentIndex > 0) {
            state.currentIndex--;
            state.layout = state.history[state.currentIndex];
            state.isDirty = true;
          }
        });
      },

      redo: () => {
        set(state => {
          if (state.currentIndex < state.history.length - 1) {
            state.currentIndex++;
            state.layout = state.history[state.currentIndex];
            state.isDirty = true;
          }
        });
      },

      canUndo: () => {
        const state = get();
        return state.currentIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.currentIndex < state.history.length - 1;
      },

      clearHistory: () => {
        set(state => {
          state.history = [state.layout];
          state.currentIndex = 0;
        });
      },

      // Persistence
      save: async () => {
        const state = get();
        try {
          const data = {
            layout: state.layout,
            timestamp: Date.now(),
          };

          // Try IndexedDB first, fallback to localStorage
          if (isIndexedDBSupported()) {
            await saveLayoutToIndexedDB('default', state.layout);
          } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }

          set(state => {
            state.lastSaved = Date.now();
            state.isDirty = false;
          });
        } catch (error) {
          console.error('Failed to save layout:', error);
          set(state => {
            state.error = 'Failed to save layout';
          });
        }
      },

      load: async () => {
        try {
          let layout = null;

          // Try IndexedDB first
          if (isIndexedDBSupported()) {
            layout = await loadLayoutFromIndexedDB('default');

            // If no data in IndexedDB, try to migrate from localStorage
            if (!layout) {
              await migrateFromLocalStorage(STORAGE_KEY);
              layout = await loadLayoutFromIndexedDB('default');
            }
          }

          // Fallback to localStorage if IndexedDB is not supported or has no data
          if (!layout) {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
              const data = JSON.parse(savedData);
              layout = data.layout;
            }
          }

          if (layout) {
            set(state => {
              state.layout = layout;
              state.history = [layout];
              state.currentIndex = 0;
              state.isDirty = false;
              state.lastSaved = Date.now();
            });
          }
        } catch (error) {
          console.error('Failed to load layout:', error);
          set(state => {
            state.error = 'Failed to load layout';
          });
        }
      },

      autoSave: debounce(async () => {
        const state = get();
        if (state.isDirty) {
          await state.save();
        }
      }, 1000),

      // Sync
      sync: async () => {
        const state = get();
        set(state => {
          state.syncStatus = 'syncing';
        });

        try {
          const response = await fetch(`${BACKEND_URL}/api/layout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              layout: state.layout,
              timestamp: Date.now(),
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync with backend');
          }

          set(state => {
            state.syncStatus = 'success';
            state.error = null;
          });
        } catch (error) {
          console.error('Sync error:', error);
          set(state => {
            state.syncStatus = 'error';
            state.error = error instanceof Error ? error.message : 'Sync failed';
          });
        }
      },

      setSyncStatus: (status: LayoutState['syncStatus']) => {
        set(state => {
          state.syncStatus = status;
        });
      },

      setError: (error: string | null) => {
        set(state => {
          state.error = error;
        });
      },

      // Utility
      markClean: () => {
        set(state => {
          state.isDirty = false;
        });
      },

      reset: () => {
        set(state => {
          Object.assign(state, initialState);
        });
      },
    }))
  )
);

// Auto-save subscription
useLayoutStore.subscribe(
  state => state.layout,
  layout => {
    const store = useLayoutStore.getState();
    if (store.isDirty) {
      store.autoSave();
    }
  }
);
