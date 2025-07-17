import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface FileUploadProgressProps {
  onFileUpload: (file: File) => Promise<unknown>;
  onUploadComplete?: (result: unknown) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // в байтах
  className?: string;
}

interface UploadState {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  filename?: string;
  error?: string;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  onFileUpload,
  onUploadComplete,
  onUploadError,
  acceptedTypes = ['.csv', '.xlsx', '.json'],
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    status: 'idle'
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.includes(extension)) {
      return `Неподдерживаемый тип файла. Разрешены: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize) {
      return `Файл слишком большой. Максимальный размер: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`;
    }
    
    return null;
  };

  const uploadFileWithProgress = async (file: File): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      // Отслеживание прогресса загрузки
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadState(prev => ({
            ...prev,
            progress: Math.round(percentComplete)
          }));
        }
      });

      // Обработка завершения загрузки
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve({ success: true, message: 'Файл успешно загружен' });
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Обработка ошибок
      xhr.addEventListener('error', () => {
        reject(new Error('Ошибка сети при загрузке файла'));
      });

      // Обработка отмены
      xhr.addEventListener('abort', () => {
        reject(new Error('Загрузка отменена'));
      });

      // Подготовка данных для отправки
      const formData = new FormData();
      formData.append('file', file);

      // Получение токена авторизации
      const raw = localStorage.getItem('sb-uxcsziylmyogvcqyyuiw-auth-token');
      let token = '';
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          token = parsed.access_token || '';
        } catch {
          token = raw;
        }
      }

      // Настройка заголовков
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Отправка файла
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState({
        progress: 0,
        status: 'error',
        filename: file.name,
        error: validationError
      });
      if (onUploadError) {
        onUploadError(validationError);
      }
      return;
    }

    setUploadState({
      progress: 0,
      status: 'uploading',
      filename: file.name
    });

    try {
      // Используем пользовательскую функцию загрузки, если она есть
      let result;
      if (onFileUpload) {
        result = await onFileUpload(file);
      } else {
        result = await uploadFileWithProgress(file);
      }

      setUploadState({
        progress: 100,
        status: 'success',
        filename: file.name
      });

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при загрузке';
      setUploadState({
        progress: 0,
        status: 'error',
        filename: file.name,
        error: errorMessage
      });

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    setUploadState({
      progress: 0,
      status: 'idle'
    });
  };

  const handleReset = () => {
    setUploadState({
      progress: 0,
      status: 'idle'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Upload className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : uploadState.status === 'error'
            ? 'border-red-300 bg-red-50'
            : uploadState.status === 'success'
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center">
            {getStatusIcon()}
          </div>

          {uploadState.status === 'idle' && (
            <div>
              <p className="text-lg font-medium text-gray-700">
                Перетащите файл сюда или{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  выберите файл
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Поддерживаемые форматы: {acceptedTypes.join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Максимальный размер: {(maxSize / (1024 * 1024)).toFixed(1)}MB
              </p>
            </div>
          )}

          {uploadState.status === 'uploading' && (
            <div className="w-full max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {uploadState.filename}
                </span>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ProgressBar
                value={uploadState.progress}
                max={100}
                size="md"
                color={uploadState.progress === 100 ? 'green' : 'blue'}
                showLabel={true}
                label="Загрузка файла"
                animated={true}
                className="mt-2"
              />
            </div>
          )}

          {uploadState.status === 'success' && (
            <div className="text-center">
              <p className="text-green-700 font-medium">
                ✅ Файл успешно загружен
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {uploadState.filename}
              </p>
              <button
                onClick={handleReset}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Загрузить другой файл
              </button>
            </div>
          )}

          {uploadState.status === 'error' && (
            <div className="text-center">
              <p className="text-red-700 font-medium">
                ❌ Ошибка загрузки
              </p>
              <p className="text-sm text-red-600 mt-1">
                {uploadState.error}
              </p>
              <button
                onClick={handleReset}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadProgress;
