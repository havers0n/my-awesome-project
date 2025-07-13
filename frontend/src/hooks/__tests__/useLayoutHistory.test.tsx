import { renderHook, act } from '@testing-library/react';
import { useLayoutHistory } from '../useLayoutHistory';
import { useLayoutStore } from '../../store/layoutStore';
import type { LayoutItem } from '../../store/layoutStore';

// Mock the store
vi.mock('../../store/layoutStore');

const mockStore = {
  layout: [],
  history: [[]],
  currentIndex: 0,
  undo: vi.fn(),
  redo: vi.fn(),
  canUndo: vi.fn(),
  canRedo: vi.fn(),
  updateLayout: vi.fn(),
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateItem: vi.fn(),
  clearHistory: vi.fn(),
};

(useLayoutStore as any).mockReturnValue(mockStore);

describe('useLayoutHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.canUndo.mockReturnValue(false);
    mockStore.canRedo.mockReturnValue(false);
  });

  afterEach(() => {
    // Remove all event listeners
    const listeners = (window as any)._listeners || [];
    listeners.forEach(({ type, handler }: any) => {
      window.removeEventListener(type, handler);
    });
  });

  it('should return layout history state and actions', () => {
    const { result } = renderHook(() => useLayoutHistory());

    expect(result.current).toMatchObject({
      layout: [],
      undo: expect.any(Function),
      redo: expect.any(Function),
      canUndo: false,
      canRedo: false,
      updateLayout: expect.any(Function),
      addItem: expect.any(Function),
      removeItem: expect.any(Function),
      updateItem: expect.any(Function),
      clearHistory: expect.any(Function),
      historySize: 1,
      currentIndex: 0,
    });
  });

  it('should handle undo action', () => {
    mockStore.canUndo.mockReturnValue(true);
    const { result } = renderHook(() => useLayoutHistory());

    act(() => {
      result.current.undo();
    });

    expect(mockStore.undo).toHaveBeenCalled();
  });

  it('should handle redo action', () => {
    mockStore.canRedo.mockReturnValue(true);
    const { result } = renderHook(() => useLayoutHistory());

    act(() => {
      result.current.redo();
    });

    expect(mockStore.redo).toHaveBeenCalled();
  });

  it('should not undo when canUndo is false', () => {
    mockStore.canUndo.mockReturnValue(false);
    const { result } = renderHook(() => useLayoutHistory());

    act(() => {
      result.current.undo();
    });

    expect(mockStore.undo).not.toHaveBeenCalled();
  });

  it('should not redo when canRedo is false', () => {
    mockStore.canRedo.mockReturnValue(false);
    const { result } = renderHook(() => useLayoutHistory());

    act(() => {
      result.current.redo();
    });

    expect(mockStore.redo).not.toHaveBeenCalled();
  });

  it('should handle keyboard shortcuts', () => {
    mockStore.canUndo.mockReturnValue(true);
    mockStore.canRedo.mockReturnValue(true);

    renderHook(() => useLayoutHistory());

    // Test Ctrl+Z (undo)
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: false,
      });
      window.dispatchEvent(event);
    });

    expect(mockStore.undo).toHaveBeenCalled();

    // Test Ctrl+Shift+Z (redo)
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(mockStore.redo).toHaveBeenCalled();
  });

  it('should handle layout updates', () => {
    const { result } = renderHook(() => useLayoutHistory());
    const newLayout: LayoutItem[] = [
      {
        id: '1',
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        component: 'TestComponent',
      },
    ];

    act(() => {
      result.current.updateLayout(newLayout);
    });

    expect(mockStore.updateLayout).toHaveBeenCalledWith(newLayout);
  });

  it('should handle adding items', () => {
    const { result } = renderHook(() => useLayoutHistory());
    const newItem: LayoutItem = {
      id: '1',
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      component: 'TestComponent',
    };

    act(() => {
      result.current.addItem(newItem);
    });

    expect(mockStore.addItem).toHaveBeenCalledWith(newItem);
  });

  it('should handle removing items', () => {
    const { result } = renderHook(() => useLayoutHistory());

    act(() => {
      result.current.removeItem('1');
    });

    expect(mockStore.removeItem).toHaveBeenCalledWith('1');
  });

  it('should handle updating items', () => {
    const { result } = renderHook(() => useLayoutHistory());
    const updates = { x: 5, y: 5 };

    act(() => {
      result.current.updateItem('1', updates);
    });

    expect(mockStore.updateItem).toHaveBeenCalledWith('1', updates);
  });

  it('should handle clearing history', () => {
    const { result } = renderHook(() => useLayoutHistory());

    act(() => {
      result.current.clearHistory();
    });

    expect(mockStore.clearHistory).toHaveBeenCalled();
  });
});
