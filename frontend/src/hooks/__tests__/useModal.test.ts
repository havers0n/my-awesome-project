import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from '../useModal';

describe('useModal', () => {
  it('должен инициализироваться с состоянием по умолчанию', () => {
    const { result } = renderHook(() => useModal());
    
    expect(result.current.isOpen).toBe(false);
  });

  it('должен инициализироваться с переданным начальным состоянием', () => {
    const { result } = renderHook(() => useModal(true));
    
    expect(result.current.isOpen).toBe(true);
  });

  it('должен открывать модальное окно', () => {
    const { result } = renderHook(() => useModal());
    
    act(() => {
      result.current.openModal();
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('должен закрывать модальное окно', () => {
    const { result } = renderHook(() => useModal(true));
    
    act(() => {
      result.current.closeModal();
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('должен переключать состояние модального окна', () => {
    const { result } = renderHook(() => useModal());
    
    // Изначально закрыто
    expect(result.current.isOpen).toBe(false);
    
    // Переключаем - должно открыться
    act(() => {
      result.current.toggleModal();
    });
    expect(result.current.isOpen).toBe(true);
    
    // Переключаем еще раз - должно закрыться
    act(() => {
      result.current.toggleModal();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('должен возвращать стабильные функции при ререндерах', () => {
    const { result, rerender } = renderHook(() => useModal());
    
    const firstOpenModal = result.current.openModal;
    const firstCloseModal = result.current.closeModal;
    const firstToggleModal = result.current.toggleModal;
    
    // Ререндерим
    rerender();
    
    // Функции должны остаться теми же (благодаря useCallback)
    expect(result.current.openModal).toBe(firstOpenModal);
    expect(result.current.closeModal).toBe(firstCloseModal);
    expect(result.current.toggleModal).toBe(firstToggleModal);
  });

  it('должен корректно работать при множественных вызовах', () => {
    const { result } = renderHook(() => useModal());
    
    // Открываем несколько раз подряд
    act(() => {
      result.current.openModal();
      result.current.openModal();
      result.current.openModal();
    });
    
    expect(result.current.isOpen).toBe(true);
    
    // Закрываем несколько раз подряд
    act(() => {
      result.current.closeModal();
      result.current.closeModal();
    });
    
    expect(result.current.isOpen).toBe(false);
  });
});
