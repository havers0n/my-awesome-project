import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDragDropUX } from '../useDragDropUX';

// Mock для navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

// Mock для AudioContext
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    frequency: { value: 0 },
    type: 'sine',
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 0 },
  })),
  destination: {},
  currentTime: 0,
};

Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true,
});

describe('useDragDropUX', () => {
  beforeEach(() => {
    // Очищаем мокированные вызовы
    vi.clearAllMocks();

    // Очищаем классы body
    document.body.className = '';
  });

  it('должен инициализироваться с правильным состоянием по умолчанию', () => {
    const { result } = renderHook(() => useDragDropUX());

    expect(result.current.state).toEqual({
      isDragging: false,
      isOver: false,
      draggedItem: null,
      dropZoneValid: true,
      cursorState: 'grab',
    });
  });

  it('должен обновлять состояние при начале перетаскивания', () => {
    const { result } = renderHook(() => useDragDropUX());
    const testItem = { id: 'test', name: 'Test Item' };

    act(() => {
      result.current.handlers.handleDragStart(testItem);
    });

    expect(result.current.state.isDragging).toBe(true);
    expect(result.current.state.draggedItem).toBe(testItem);
    expect(result.current.state.cursorState).toBe('grabbing');
    expect(document.body.classList.contains('dragging')).toBe(true);
  });

  it('должен обновлять состояние при окончании перетаскивания', () => {
    const { result } = renderHook(() => useDragDropUX());
    const testItem = { id: 'test', name: 'Test Item' };

    act(() => {
      result.current.handlers.handleDragStart(testItem);
    });

    act(() => {
      result.current.handlers.handleDragEnd();
    });

    expect(result.current.state.isDragging).toBe(false);
    expect(result.current.state.draggedItem).toBe(null);
    expect(result.current.state.cursorState).toBe('grab');
    expect(result.current.state.isOver).toBe(false);
    expect(document.body.classList.contains('dragging')).toBe(false);
  });

  it('должен обновлять состояние при наведении на допустимую зону', () => {
    const { result } = renderHook(() => useDragDropUX());

    act(() => {
      result.current.handlers.handleDragOver(true);
    });

    expect(result.current.state.isOver).toBe(true);
    expect(result.current.state.dropZoneValid).toBe(true);
    expect(result.current.state.cursorState).toBe('grabbing');
  });

  it('должен обновлять состояние при наведении на недопустимую зону', () => {
    const { result } = renderHook(() => useDragDropUX());

    act(() => {
      result.current.handlers.handleDragOver(false);
    });

    expect(result.current.state.isOver).toBe(true);
    expect(result.current.state.dropZoneValid).toBe(false);
    expect(result.current.state.cursorState).toBe('not-allowed');
  });

  it('должен обновлять состояние при покидании зоны', () => {
    const { result } = renderHook(() => useDragDropUX());

    act(() => {
      result.current.handlers.handleDragOver(true);
    });

    act(() => {
      result.current.handlers.handleDragLeave();
    });

    expect(result.current.state.isOver).toBe(false);
    expect(result.current.state.dropZoneValid).toBe(true);
    expect(result.current.state.cursorState).toBe('grabbing');
  });

  it('должен обрабатывать успешное перетаскивание', () => {
    const { result } = renderHook(() => useDragDropUX());

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    act(() => {
      result.current.handlers.handleDrop(true);
    });

    expect(result.current.state.isDragging).toBe(false);
    expect(result.current.state.isOver).toBe(false);
    expect(result.current.state.draggedItem).toBe(null);
    expect(result.current.state.dropZoneValid).toBe(true);
    expect(result.current.state.cursorState).toBe('grab');
  });

  it('должен обрабатывать неуспешное перетаскивание', () => {
    const { result } = renderHook(() => useDragDropUX());

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    act(() => {
      result.current.handlers.handleDrop(false);
    });

    expect(result.current.state.isDragging).toBe(false);
    expect(result.current.state.isOver).toBe(false);
    expect(result.current.state.draggedItem).toBe(null);
  });

  it('должен возвращать правильные CSS классы для cursor', () => {
    const { result } = renderHook(() => useDragDropUX());

    expect(result.current.helpers.getCursorClass()).toBe('cursor-grab');

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    expect(result.current.helpers.getCursorClass()).toBe('cursor-grabbing');

    act(() => {
      result.current.handlers.handleDragOver(false);
    });

    expect(result.current.helpers.getCursorClass()).toBe('cursor-not-allowed');
  });

  it('должен возвращать правильные CSS классы для draggable элементов', () => {
    const { result } = renderHook(() => useDragDropUX());

    expect(result.current.helpers.getDraggableClasses()).toBe('draggable draggable--idle');

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    expect(result.current.helpers.getDraggableClasses()).toBe('draggable draggable--dragging');
  });

  it('должен возвращать правильные CSS классы для drop zones', () => {
    const { result } = renderHook(() => useDragDropUX());

    expect(result.current.helpers.getDropZoneClasses()).toBe('drop-zone');

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    expect(result.current.helpers.getDropZoneClasses()).toBe('drop-zone drop-zone--active');

    act(() => {
      result.current.handlers.handleDragOver(true);
    });

    expect(result.current.helpers.getDropZoneClasses()).toBe('drop-zone drop-zone--valid');

    act(() => {
      result.current.handlers.handleDragOver(false);
    });

    expect(result.current.helpers.getDropZoneClasses()).toBe('drop-zone drop-zone--invalid');
  });

  it('должен активировать haptic feedback, если включен', () => {
    const { result } = renderHook(() => useDragDropUX({ enableHapticFeedback: true }));

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    expect(navigator.vibrate).toHaveBeenCalledWith([10]);
  });

  it('не должен активировать haptic feedback, если выключен', () => {
    const { result } = renderHook(() => useDragDropUX({ enableHapticFeedback: false }));

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it('должен активировать звуковую обратную связь, если включена', () => {
    const { result } = renderHook(() => useDragDropUX({ enableSounds: true }));

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('должен возвращать правильную конфигурацию spring анимации', () => {
    const { result } = renderHook(() => useDragDropUX({ animationDuration: 300 }));

    const springConfig = result.current.helpers.getSpringConfig();

    expect(springConfig.type).toBe('spring');
    expect(springConfig.damping).toBe(25);
    expect(springConfig.stiffness).toBe(300);
    expect(springConfig.duration).toBe(0.3);
  });

  it('должен возвращать правильные стили preview', () => {
    const { result } = renderHook(() => useDragDropUX({ animationDuration: 200 }));

    const previewStyle = result.current.helpers.getDragPreviewStyle();
    expect(previewStyle.transform).toBe('scale(1) rotate(0deg)');
    expect(previewStyle.opacity).toBe(1);

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    const draggingPreviewStyle = result.current.helpers.getDragPreviewStyle();
    expect(draggingPreviewStyle.transform).toBe('scale(0.95) rotate(2deg)');
    expect(draggingPreviewStyle.opacity).toBe(0.9);
  });

  it('должен очищать класс dragging при размонтировании', () => {
    const { result, unmount } = renderHook(() => useDragDropUX());

    act(() => {
      result.current.handlers.handleDragStart({ id: 'test' });
    });

    expect(document.body.classList.contains('dragging')).toBe(true);

    unmount();

    expect(document.body.classList.contains('dragging')).toBe(false);
  });

  it('должен throttle haptic feedback', () => {
    const { result } = renderHook(() => useDragDropUX({ enableHapticFeedback: true }));

    act(() => {
      result.current.feedback.triggerHapticFeedback('light');
      result.current.feedback.triggerHapticFeedback('light');
      result.current.feedback.triggerHapticFeedback('light');
    });

    // Должен вызваться только один раз из-за throttling
    expect(navigator.vibrate).toHaveBeenCalledTimes(1);
  });

  it('должен генерировать разные паттерны вибрации для разных типов feedback', () => {
    const { result } = renderHook(() => useDragDropUX({ enableHapticFeedback: true }));

    act(() => {
      result.current.feedback.triggerHapticFeedback('light');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([10]);

    // Очищаем mock для следующего теста
    vi.clearAllMocks();

    act(() => {
      result.current.feedback.triggerHapticFeedback('medium');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([50]);

    vi.clearAllMocks();

    act(() => {
      result.current.feedback.triggerHapticFeedback('heavy');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([100]);
  });
});
