// Drag & Drop UX Components Export

// Hooks
export { useDragDropUX, DragDropUXProvider, useDragDropUXContext } from '../../hooks/useDragDropUX';
export type { DragDropUXState, DragDropUXOptions } from '../../hooks/useDragDropUX';

// Components
export { default as DragPreview } from '../common/DragPreview';
export { WidgetDragPreview, FileDragPreview, ListItemDragPreview } from '../common/DragPreview';
export { default as EnhancedDropZone } from '../common/EnhancedDropZone';

// Configuration
export {
  useDndSensors,
  dndCollisionDetection,
  dndModifiers,
  dndSnapToGrid,
  dndAnimation,
  enhancedDragAnimations,
  springConfigs,
  hapticPatterns,
  soundFrequencies,
  cursorClasses,
  dragStateClasses,
  dropZoneClasses,
} from '../../config/dnd.config';

// Demo component
export { default as DragDropUXDemo } from '../examples/DragDropUXDemo';

// CSS classes utility functions
export const getDragClasses = (state: 'idle' | 'dragging' | 'not-allowed') => {
  const baseClasses = ['draggable'];

  switch (state) {
    case 'dragging':
      baseClasses.push('draggable--dragging');
      break;
    case 'not-allowed':
      baseClasses.push('draggable--not-allowed');
      break;
    default:
      baseClasses.push('draggable--idle');
  }

  return baseClasses.join(' ');
};

export const getDropZoneClasses = (state: 'idle' | 'active' | 'valid' | 'invalid') => {
  const baseClasses = ['drop-zone'];

  switch (state) {
    case 'active':
      baseClasses.push('drop-zone--active');
      break;
    case 'valid':
      baseClasses.push('drop-zone--valid');
      break;
    case 'invalid':
      baseClasses.push('drop-zone--invalid');
      break;
  }

  return baseClasses.join(' ');
};

export const getCursorClass = (state: 'grab' | 'grabbing' | 'not-allowed') => {
  switch (state) {
    case 'grab':
      return 'cursor-grab';
    case 'grabbing':
      return 'cursor-grabbing';
    case 'not-allowed':
      return 'cursor-not-allowed';
    default:
      return 'cursor-grab';
  }
};

// Utility functions
export const triggerHapticFeedback = (pattern: number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const createSoundFeedback = (frequency: number, duration: number = 0.1) => {
  if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }
};
