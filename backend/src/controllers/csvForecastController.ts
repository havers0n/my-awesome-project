import { Request, Response } from 'express';
import { ZodError } from 'zod';
import axios from 'axios';
import { loadCSVProducts, findProductByName } from '../utils/csvLoader';
import { forecastInputSchema } from '../schemas/forecastSchema';
import { retryWithBackoff, classifyError, ConsoleErrorMonitor, DEFAULT_RETRY_CONFIG } from '../utils/errorHandling';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000/predict';

export const predictSalesFromCSV = async (req: Request, res: Response) => {
  const log = (message: string, data?: any) => {
    console.log(`[predictSalesFromCSV] ${new Date().toISOString()} - ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
  };
  const logError = (message: string, error: any) => {
    console.error(`[predictSalesFromCSV] ${new Date().toISOString()} - ERROR: ${message}`, error);
  };

  log('Execution started');

  // @ts-ignore
  const user = (req as any).user;
  if (!user || !user.id) {
    logError('User not authenticated, no user object in request.', {});
    return res.status(401).json({ error: 'User not authenticated' });
  }
  log('Authenticated user found', { id: user.id, email: user.email, organization_id: user.organization_id });

  try {
    // Validate input
    let parsedInput;
    try {
      parsedInput = forecastInputSchema.parse(req.body);
      log('Input validation successful.', parsedInput);
    } catch (err) {
      if (err instanceof ZodError) {
        logError('Input validation failed.', err.errors);
        return res.status(400).json({ error: 'Invalid input', details: err.errors });
      }
      logError('An unexpected validation error occurred.', err);
      return res.status(400).json({ error: 'Validation error' });
    }

    const daysCount = parsedInput.DaysCount;
    log('Days to forecast', { daysCount });

    // Загружаем товары из CSV
    let csvProducts;
    try {
      csvProducts = await loadCSVProducts();
      log('CSV products loaded', { count: csvProducts.length });
    } catch (err) {
      logError('Failed to load CSV products.', err);
      return res.status(500).json({ error: 'Ошибка загрузки данных товаров', details: err instanceof Error ? err.message : String(err) });
    }

    // Формируем события для ML сервиса на основе CSV товаров
    const events = csvProducts.slice(0, 50).map((product, index) => ({
      Type: "Продажа",
      Период: new Date().toISOString().split('T')[0], // Текущая дата
      Номенклатура: product.Номенклатура,
      Код: product.Код || `CSV_${index}`,
      Количество: Math.floor(Math.random() * 10) + 1, // Случайное количество для демо
      Цена: 100.0 // Дефолтная цена
    }));

    const mlRequestData = {
      DaysCount: daysCount,
      events: events
    };
    
    log('ML payload created from CSV data.', {
      daysCount: daysCount,
      eventsCount: events.length,
      sample: events.slice(0, 2)
    });
    
    log('Sending payload to ML service.', { url: ML_SERVICE_URL });

    let predictions;
    const monitor = new ConsoleErrorMonitor();
    try {
      predictions = await retryWithBackoff(async () => {
        const response = await axios.post(ML_SERVICE_URL, mlRequestData);
        return response.data;
      }, {
        ...DEFAULT_RETRY_CONFIG,
        onRetry: (attempt, error) => monitor.logRetry(attempt, error)
      });
      log('Successfully received response from ML service.', {
        itemCount: Array.isArray(predictions) ? predictions.length : 'N/A',
        metrics: Array.isArray(predictions) && predictions.length > 0 ? predictions[0] : 'N/A',
        firstPrediction: Array.isArray(predictions) && predictions.length > 1 ? predictions[1] : 'N/A'
      });
    } catch (err) {
      const integrationError = classifyError(err);
      monitor.logError(integrationError);
      return res.status(502).json({
        error: 'ML service unavailable',
        details: integrationError.message
      });
    }

    // Форматируем ответ для фронтенда
    const formattedResponse = {
      success: true,
      message: 'Прогноз успешно сгенерирован на основе CSV данных',
      data: {
        daysCount: daysCount,
        totalProducts: csvProducts.length,
        predictions: predictions,
        source: 'CSV_ML_MODEL',
        timestamp: new Date().toISOString()
      }
    };

    log('Sending formatted response to frontend', formattedResponse);
    return res.json(formattedResponse);

  } catch (error) {
    logError('Unexpected error in predictSalesFromCSV', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Новый эндпоинт для получения товаров из CSV
export const getCSVProducts = async (req: Request, res: Response) => {
  const log = (message: string, data?: any) => {
    console.log(`[getCSVProducts] ${new Date().toISOString()} - ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
  };
  const logError = (message: string, error: any) => {
    console.error(`[getCSVProducts] ${new Date().toISOString()} - ERROR: ${message}`, error);
  };

  log('Execution started');

  try {
    // Загружаем товары из CSV
    const csvProducts = await loadCSVProducts();
    
    // Преобразуем в формат для фронтенда
    const formattedProducts = csvProducts.map((product, index) => ({
      product_id: index + 1,
      product_name: product.Номенклатура,
      sku: product.Код || `CSV_${index}`,
      code: product.Код || `CSV_${index}`,
      price: 100.0, // Дефолтная цена
      stock_by_location: {},
      category: "CSV Import",
      mape: product.MAPE,
      mae: product.MAE,
      rmse: product.RMSE,
      source: 'CSV_ML_MODEL'
    }));

    log('Products formatted and ready to send', { count: formattedProducts.length });

    return res.json({
      success: true,
      data: formattedProducts,
      pagination: {
        page: 1,
        limit: formattedProducts.length,
        total: formattedProducts.length
      },
      source: 'CSV_ML_MODEL',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logError('Failed to get CSV products', error);
    return res.status(500).json({
      error: 'Ошибка загрузки товаров из CSV',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Эндпоинт для получения метрик точности
export const getCSVMetrics = async (req: Request, res: Response) => {
  const log = (message: string, data?: any) => {
    console.log(`[getCSVMetrics] ${new Date().toISOString()} - ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
  };

  try {
    const csvProducts = await loadCSVProducts();
    
    // Вычисляем общие метрики
    const totalProducts = csvProducts.length;
    const avgMape = csvProducts.reduce((sum, p) => sum + p.MAPE, 0) / totalProducts;
    const avgMae = csvProducts.reduce((sum, p) => sum + p.MAE, 0) / totalProducts;
    const avgRmse = csvProducts.reduce((sum, p) => sum + p.RMSE, 0) / totalProducts;

    log('Metrics calculated', { totalProducts, avgMape, avgMae, avgRmse });

    return res.json({
      success: true,
      data: {
        totalProducts,
        avgMape: parseFloat(avgMape.toFixed(2)),
        avgMae: parseFloat(avgMae.toFixed(2)),
        avgRmse: parseFloat(avgRmse.toFixed(2)),
        source: 'CSV_ML_MODEL'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    log('Failed to get CSV metrics', error);
    return res.status(500).json({
      error: 'Ошибка получения метрик из CSV',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}; 