import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Move, Grip } from 'lucide-react';

interface DragPreviewProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isDragging: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function DragPreview({
  title,
  description,
  icon,
  isDragging,
  children,
  className = '',
  style = {},
}: DragPreviewProps) {
  if (!isDragging) return null;

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{
            opacity: 0.9,
            scale: 0.95,
            rotate: 2,
            transition: {
              type: 'spring',
              damping: 25,
              stiffness: 300,
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            rotate: 0,
            transition: {
              duration: 0.2,
            },
          }}
          className={`
            drag-preview
            pointer-events-none
            transform-gpu
            ${className}
          `}
          style={style}
        >
          {/* Preview Header */}
          <div className="drag-preview__header">
            <div className="drag-preview__title">
              {icon ? icon : <Move className="w-4 h-4" />}
              <span>{title}</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Grip className="w-3 h-3 opacity-60" />
              </motion.div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="drag-preview__content">
            {children ? (
              children
            ) : (
              <div>
                {description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    →
                  </motion.div>
                  <span>Перетаскивание...</span>
                </div>
              </div>
            )}
          </div>

          {/* Drag indicator dots */}
          <div className="absolute -top-2 -right-2 flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Specialized preview for widgets
export function WidgetDragPreview({
  widgetType,
  title,
  isDragging,
  className = '',
}: {
  widgetType: string;
  title: string;
  isDragging: boolean;
  className?: string;
}) {
  return (
    <DragPreview
      title={title}
      description={`Виджет: ${widgetType}`}
      isDragging={isDragging}
      className={className}
    >
      <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-1 flex items-center justify-center">
            <Move className="w-4 h-4 text-white" />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{widgetType}</div>
        </div>
      </div>
    </DragPreview>
  );
}

// Specialized preview for files
export function FileDragPreview({
  fileName,
  fileType,
  fileSize,
  isDragging,
  className = '',
}: {
  fileName: string;
  fileType: string;
  fileSize?: string;
  isDragging: boolean;
  className?: string;
}) {
  return (
    <DragPreview
      title={fileName}
      description={`${fileType}${fileSize ? ` • ${fileSize}` : ''}`}
      isDragging={isDragging}
      className={className}
      icon={
        <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">{fileType.charAt(0).toUpperCase()}</span>
        </div>
      }
    >
      <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded flex items-center justify-center">
          <span className="text-orange-600 dark:text-orange-400 font-semibold">
            {fileType.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {fileName}
          </div>
          {fileSize && <div className="text-xs text-gray-500 dark:text-gray-400">{fileSize}</div>}
        </div>
      </div>
    </DragPreview>
  );
}

// Generic list item preview
export function ListItemDragPreview({
  title,
  subtitle,
  isDragging,
  className = '',
}: {
  title: string;
  subtitle?: string;
  isDragging: boolean;
  className?: string;
}) {
  return (
    <DragPreview title={title} description={subtitle} isDragging={isDragging} className={className}>
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{title}</div>
          {subtitle && <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>}
        </div>
      </div>
    </DragPreview>
  );
}
