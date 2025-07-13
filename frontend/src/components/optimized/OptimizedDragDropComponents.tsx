import React, { memo, useMemo, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragDropUX } from '../../hooks/useDragDropUX';

// Оптимизированные типы
interface OptimizedDraggableProps {
  id: string;
  children: React.ReactNode;
  data?: any;
  onDragStart?: (data: any) => void;
  onDragEnd?: () => void;
  className?: string;
  disabled?: boolean;
}

interface OptimizedDropZoneProps {
  id: string;
  children: React.ReactNode;
  onDrop?: (data: any) => void;
  onDragEnter?: (data: any) => void;
  onDragLeave?: () => void;
  accepts?: string[];
  className?: string;
  disabled?: boolean;
}

interface OptimizedDragPreviewProps {
  item: any;
  isVisible: boolean;
  position: { x: number; y: number };
  className?: string;
}

// Оптимизированный DragPreview с мемоизацией
const OptimizedDragPreview = memo<OptimizedDragPreviewProps>(
  ({ item, isVisible, position, className = '' }) => {
    const previewStyle = useMemo(
      () => ({
        position: 'fixed' as const,
        left: position.x,
        top: position.y,
        pointerEvents: 'none' as const,
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
      }),
      [position.x, position.y]
    );

    const animationVariants = useMemo(
      () => ({
        hidden: {
          opacity: 0,
          scale: 0.8,
          rotate: 0,
        },
        visible: {
          opacity: 0.9,
          scale: 0.95,
          rotate: 2,
          transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
          },
        },
      }),
      []
    );

    if (!isVisible || !item) return null;

    return (
      <motion.div
        style={previewStyle}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={animationVariants}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 ${className}`}
      >
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="font-medium text-gray-900 dark:text-white">
            {item.title || item.name || item.id}
          </span>
        </div>
        {item.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
        )}
      </motion.div>
    );
  }
);

OptimizedDragPreview.displayName = 'OptimizedDragPreview';

// Оптимизированный Draggable компонент
const OptimizedDraggable = memo<OptimizedDraggableProps>(
  ({ id, children, data, onDragStart, onDragEnd, className = '', disabled = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const { state, handlers, helpers } = useDragDropUX();
    const dragStartPosition = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;

        dragStartPosition.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);
        handlers.handleDragStart(data || { id });
        onDragStart?.(data || { id });
      },
      [disabled, data, id, handlers, onDragStart]
    );

    const handleMouseUp = useCallback(() => {
      if (isDragging) {
        setIsDragging(false);
        handlers.handleDragEnd();
        onDragEnd?.();
      }
    }, [isDragging, handlers, onDragEnd]);

    const draggableClasses = useMemo(() => {
      const baseClasses = ['select-none', 'transition-all', 'duration-200', 'ease-out', className];

      if (disabled) {
        baseClasses.push('opacity-50', 'cursor-not-allowed');
      } else {
        baseClasses.push(helpers.getCursorClass());
        if (isDragging) {
          baseClasses.push('scale-105', 'rotate-1', 'opacity-80', 'z-50');
        }
      }

      return baseClasses.join(' ');
    }, [disabled, isDragging, helpers, className]);

    const motionProps = useMemo(
      () => ({
        animate: isDragging
          ? {
              scale: 1.05,
              rotate: 1,
              opacity: 0.8,
              transition: { type: 'spring', damping: 20, stiffness: 300 },
            }
          : {
              scale: 1,
              rotate: 0,
              opacity: 1,
              transition: { type: 'spring', damping: 25, stiffness: 300 },
            },
      }),
      [isDragging]
    );

    return (
      <motion.div
        className={draggableClasses}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        draggable={false}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

OptimizedDraggable.displayName = 'OptimizedDraggable';

// Оптимизированная DropZone
const OptimizedDropZone = memo<OptimizedDropZoneProps>(
  ({
    id,
    children,
    onDrop,
    onDragEnter,
    onDragLeave,
    accepts = [],
    className = '',
    disabled = false,
  }) => {
    const [isOver, setIsOver] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const { state, handlers, helpers } = useDragDropUX();

    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        if (disabled) return;

        e.preventDefault();
        e.stopPropagation();

        const dragData = state.draggedItem;
        const canAccept = accepts.length === 0 || accepts.includes(dragData?.type);

        setIsOver(true);
        setIsValid(canAccept);

        handlers.handleDragOver(canAccept);
        onDragEnter?.(dragData);
      },
      [disabled, accepts, state.draggedItem, handlers, onDragEnter]
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent) => {
        if (disabled) return;

        e.preventDefault();
        e.stopPropagation();

        setIsOver(false);
        setIsValid(true);

        handlers.handleDragLeave();
        onDragLeave?.();
      },
      [disabled, handlers, onDragLeave]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        if (disabled) return;

        e.preventDefault();
        e.stopPropagation();

        const dragData = state.draggedItem;
        const canAccept = accepts.length === 0 || accepts.includes(dragData?.type);

        if (canAccept) {
          handlers.handleDrop(true);
          onDrop?.(dragData);
        } else {
          handlers.handleDrop(false);
        }

        setIsOver(false);
        setIsValid(true);
      },
      [disabled, accepts, state.draggedItem, handlers, onDrop]
    );

    const dropZoneClasses = useMemo(() => {
      const baseClasses = [
        'transition-all',
        'duration-200',
        'ease-out',
        'border-2',
        'border-dashed',
        'rounded-lg',
        'p-4',
        className,
      ];

      if (disabled) {
        baseClasses.push('opacity-50', 'cursor-not-allowed');
      } else if (isOver) {
        if (isValid) {
          baseClasses.push('border-green-400', 'bg-green-50', 'dark:bg-green-900/20', 'scale-102');
        } else {
          baseClasses.push('border-red-400', 'bg-red-50', 'dark:bg-red-900/20', 'scale-98');
        }
      } else if (state.isDragging) {
        baseClasses.push('border-blue-300', 'bg-blue-50', 'dark:bg-blue-900/20');
      } else {
        baseClasses.push(
          'border-gray-300',
          'dark:border-gray-600',
          'bg-gray-50',
          'dark:bg-gray-800'
        );
      }

      return baseClasses.join(' ');
    }, [disabled, isOver, isValid, state.isDragging, className]);

    const motionProps = useMemo(
      () => ({
        animate: isOver
          ? {
              scale: isValid ? 1.02 : 0.98,
              transition: { type: 'spring', damping: 20, stiffness: 300 },
            }
          : {
              scale: 1,
              transition: { type: 'spring', damping: 25, stiffness: 300 },
            },
      }),
      [isOver, isValid]
    );

    return (
      <motion.div
        className={dropZoneClasses}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        {...motionProps}
      >
        {children}
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isValid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isValid ? 'Отпустите для добавления' : 'Недопустимая зона'}
            </div>
          </div>
        )}
      </motion.div>
    );
  }
);

OptimizedDropZone.displayName = 'OptimizedDropZone';

// Оптимизированный список элементов
interface OptimizedListItemProps {
  item: any;
  index: number;
  onDragStart?: (item: any, index: number) => void;
  onDragEnd?: () => void;
  className?: string;
}

const OptimizedListItem = memo<OptimizedListItemProps>(
  ({ item, index, onDragStart, onDragEnd, className = '' }) => {
    const handleDragStart = useCallback(() => {
      onDragStart?.(item, index);
    }, [item, index, onDragStart]);

    const memoizedContent = useMemo(
      () => (
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {item.title || item.name}
            </div>
            {item.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {item.description}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
        </div>
      ),
      [item]
    );

    return (
      <OptimizedDraggable
        id={item.id}
        data={item}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        className={className}
      >
        {memoizedContent}
      </OptimizedDraggable>
    );
  }
);

OptimizedListItem.displayName = 'OptimizedListItem';

// Оптимизированный контейнер для списка
interface OptimizedListContainerProps {
  items: any[];
  onItemMove?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

const OptimizedListContainer = memo<OptimizedListContainerProps>(
  ({ items, onItemMove, className = '' }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = useCallback((item: any, index: number) => {
      setDraggedIndex(index);
    }, []);

    const handleDragEnd = useCallback(() => {
      setDraggedIndex(null);
    }, []);

    const handleDrop = useCallback(
      (draggedItem: any, targetIndex: number) => {
        if (draggedIndex !== null && draggedIndex !== targetIndex) {
          onItemMove?.(draggedIndex, targetIndex);
        }
      },
      [draggedIndex, onItemMove]
    );

    const memoizedItems = useMemo(
      () =>
        items.map((item, index) => (
          <OptimizedListItem
            key={item.id}
            item={item}
            index={index}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`${draggedIndex === index ? 'opacity-50' : ''}`}
          />
        )),
      [items, draggedIndex, handleDragStart, handleDragEnd]
    );

    return <div className={`space-y-2 ${className}`}>{memoizedItems}</div>;
  }
);

OptimizedListContainer.displayName = 'OptimizedListContainer';

// Основной оптимизированный DragDropProvider
interface OptimizedDragDropProviderProps {
  children: React.ReactNode;
  options?: {
    enableHapticFeedback?: boolean;
    enableSounds?: boolean;
    enableVisualFeedback?: boolean;
  };
}

const OptimizedDragDropProvider = memo<OptimizedDragDropProviderProps>(
  ({ children, options = {} }) => {
    const [dragState, setDragState] = useState({
      isDragging: false,
      draggedItem: null,
      position: { x: 0, y: 0 },
    });

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (dragState.isDragging) {
          setDragState(prev => ({
            ...prev,
            position: { x: e.clientX, y: e.clientY },
          }));
        }
      },
      [dragState.isDragging]
    );

    const contextValue = useMemo(
      () => ({
        ...dragState,
        setDragState,
        options,
      }),
      [dragState, options]
    );

    return (
      <div className="relative" onMouseMove={handleMouseMove}>
        {children}
        <AnimatePresence>
          {dragState.isDragging && (
            <OptimizedDragPreview
              item={dragState.draggedItem}
              isVisible={dragState.isDragging}
              position={dragState.position}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }
);

OptimizedDragDropProvider.displayName = 'OptimizedDragDropProvider';

export {
  OptimizedDraggable,
  OptimizedDropZone,
  OptimizedDragPreview,
  OptimizedListItem,
  OptimizedListContainer,
  OptimizedDragDropProvider,
};
