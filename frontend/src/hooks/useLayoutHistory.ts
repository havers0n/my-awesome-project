import { useCallback, useEffect } from 'react';
import { useLayoutStore } from '../store/layoutStore';
import type { LayoutItem } from '../store/layoutStore';

export interface UseLayoutHistoryReturn {
  layout: LayoutItem[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  updateLayout: (layout: LayoutItem[]) => void;
  addItem: (item: LayoutItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<LayoutItem>) => void;
  clearHistory: () => void;
  historySize: number;
  currentIndex: number;
}

export const useLayoutHistory = (): UseLayoutHistoryReturn => {
  const {
    layout,
    history,
    currentIndex,
    undo,
    redo,
    canUndo,
    canRedo,
    updateLayout,
    addItem,
    removeItem,
    updateItem,
    clearHistory,
  } = useLayoutStore();

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          if (canUndo()) {
            undo();
          }
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          event.preventDefault();
          if (canRedo()) {
            redo();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const wrappedUndo = useCallback(() => {
    if (canUndo()) {
      undo();
    }
  }, [canUndo, undo]);

  const wrappedRedo = useCallback(() => {
    if (canRedo()) {
      redo();
    }
  }, [canRedo, redo]);

  return {
    layout,
    undo: wrappedUndo,
    redo: wrappedRedo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    updateLayout,
    addItem,
    removeItem,
    updateItem,
    clearHistory,
    historySize: history.length,
    currentIndex,
  };
};
