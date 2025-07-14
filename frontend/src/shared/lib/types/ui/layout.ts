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
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
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

export interface StoredLayout {
  id: string;
  layout: LayoutItem[];
  timestamp: number;
  version: number;
}

export interface WebSocketMessage {
  type: 'layout_update' | 'layout_sync' | 'ping' | 'pong';
  data?: any;
  timestamp?: number;
}

export interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

export interface SyncOptions {
  enabled?: boolean;
  wsUrl?: string;
  restUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onSync?: (layout: LayoutItem[]) => void;
}

export interface LayoutHistoryOptions {
  maxSize?: number;
  enableKeyboardShortcuts?: boolean;
}
