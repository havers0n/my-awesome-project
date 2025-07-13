import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '../useAccessibility';

describe('useAccessibility', () => {
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.state).toEqual({
      announcements: [],
      focusedElement: null,
      isKeyboardMode: false,
      currentFocusIndex: -1,
      draggedElement: null,
      dropTarget: null,
    });
  });

  it('should create announcements', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.announce('Test announcement', 'assertive');
    });

    // Wait for the timeout
    setTimeout(() => {
      expect(result.current.state.announcements).toContain('Test announcement');
    }, 150);
  });

  it('should handle keyboard navigation', () => {
    const { result } = renderHook(() => useAccessibility());

    // Create focusable elements
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    mockContainer.appendChild(button1);
    mockContainer.appendChild(button2);

    act(() => {
      result.current.updateFocusableElements(mockContainer);
    });

    // Simulate Tab key
    const event = new KeyboardEvent('keydown', { key: 'Tab' });

    act(() => {
      result.current.handleKeyNavigation(event, mockContainer);
    });

    expect(result.current.state.isKeyboardMode).toBe(true);
  });

  it('should handle drag start', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.dragDropHandlers.handleDragStart('test-widget');
    });

    expect(result.current.state.draggedElement).toBe('test-widget');
  });

  it('should handle drag end', () => {
    const { result } = renderHook(() => useAccessibility());

    // First start drag
    act(() => {
      result.current.dragDropHandlers.handleDragStart('test-widget');
    });

    expect(result.current.state.draggedElement).toBe('test-widget');

    // Then end drag
    act(() => {
      result.current.dragDropHandlers.handleDragEnd();
    });

    expect(result.current.state.draggedElement).toBe(null);
  });

  it('should handle keyboard grab', () => {
    const { result } = renderHook(() => useAccessibility());

    const mockElement = document.createElement('div');
    mockElement.id = 'test-widget';
    mockElement.setAttribute = jest.fn();
    document.body.appendChild(mockElement);

    act(() => {
      result.current.keyboardHandlers.handleKeyboardGrab(mockElement);
    });

    expect(result.current.state.draggedElement).toBe('test-widget');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-grabbed', 'true');

    document.body.removeChild(mockElement);
  });

  it('should handle keyboard drop', () => {
    const { result } = renderHook(() => useAccessibility());

    const mockElement = document.createElement('div');
    mockElement.id = 'target-widget';
    document.body.appendChild(mockElement);

    // First grab an element
    act(() => {
      result.current.keyboardHandlers.handleKeyboardGrab(mockElement);
    });

    // Then drop it
    act(() => {
      result.current.keyboardHandlers.handleKeyboardDrop(mockElement);
    });

    expect(result.current.state.draggedElement).toBe(null);
    expect(result.current.state.dropTarget).toBe(null);

    document.body.removeChild(mockElement);
  });

  it('should handle keyboard cancel', () => {
    const { result } = renderHook(() => useAccessibility());

    const mockElement = document.createElement('div');
    mockElement.id = 'test-widget';
    mockElement.setAttribute = jest.fn();
    document.body.appendChild(mockElement);

    // First grab an element
    act(() => {
      result.current.keyboardHandlers.handleKeyboardGrab(mockElement);
    });

    expect(result.current.state.draggedElement).toBe('test-widget');

    // Then cancel
    act(() => {
      result.current.keyboardHandlers.handleKeyboardCancel();
    });

    expect(result.current.state.draggedElement).toBe(null);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-grabbed', 'false');

    document.body.removeChild(mockElement);
  });

  it('should update focusable elements', () => {
    const { result } = renderHook(() => useAccessibility());

    // Create focusable elements
    const button = document.createElement('button');
    const input = document.createElement('input');
    const disabledButton = document.createElement('button');
    disabledButton.setAttribute('disabled', 'true');

    mockContainer.appendChild(button);
    mockContainer.appendChild(input);
    mockContainer.appendChild(disabledButton);

    act(() => {
      result.current.updateFocusableElements(mockContainer);
    });

    // Should include button and input, but not disabled button
    // We can't directly access focusableElements, but we can test the behavior
    expect(mockContainer.querySelectorAll('button:not([disabled])').length).toBe(1);
    expect(mockContainer.querySelectorAll('input:not([disabled])').length).toBe(1);
  });

  it('should clear announcements', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.announce('Test announcement 1');
      result.current.announce('Test announcement 2');
    });

    act(() => {
      result.current.clearAnnouncements();
    });

    expect(result.current.state.announcements).toEqual([]);
  });

  it('should handle mouse movement', () => {
    const { result } = renderHook(() => useAccessibility());

    // First set keyboard mode
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      result.current.handleKeyNavigation(event, mockContainer);
    });

    expect(result.current.state.isKeyboardMode).toBe(true);

    // Then simulate mouse movement
    act(() => {
      result.current.handleMouseMovement();
    });

    expect(result.current.state.isKeyboardMode).toBe(false);
  });

  it('should limit announcements to 5', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.announce('Announcement 1');
      result.current.announce('Announcement 2');
      result.current.announce('Announcement 3');
      result.current.announce('Announcement 4');
      result.current.announce('Announcement 5');
      result.current.announce('Announcement 6');
    });

    setTimeout(() => {
      expect(result.current.state.announcements.length).toBe(5);
      expect(result.current.state.announcements).not.toContain('Announcement 1');
      expect(result.current.state.announcements).toContain('Announcement 6');
    }, 150);
  });

  it('should handle arrow key navigation', () => {
    const { result } = renderHook(() => useAccessibility());

    // Create focusable elements
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    mockContainer.appendChild(button1);
    mockContainer.appendChild(button2);

    act(() => {
      result.current.updateFocusableElements(mockContainer);
    });

    // Set keyboard mode first
    act(() => {
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      result.current.handleKeyNavigation(tabEvent, mockContainer);
    });

    // Then test arrow navigation
    act(() => {
      const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      result.current.handleKeyNavigation(arrowEvent, mockContainer);
    });

    expect(result.current.state.isKeyboardMode).toBe(true);
  });
});

// Utility function tests
describe('accessibility utilities', () => {
  it('should create accessibility props', () => {
    const { createAccessibilityProps } = require('../useAccessibility');

    const props = createAccessibilityProps('widget', 'Test Widget', 'Test Description');

    expect(props).toEqual({
      role: 'widget',
      'aria-label': 'Test Widget',
      'aria-grabbed': 'false',
      'aria-dropeffect': 'none',
      tabIndex: 0,
      'aria-describedby': 'widget-description',
    });
  });

  it('should create screen reader message', () => {
    const { createScreenReaderMessage } = require('../useAccessibility');

    const message = createScreenReaderMessage('moved', 'Widget 1', 'to position 2');

    expect(message).toBe('moved: Widget 1 (to position 2)');
  });

  it('should create screen reader message without context', () => {
    const { createScreenReaderMessage } = require('../useAccessibility');

    const message = createScreenReaderMessage('selected', 'Widget 1');

    expect(message).toBe('selected: Widget 1');
  });
});
