// backend/src/controllers/healthController.ts
import { Request, Response } from 'express';
import axios from 'axios';

// Конфигурация ML-микросервиса
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml-service:5678/forecast';

/**
 * Health check endpoint для проверки доступности всех сервисов
 */
export const healthCheck = async (req: Request, res: Response) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      backend: {
        status: 'healthy',
        message: 'Backend service is running'
      },
      ml_service: {
        status: 'unknown',
        message: 'Checking ML service availability...'
      }
    }
  };

  // Проверяем доступность ML сервиса
  try {
    const mlHealthUrl = ML_SERVICE_URL.replace('/forecast', '/health');
    const response = await axios.get(mlHealthUrl, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    healthStatus.services.ml_service = {
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      message: response.status === 200 ? 'ML service is available' : 'ML service returned non-200 status'
    };
  } catch (error) {
    healthStatus.services.ml_service = {
      status: 'unhealthy',
      message: axios.isAxiosError(error) 
        ? `ML service unavailable: ${error.message}` 
        : 'ML service check failed'
    };
    healthStatus.status = 'degraded';
  }

  // Определяем общий статус
  const overallStatus = Object.values(healthStatus.services).every(service => service.status === 'healthy') 
    ? 'healthy' 
    : 'degraded';

  healthStatus.status = overallStatus;

  // Возвращаем соответствующий HTTP код
  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
};

/**
 * Простой health check для проверки доступности backend
 */
export const simpleHealthCheck = async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Backend service is running'
  });
};

/**
 * Проверка доступности ML сервиса
 */
export const mlServiceHealthCheck = async (req: Request, res: Response) => {
  try {
    const mlHealthUrl = ML_SERVICE_URL.replace('/forecast', '/health');
    const response = await axios.get(mlHealthUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      status: 'healthy',
      ml_service: {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        url: mlHealthUrl,
        response_time: response.headers['x-response-time'] || 'N/A',
        message: 'ML service is available'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      ml_service: {
        status: 'unhealthy',
        url: ML_SERVICE_URL,
        message: axios.isAxiosError(error) 
          ? `ML service unavailable: ${error.message}` 
          : 'ML service check failed'
      },
      timestamp: new Date().toISOString()
    });
  }
};
