import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, XCircle, FileText, Image, Video, Music } from 'lucide-react';
import { useDragDropUX } from '../../hooks/useDragDropUX';

interface EnhancedDropZoneProps {
  onDrop: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  showPreview?: boolean;
  title?: string;
  subtitle?: string;
}

export default function EnhancedDropZone({
  onDrop,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  disabled = false,
  className = '',
  children,
  showPreview = true,
  title = 'Перетащите файлы сюда',
  subtitle = 'или нажмите для выбора',
}: EnhancedDropZoneProps) {
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isValid, setIsValid] = useState(true);

  const { state, handlers, helpers } = useDragDropUX({
    enableHapticFeedback: true,
    enableSounds: false,
  });

  const validateFiles = useCallback(
    (files: File[]) => {
      const errors: string[] = [];

      if (files.length > maxFiles) {
        errors.push(`Максимум ${maxFiles} файлов`);
      }

      files.forEach(file => {
        if (file.size > maxFileSize) {
          errors.push(`Файл ${file.name} слишком большой`);
        }

        const isTypeAccepted = acceptedTypes.some(type => {
          if (type.includes('*')) {
            return file.type.startsWith(type.replace('*', ''));
          }
          return file.type === type;
        });

        if (!isTypeAccepted) {
          errors.push(`Тип файла ${file.name} не поддерживается`);
        }
      });

      return errors;
    },
    [acceptedTypes, maxFileSize, maxFiles]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const errors = validateFiles(files);
      const valid = errors.length === 0;

      setIsValid(valid);
      setErrorMessage(errors.join(', '));
      setDraggedFiles(files);

      handlers.handleDragOver(valid);
    },
    [disabled, validateFiles, handlers]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      setDraggedFiles([]);
      setErrorMessage('');
      setIsValid(true);

      handlers.handleDragLeave();
    },
    [disabled, handlers]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const errors = validateFiles(files);

      if (errors.length === 0) {
        onDrop(files);
        handlers.handleDrop(true);
      } else {
        setErrorMessage(errors.join(', '));
        handlers.handleDrop(false);
      }

      setDraggedFiles([]);
      setIsValid(true);
    },
    [disabled, validateFiles, onDrop, handlers]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const errors = validateFiles(files);

      if (errors.length === 0) {
        onDrop(files);
      } else {
        setErrorMessage(errors.join(', '));
      }

      // Reset input
      e.target.value = '';
    },
    [validateFiles, onDrop]
  );

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        id="file-input"
        disabled={disabled}
      />

      {/* Main drop zone */}
      <motion.div
        className={`
          ${helpers.getDropZoneClasses()}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          relative overflow-hidden
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-8 min-h-[200px]">
          {children ? (
            children
          ) : (
            <>
              {/* Icon */}
              <motion.div
                className="mb-4"
                animate={
                  state.isDragging
                    ? {
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: state.isDragging ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                {state.isOver ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center
                      ${isValid ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}
                    `}
                  >
                    {isValid ? (
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    )}
                  </motion.div>
                ) : (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </motion.div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {state.isOver ? (isValid ? 'Отпустите для загрузки' : 'Недопустимые файлы') : title}
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                {state.isOver ? (isValid ? 'Файлы будут загружены' : errorMessage) : subtitle}
              </p>

              {/* Accepted types */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500">
                {acceptedTypes.map((type, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    {type}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* File preview during drag */}
        <AnimatePresence>
          {showPreview && draggedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-4 left-4 right-4 max-h-32 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3"
            >
              <div className="space-y-2">
                {draggedFiles.slice(0, 3).map((file, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    {getFileIcon(file)}
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
                {draggedFiles.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{draggedFiles.length - 3} файлов
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay */}
        {state.isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
              />
              <span>Обработка...</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
