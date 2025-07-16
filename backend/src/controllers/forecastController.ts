import { Request, Response } from 'express';
import { ZodError } from 'zod';
import axios from 'axios';
import { getSupabaseUserClient } from '../supabaseUserClient';
import { formatPayloadForML } from '../utils/mlPayloadFormatter';
// import { createMlPayload } from '../services/mlPayloadFormatter'; // больше не используется
import { forecastInputSchema } from '../schemas/forecastSchema';
import { retryWithBackoff, classifyError, ConsoleErrorMonitor, DEFAULT_RETRY_CONFIG } from '../utils/errorHandling';
import { validateAndCleanMLPayload } from '../utils/dataValidation';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';

export const predictSales = async (req: Request, res: Response) => {
  const log = (message: string, data?: any) => {
    console.log(`[predictSales] ${new Date().toISOString()} - ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
  };
  const logError = (message: string, error: any) => {
    console.error(`[predictSales] ${new Date().toISOString()} - ERROR: ${message}`, error);
  };

  log('Execution started');
  log('Request body:', req.body);
  console.log('RAW BODY:', JSON.stringify(req.body));
  console.log('BODY TYPE:', typeof req.body);
  console.log('IS ARRAY:', Array.isArray(req.body));

  // @ts-ignore
  const user = (req as any).user;
  if (!user || !user.id) {
    logError('User not authenticated, no user object in request.', {});
    return res.status(401).json({ error: 'User not authenticated' });
  }
  log('Authenticated user found', { id: user.id, email: user.email, organization_id: user.organization_id });

  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      logError('Authorization header is missing.', {});
      return res.status(401).json({ error: 'Отсутствует заголовок Authorization' });
    }
    const userToken = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(userToken);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      logError('Invalid token, failed to get user from Supabase.', userError);
      return res.status(401).json({ error: 'Недействительный токен', details: userError });
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile) {
      logError('Failed to get user profile or profile is empty.', profileError);
      return res.status(400).json({
        error: 'Не удалось получить данные профиля пользователя',
        details: profileError?.message || 'Профиль не найден'
      });
    }

    const organizationId = profile.organization_id;
    if (!organizationId) {
      logError('Organization ID not found for user.', { userId: userData.user.id });
      return res.status(400).json({
        error: 'Не удалось определить организацию для текущего пользователя',
        details: 'Пользователь не привязан к организации'
      });
    }
    log('Successfully fetched organization ID', { organizationId });

    // Validate input - expecting only DaysCount
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

    // Use daysCount from the validated input
    const daysCount = parsedInput.DaysCount;
    log('Days to forecast', { daysCount });

    // Получаем операции из базы данных
    let operations;
    try {
      const { data: opsData, error: opsError } = await supabase
        .from('operations')
        .select('product_id, operation_type, quantity, operation_date, cost_price')
        .eq('organization_id', organizationId)
        .order('operation_date', { ascending: false });
      if (opsError) {
        logError('Failed to fetch operations from DB.', opsError);
        return res.status(500).json({ error: 'Ошибка получения операций', details: opsError.message });
      }
      operations = (opsData || []).map((op: any) => ({
        productId: op.product_id,
        type: op.operation_type === 'sale' ? 'Продажа' : 'Поставка',
        quantity: op.quantity,
        date: op.operation_date,
        price: op.cost_price
      }));
      log('Operations fetched and formatted.', { total: operations.length, sample: operations.slice(0,2) });
    } catch (err) {
      logError('Failed to fetch or format operations.', err);
      return res.status(500).json({ error: 'Ошибка подготовки операций', details: err instanceof Error ? err.message : String(err) });
    }

    // Формируем ML payload в новом формате для микросервиса
    let mlRequestData;
    try {
      // Преобразуем операции в формат событий для нового микросервиса
      const events = operations.map((op: any) => ({
        Type: op.type,
        Период: op.date,
        Номенклатура: op.productId,
        Код: op.productId, // Используем productId как код
        Количество: op.quantity,
        Цена: op.price || 100.0 // Цена по умолчанию если не указана
      }));

      mlRequestData = {
        DaysCount: daysCount,
        events: events
      };
      
      log('ML payload created in new format.', {
        daysCount: daysCount,
        eventsCount: events.length,
        sample: events.slice(0, 2)
      });
    } catch (err) {
      logError('Failed to format ML payload.', err);
      return res.status(500).json({ error: 'Ошибка подготовки данных для ML-сервиса', details: err instanceof Error ? err.message : String(err) });
    }
    
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
      if (integrationError.type === 'INVALID_PAYLOAD' && integrationError.validationErrors) {
        return res.status(400).json({
          error: 'ML service payload error',
          details: integrationError.validationErrors
        });
      }
      if (integrationError.type === 'UNSEEN_LABEL' && integrationError.correctionStrategy?.action) {
        log('Attempting auto-correction for unseen labels.');
        const correctedPayload = integrationError.correctionStrategy.action(integrationError, mlRequestData);
        // Retry with corrected payload
        try {
          predictions = await retryWithBackoff(async () => {
            const response = await axios.post(ML_SERVICE_URL, correctedPayload);
            return response.data;
          }, {
            ...DEFAULT_RETRY_CONFIG,
            onRetry: (attempt, error) => monitor.logRetry(attempt, error)
          });
          log('Successfully received response after auto-correction.', {
            itemCount: Array.isArray(predictions) ? predictions.length : 'N/A',
            metrics: Array.isArray(predictions) && predictions.length > 0 ? predictions[0] : 'N/A',
            firstPrediction: Array.isArray(predictions) && predictions.length > 1 ? predictions[1] : 'N/A'
          });
        } catch (retryErr) {
          const retryIntegrationError = classifyError(retryErr);
          monitor.logError(retryIntegrationError);
          return res.status(502).json({
            error: 'ML service unavailable after correction',
            details: retryIntegrationError.message
          });
        }
      }
      return res.status(502).json({
        error: 'ML service unavailable',
        details: integrationError.message
      });
    }

    const mlMetrics = predictions[0] || {};
    const mlProductPredictions = predictions.slice(1) || [];
    const metrics = {
      MAPE: parseFloat(String(mlMetrics.MAPE || 0).replace('%', '')),
      MAE: mlMetrics.MAE || 0,
      DaysPredict: mlMetrics.DaysPredict || daysCount
    };
    log('Parsed ML service response.', { metrics, predictionCount: mlProductPredictions.length });
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, code')
      .eq('organization_id', organizationId);

    if (productsError) {
      logError('Failed to fetch products for mapping.', productsError);
    }

    const productPredictions = mlProductPredictions.map((mlPred: any) => {
      const product = products?.find(p =>
        p.name === (mlPred.Номенклатура || mlPred.product_name) ||
        p.code === (mlPred.Код || mlPred.product_code) ||
        p.id === mlPred.Номенклатура // Также проверяем по ID, так как мы отправляем productId как Номенклатура
      );
      return {
        period_start: new Date().toISOString().slice(0, 10),
        period_end: new Date(Date.now() + daysCount * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        product_id: product?.id || null,
        item_mape: parseFloat(String(mlPred.MAPE || 0).replace('%', '')),
        item_mae: mlPred.MAE || 0,
        predicted_quantity: mlPred.Количество || mlPred.quantity || 0
      };
    }).filter((pred: any) => pred.product_id !== null);

    log('Mapped ML predictions to products.', { mappedCount: productPredictions.length, totalFromMl: mlProductPredictions.length });

    const { data: predictionRun, error: predictionRunError } = await supabase
      .from('prediction_runs')
      .insert({
        organization_id: organizationId,
        days_predicted: metrics.DaysPredict,
        overall_mape: metrics.MAPE,
        overall_mae: metrics.MAE,
        run_timestamp: new Date().toISOString()
      })
      .select('id')
      .single();

    if (predictionRunError) {
      logError('Failed to save prediction run.', predictionRunError);
    } else {
      log('Prediction run saved successfully.', { predictionRunId: predictionRun.id });

      const predictionDetails = productPredictions.map((pred: any) => ({
        prediction_run_id: predictionRun.id,
        product_id: pred.product_id,
        period_start: pred.period_start,
        period_end: pred.period_end,
        predicted_quantity: pred.predicted_quantity,
        item_mape: pred.item_mape,
        item_mae: pred.item_mae
      }));
      
      log('Saving prediction details.', { count: predictionDetails.length });
      const { error: predictionsError } = await supabase
        .from('predictions')
        .insert(predictionDetails);

      if (predictionsError) {
        logError('Failed to save prediction details.', predictionsError);
      } else {
        log('Prediction details saved successfully.');
      }
    }
    
    log('Execution finished, sending response to client.');
    res.json(predictions);
  } catch (err) {
    logError('An unhandled error occurred in predictSales.', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Ошибка прогнозирования', details: message });
  }
};

/**
 * Получение данных прогноза для отображения на странице
 */
export const getForecastData = async (req: Request, res: Response) => {
  console.log('=== getForecastData called ===');
  console.log('Query params:', req.query);
  console.log('USE_MOCK_ML:', process.env.USE_MOCK_ML);
  
  // Добавляем отладочную информацию
  console.log('req.user:', (req as any).user);
  console.log('req.user exists:', !!(req as any).user);
  console.log('Authorization header:', req.headers['authorization']);
  
  // MOCK ML shortcut for frontend QA
  if (process.env.USE_MOCK_ML === 'true') {
    return res.json({
      trend: {
        points: [
          { date: '2024-05-01', value: 120 },
          { date: '2024-05-02', value: 123 },
          { date: '2024-05-03', value: 130 }
        ]
      },
      topProducts: [
        { name: 'Молоко', amount: 140, colorClass: 'bg-green-500', barWidth: '80%' },
        { name: 'Хлеб', amount: 90, colorClass: 'bg-yellow-500', barWidth: '60%' },
        { name: 'Яблоки', amount: 60, colorClass: 'bg-red-500', barWidth: '40%' }
      ],
      history: {
        items: [
          { date: '2024-05-01 - 2024-05-07', product: 'Молоко', category: 'Общая', forecast: 140, accuracy: 'Высокая' },
          { date: '2024-05-01 - 2024-05-07', product: 'Хлеб', category: 'Общая', forecast: 90, accuracy: 'Средняя' },
          { date: '2024-05-01 - 2024-05-07', product: 'Яблоки', category: 'Общая', forecast: 60, accuracy: 'Высокая' }
        ],
        total: 3
      }
    });
  }
  try {
    // Получаем токен пользователя из заголовка
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Отсутствует заголовок Authorization' });
    }
    const userToken = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(userToken);

    // Получаем параметры запроса
    const days = parseInt(req.query.days as string) || 14;

    // Получаем данные пользователя
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Недействительный токен', details: userError });
    }

    // Получаем organization_id из таблицы users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single();
    if (profileError || !profile) {
      return res.status(500).json({ error: 'Не удалось получить данные профиля', details: profileError });
    }

    const organizationId = profile.organization_id;

    // Получаем последний прогноз из БД
    const { data: latestPredictionRun, error: predictionRunError } = await supabase
      .from('prediction_runs')
      .select('id, days_predicted, overall_mape, overall_mae, run_timestamp')
      .eq('organization_id', organizationId)
      .order('run_timestamp', { ascending: false })
      .limit(1)
      .single();

    if (predictionRunError && predictionRunError.code !== 'PGRST116') { // PGRST116 - не найдено
      return res.status(500).json({ error: 'Ошибка получения прогноза', details: predictionRunError });
    }

    // Если нет прогнозов, возвращаем пустые данные
    if (!latestPredictionRun) {
      return res.json({
        trend: { points: [] },
        topProducts: [],
        history: { items: [], total: 0 }
      });
    }

    // Получаем детали прогноза с связанными продуктами
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select(`
        *,
        products(name, code)
      `)
      .eq('prediction_run_id', latestPredictionRun.id);

    if (predictionsError) {
      return res.status(500).json({ error: 'Ошибка получения деталей прогноза', details: predictionsError });
    }

    // Формируем данные тренда
    const trendPoints = predictions.map((pred: any) => ({
      date: pred.period_start,
      value: pred.predicted_quantity
    }));

    // Формируем топ продуктов
    const topProducts = predictions
      .sort((a: any, b: any) => b.predicted_quantity - a.predicted_quantity)
      .slice(0, 3)
      .map((pred: any, index: any) => ({
        name: pred.products?.name || 'Unknown',
        amount: pred.predicted_quantity,
        colorClass: ['bg-green-500', 'bg-yellow-500', 'bg-red-500'][index % 3],
        barWidth: ['80%', '60%', '40%'][index % 3]
      }));

    // Формируем историю прогнозов
    const historyItems = predictions.map((pred: any) => ({
      date: `${pred.period_start} - ${pred.period_end}`,
      product: pred.products?.name || 'Unknown',
      category: 'Общая', // В реальном проекте здесь будет категория из БД
      forecast: pred.predicted_quantity,
      accuracy: pred.item_mape < 5 ? 'Высокая' : pred.item_mape < 10 ? 'Средняя' : 'Низкая'
    }));

    // Возвращаем результат
    res.json({
      trend: { points: trendPoints },
      topProducts,
      history: {
        items: historyItems,
        total: historyItems.length
      }
    });
  } catch (err) {
    console.error('Ошибка получения данных прогноза:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Ошибка получения данных прогноза', details: message });
  }
};

/**
 * Получение истории прогнозов с пагинацией и фильтрацией
 */
export const getForecastHistory = async (req: Request, res: Response) => {
  try {
    // Получаем токен пользователя из заголовка
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Отсутствует заголовок Authorization' });
    }
    const userToken = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(userToken);

    // Получаем параметры запроса
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const category = req.query.category as string || '';

    // Получаем данные пользователя
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Недействительный токен', details: userError });
    }

    // Получаем organization_id из таблицы users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single();
    if (profileError || !profile) {
      return res.status(500).json({ error: 'Не удалось получить данные профиля', details: profileError });
    }

    const organizationId = profile.organization_id;

    // Формируем запрос с фильтрами
    let query = supabase
      .from('predictions')
      .select(`
        *,
        products(name, code)
      `, { count: 'exact' });

    // Добавляем фильтр по поиску
    if (search) {
      query = query.ilike('products.name', `%${search}%`);
    }

    // Добавляем фильтр по категории (в реальном проекте)
    // if (category) {
    //   query = query.eq('category', category);
    // }

    // Добавляем пагинацию
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('period_start', { ascending: false });

    // Выполняем запрос
    const { data: predictions, error: predictionsError, count } = await query;

    if (predictionsError) {
      return res.status(500).json({ error: 'Ошибка получения истории прогнозов', details: predictionsError });
    }

    // Формируем историю прогнозов
    const historyItems = predictions.map((pred: any) => ({
      date: `${pred.period_start} - ${pred.period_end}`,
      product: pred.products?.name || 'Unknown',
      category: 'Общая', // В реальном проекте здесь будет категория из БД
      forecast: pred.predicted_quantity,
      accuracy: pred.item_mape < 5 ? 'Высокая' : pred.item_mape < 10 ? 'Средняя' : 'Низкая'
    }));

    // Возвращаем результат
    res.json({
      items: historyItems,
      total: count || historyItems.length
    });
  } catch (err) {
    console.error('Ошибка получения истории прогнозов:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Ошибка получения истории прогнозов', details: message });
  }
};

// Определяем интерфейс для объекта предсказания, чтобы избежать неявного 'any'
interface Prediction {
  item_mape?: number | null;
  item_mae?: number | null;
  predicted_quantity?: number;
  created_at?: string;
  [key: string]: any; // Позволяет другие поля, если они есть
}

// GET /metrics - получить общие метрики прогнозирования
export const getOverallMetrics = async (req: Request, res: Response) => {
  const log = (message: string, data?: any) => {
    console.log(`[getOverallMetrics] ${new Date().toISOString()} - ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
  };
  const logError = (message: string, error: any) => {
    console.error(`[getOverallMetrics] ${new Date().toISOString()} - ERROR: ${message}`, error);
  };

  try {
    // @ts-ignore
    const user = (req as any).user;
    if (!user || !user.id) {
      logError('User not authenticated', {});
      return res.status(401).json({ error: 'User not authenticated' });
    }

    log('Authenticated user', { id: user.id, email: user.email });

    // Get the authorization token from the request header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      logError('Authorization header is missing', {});
      return res.status(401).json({ error: 'Authorization header is missing' });
    }
    const userToken = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(userToken);

    // Get user profile to determine organization_id
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.organization_id) {
      logError('Failed to get user profile or organization_id', profileError);
      return res.status(400).json({
        error: 'Failed to get user profile or organization_id',
        details: profileError?.message || 'Profile not found or no organization associated'
      });
    }

    const organizationId = profile.organization_id;
    log('Getting overall metrics for organization', { organizationId });

    // First, try to get data from prediction_runs table (most likely to have organization_id)
    const { data: predictionRuns, error: runsError } = await supabase
      .from('prediction_runs')
      .select('id, overall_mape, overall_mae, run_timestamp')
      .eq('organization_id', organizationId)
      .order('run_timestamp', { ascending: false })
      .limit(100);

    if (runsError) {
      logError('Error querying prediction_runs table', runsError);
      // Don't return error yet, try other tables
    }

    // If we have prediction runs, get the associated predictions
    let predictions: Prediction[] = [];
    let lastUpdated = new Date().toISOString();
    
    if (predictionRuns && predictionRuns.length > 0) {
      log('Found prediction runs', { count: predictionRuns.length });
      lastUpdated = predictionRuns[0].run_timestamp;
      
      // Get all prediction run IDs
      const runIds = predictionRuns.map(run => run.id);
      
      // Get predictions for these runs
      const { data: predictionDetails, error: predictionsError } = await supabase
        .from('predictions')
        .select('item_mape, item_mae, predicted_quantity, period_start, period_end')
        .in('prediction_run_id', runIds)
        .order('period_start', { ascending: false });
      
      if (!predictionsError && predictionDetails && predictionDetails.length > 0) {
        log('Found predictions', { count: predictionDetails.length });
        predictions = predictionDetails;
      } else {
        // If no predictions found, use the metrics from prediction_runs
        log('No prediction details found, using metrics from prediction_runs');
        predictions = predictionRuns.map(run => ({
          item_mape: run.overall_mape,
          item_mae: run.overall_mae,
          predicted_quantity: 0,
          created_at: run.run_timestamp
        }));
      }
    } else {
      // If no prediction_runs, try the legacy sales_forecasts table as a last resort
      log('No prediction runs found, trying sales_forecasts table');
      const { data: forecasts, error: forecastsError } = await supabase
        .from('sales_forecasts')
        .select('item_mape, item_mae, predicted_quantity, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (!forecastsError && forecasts && forecasts.length > 0) {
        log('Found forecasts in legacy table', { count: forecasts.length });
        predictions = forecasts;
        lastUpdated = forecasts[0].created_at;
      } else {
        log('No forecast data found in any table');
      }
    }

    // If no data found in any table, return default metrics
    if (predictions.length === 0) {
      log('No metrics data found, returning default metrics');
      return res.json({
        totalPredictions: 0,
        averageAccuracy: 0,
        lastUpdated: lastUpdated,
        avgMAPE: 0,
        avgMAE: 0,
        accuracyTrend: 'stable',
        predictionCount: 0
      });
    }

    // Calculate metrics
    const totalPredictions = predictions.length;
    const avgMAPE = predictions.reduce((sum, pred) => sum + (pred.item_mape || 0), 0) / totalPredictions;
    const avgMAE = predictions.reduce((sum, pred) => sum + (pred.item_mae || 0), 0) / totalPredictions;
    const averageAccuracy = Math.max(0, 100 - avgMAPE); // Convert MAPE to accuracy

    // Calculate trend
    let accuracyTrend = 'stable';
    if (predictions.length >= 20) {
      const recent10 = predictions.slice(0, 10);
      const previous10 = predictions.slice(10, 20);
      const recentAvgMAPE = recent10.reduce((sum, pred) => sum + (pred.item_mape || 0), 0) / 10;
      const previousAvgMAPE = previous10.reduce((sum, pred) => sum + (pred.item_mape || 0), 0) / 10;
      
      if (recentAvgMAPE < previousAvgMAPE - 2) {
        accuracyTrend = 'improving';
      } else if (recentAvgMAPE > previousAvgMAPE + 2) {
        accuracyTrend = 'declining';
      }
    }

    const metrics = {
      totalPredictions,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      lastUpdated,
      avgMAPE: Math.round(avgMAPE * 100) / 100,
      avgMAE: Math.round(avgMAE * 100) / 100,
      accuracyTrend,
      predictionCount: totalPredictions
    };

    log('Overall metrics calculated successfully', metrics);
    res.json(metrics);
    
  } catch (err) {
    logError('Error getting overall metrics', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Error getting overall metrics', details: message });
  }
};