import { useEffect, useCallback, useRef } from "react";
import { useLayoutStore } from "../store/layoutStore";

export interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onSave?: () => void;
  onError?: (error: Error) => void;
}

export interface UseAutoSaveReturn {
  save: () => Promise<void>;
  load: () => Promise<void>;
  isDirty: boolean;
  lastSaved: number;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  forceSave: () => Promise<void>;
}

export const useAutoSave = (options: UseAutoSaveOptions = {}): UseAutoSaveReturn => {
  const {
    enabled = true,
    interval = 5000, // 5 seconds
    onSave,
    onError,
  } = options;

  const { save, load, isDirty, lastSaved, error, setError } = useLayoutStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isEnabledRef = useRef(enabled);

  // Force save function
  const forceSave = useCallback(async () => {
    try {
      await save();
      onSave?.();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Save failed');
      setError(errorObj.message);
      onError?.(errorObj);
    }
  }, [save, onSave, onError, setError]);

  // Auto-save interval
  useEffect(() => {
    if (isEnabledRef.current) {
      intervalRef.current = setInterval(async () => {
        if (isDirty) {
          await forceSave();
        }
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDirty, interval, forceSave]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
        await forceSave();
      }
    };

    const handleUnload = async () => {
      if (isDirty) {
        await forceSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isDirty, forceSave]);

  // Handle visibility change (save when tab becomes hidden)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && isDirty) {
        await forceSave();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isDirty, forceSave]);

  // Error handling
  useEffect(() => {
    if (error && onError) {
      onError(new Error(error));
    }
  }, [error, onError]);

  const setEnabled = useCallback(
    (newEnabled: boolean) => {
      isEnabledRef.current = newEnabled;

      if (newEnabled) {
        // Restart interval if enabled
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(async () => {
          if (isDirty) {
            await forceSave();
          }
        }, interval);
      } else {
        // Clear interval if disabled
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    },
    [interval, isDirty, forceSave]
  );

  return {
    save: forceSave,
    load,
    isDirty,
    lastSaved,
    isEnabled: isEnabledRef.current,
    setEnabled,
    forceSave,
  };
};
