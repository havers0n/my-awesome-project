import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import React from 'react';

export interface DragDropUXState {
  isDragging: boolean;
  isOver: boolean;
  draggedItem: any | null;
  dropZoneValid: boolean;
  cursorState: 'grab' | 'grabbing' | 'not-allowed';
}

export interface DragDropUXOptions {
  enableHapticFeedback?: boolean;
  enableSounds?: boolean;
  enableVisualFeedback?: boolean;
  animationDuration?: number;
}

export function useDragDropUX(options: DragDropUXOptions = {}) {
  const {
    enableHapticFeedback = true,
    enableSounds = false,
    enableVisualFeedback = true,
    animationDuration = 200,
  } = options;

  const [state, setState] = useState<DragDropUXState>({
    isDragging: false,
    isOver: false,
    draggedItem: null,
    dropZoneValid: true,
    cursorState: 'grab',
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastHapticTime = useRef<number>(0);

  // Haptic feedback function
  const triggerHapticFeedback = useCallback(
    (type: 'light' | 'medium' | 'heavy' = 'light') => {
      if (!enableHapticFeedback) return;

      const now = Date.now();
      // Throttle haptic feedback to avoid overwhelming the user
      if (now - lastHapticTime.current < 50) return;

      lastHapticTime.current = now;

      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [50],
          heavy: [100],
        };
        navigator.vibrate(patterns[type]);
      }
    },
    [enableHapticFeedback]
  );

  // Sound feedback function
  const triggerSoundFeedback = useCallback(
    (type: 'start' | 'end' | 'error' = 'start') => {
      if (!enableSounds) return;

      // Create audio context for generating tones
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const frequencies = {
          start: 800,
          end: 600,
          error: 400,
        };

        oscillator.frequency.value = frequencies[type];
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    },
    [enableSounds]
  );

  // Drag start handler
  const handleDragStart = useCallback(
    (item: any) => {
      setState(prev => ({
        ...prev,
        isDragging: true,
        draggedItem: item,
        cursorState: 'grabbing',
      }));

      triggerHapticFeedback('light');
      triggerSoundFeedback('start');

      // Add global drag class for body
      document.body.classList.add('dragging');
    },
    [triggerHapticFeedback, triggerSoundFeedback]
  );

  // Drag end handler
  const handleDragEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      draggedItem: null,
      cursorState: 'grab',
      isOver: false,
    }));

    triggerHapticFeedback('medium');
    triggerSoundFeedback('end');

    // Remove global drag class
    document.body.classList.remove('dragging');
  }, [triggerHapticFeedback, triggerSoundFeedback]);

  // Drag over handler
  const handleDragOver = useCallback((valid: boolean = true) => {
    setState(prev => ({
      ...prev,
      isOver: true,
      dropZoneValid: valid,
      cursorState: valid ? 'grabbing' : 'not-allowed',
    }));
  }, []);

  // Drag leave handler
  const handleDragLeave = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOver: false,
      dropZoneValid: true,
      cursorState: 'grabbing',
    }));
  }, []);

  // Drop handler
  const handleDrop = useCallback(
    (success: boolean = true) => {
      if (success) {
        triggerHapticFeedback('heavy');
        triggerSoundFeedback('end');
      } else {
        triggerHapticFeedback('medium');
        triggerSoundFeedback('error');
      }

      setState(prev => ({
        ...prev,
        isDragging: false,
        isOver: false,
        draggedItem: null,
        dropZoneValid: true,
        cursorState: 'grab',
      }));

      document.body.classList.remove('dragging');
    },
    [triggerHapticFeedback, triggerSoundFeedback]
  );

  // Get cursor class based on state
  const getCursorClass = useCallback(() => {
    switch (state.cursorState) {
      case 'grab':
        return 'cursor-grab';
      case 'grabbing':
        return 'cursor-grabbing';
      case 'not-allowed':
        return 'cursor-not-allowed';
      default:
        return 'cursor-grab';
    }
  }, [state.cursorState]);

  // Get draggable classes
  const getDraggableClasses = useCallback(() => {
    const baseClasses = ['draggable'];

    if (state.isDragging) {
      baseClasses.push('draggable--dragging');
    } else if (state.cursorState === 'not-allowed') {
      baseClasses.push('draggable--not-allowed');
    } else {
      baseClasses.push('draggable--idle');
    }

    return baseClasses.join(' ');
  }, [state.isDragging, state.cursorState]);

  // Get drop zone classes
  const getDropZoneClasses = useCallback(() => {
    const baseClasses = ['drop-zone'];

    if (state.isOver) {
      if (state.dropZoneValid) {
        baseClasses.push('drop-zone--valid');
      } else {
        baseClasses.push('drop-zone--invalid');
      }
    } else if (state.isDragging) {
      baseClasses.push('drop-zone--active');
    }

    return baseClasses.join(' ');
  }, [state.isOver, state.isDragging, state.dropZoneValid]);

  // Animation helpers
  const getSpringConfig = useCallback(
    () => ({
      type: 'spring',
      damping: 25,
      stiffness: 300,
      duration: animationDuration / 1000,
    }),
    [animationDuration]
  );

  const getDragPreviewStyle = useCallback(
    () => ({
      transform: state.isDragging ? 'scale(0.95) rotate(2deg)' : 'scale(1) rotate(0deg)',
      transition: `transform ${animationDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
      opacity: state.isDragging ? 0.9 : 1,
    }),
    [state.isDragging, animationDuration]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('dragging');
    };
  }, []);

  return {
    state,
    handlers: {
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop,
    },
    helpers: {
      getCursorClass,
      getDraggableClasses,
      getDropZoneClasses,
      getSpringConfig,
      getDragPreviewStyle,
    },
    feedback: {
      triggerHapticFeedback,
      triggerSoundFeedback,
    },
  };
}

// Higher-order component for adding drag & drop UX
export function withDragDropUX<T extends object>(
  Component: React.ComponentType<T>,
  options?: DragDropUXOptions
) {
  return function DragDropUXWrapper(props: T) {
    const dragDropUX = useDragDropUX(options);

    return React.createElement(
      'div',
      { className: dragDropUX.helpers.getCursorClass() },
      React.createElement(Component, { ...props, dragDropUX })
    );
  };
}

// Context for sharing drag & drop state
export const DragDropUXContext = React.createContext<ReturnType<typeof useDragDropUX> | null>(null);

export function DragDropUXProvider({
  children,
  options,
}: {
  children: React.ReactNode;
  options?: DragDropUXOptions;
}) {
  const dragDropUX = useDragDropUX(options);

  return React.createElement(DragDropUXContext.Provider, { value: dragDropUX }, children);
}

export function useDragDropUXContext() {
  const context = useContext(DragDropUXContext);
  if (!context) {
    throw new Error('useDragDropUXContext must be used within a DragDropUXProvider');
  }
  return context;
}
