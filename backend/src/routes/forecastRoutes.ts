import express from 'express';
import { getSupabaseUserClient } from '../supabaseUserClient';
import { createMlPayload } from '../services/mlPayloadFormatter';
import { supabaseAdmin } from '../supabaseAdminClient';
import { predictSales, getForecastData, getForecastHistory, getOverallMetrics } from '../controllers/forecastController';
import { dualAuthenticateToken } from '../middleware/dualAuthMiddleware';
import axios from 'axios';

const router = express.Router();

// POST /predict — предсказание продаж по данным и DaysCount
router.post('/predict', dualAuthenticateToken, predictSales as any);



// GET /forecast
router.get('/forecast', dualAuthenticateToken, getForecastData as any);

// GET /history
router.get('/history', dualAuthenticateToken, getForecastHistory as any);

// GET /metrics - получить общие метрики прогнозирования
router.get('/metrics', dualAuthenticateToken, getOverallMetrics as any);

// POST /bulk-upload (bulk upload продаж/поставок)
router.post('/bulk-upload', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }
    const userToken = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(userToken);

    // Получаем ID организации пользователя
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const { data: orgData, error: orgError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single();
    if (orgError) throw orgError;
    const organizationId = orgData.organization_id;

    // Валидация входных данных
    const { data } = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: 'Invalid data format. Expected non-empty array.' });
      return;
    }

    // Проверяем обязательные поля
    const requiredFields = ['Период', 'Номенклатура', 'Количество', 'Type'];
    const missingFields = data.some((item) => {
      return requiredFields.some((field) => !item[field]);
    });
    if (missingFields) {
      res.status(400).json({
        error: 'Missing required fields',
        requiredFields,
      });
      return;
    }

    // Преобразуем данные для вставки
    const forecasts = data.map((item) => ({
      organization_id: organizationId,
      forecast_date: item['Период'],
      product: item['Номенклатура'],
      category: item['Категория'] || null,
      forecast: item['Количество'],
      type: item['Type'],
      price: item['Цена'] || null,
      store_address: item['Адрес точки'] || null,
      out_of_stock: item['Заканчивался ли продукт'] || false,
      shelf_price: item['Цена на полке'] || null,
      store_hours: item['Часов работала точка'] || null,
      remaining_stock: item['Остаток в магазине'] || null,
      accuracy: Math.random().toFixed(2), // Заглушка для демо
    }));

    // Вставляем данные
    const { data: insertedData, error: insertError } = await supabase
      .from('forecasts')
      .insert(forecasts)
      .select();
    if (insertError) throw insertError;

    res.json({
      success: true,
      message: `Inserted ${insertedData.length} records`,
      data: insertedData,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Ошибка загрузки данных', details: message });
  }
});

// Тестовый маршрут для прогнозирования без аутентификации
router.post('/test-predict-no-auth', async (req: any, res: any) => {
  try {
    console.log('=== TEST predictSales called (no auth) ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Проверяем, что supabaseAdmin доступен
    console.log('supabaseAdmin type:', typeof supabaseAdmin);
    console.log('supabaseAdmin defined:', supabaseAdmin !== undefined);
    
    // Если supabaseAdmin не определен, создаем его заново
    let adminClient = supabaseAdmin;
    if (!adminClient) {
      console.log('Creating new supabase admin client...');
      const { createClient } = require('@supabase/supabase-js');
      adminClient = createClient(
        process.env.SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
    }
    
    // Используем организацию 1 для тестирования
    const organizationId = 1;
    
    // Получаем количество дней из запроса
    const daysCount = req.body.DaysCount || 5;
    
    console.log('Days count:', daysCount);
    
    // Создаем фиктивный токен для тестирования
    const mockToken = 'mock-token-for-testing';
    
    // Используем новую функцию для создания ML payload
    let mlRequestData;
    try {
      // Временно переопределяем getSupabaseUserClient для тестового endpoint
      const originalGetSupabaseUserClient = require('../supabaseUserClient').getSupabaseUserClient;
      require('../supabaseUserClient').getSupabaseUserClient = () => adminClient;
      
      mlRequestData = await createMlPayload(String(organizationId), daysCount, mockToken);
      
      // Восстанавливаем оригинальную функцию
      require('../supabaseUserClient').getSupabaseUserClient = originalGetSupabaseUserClient;
    } catch (err) {
      console.error('Error creating ML payload:', err);
      return res.status(500).json({ error: 'Ошибка создания ML payload', details: err instanceof Error ? err.message : String(err) });
    }
    
    console.log('ML request data sample:', JSON.stringify(mlRequestData.slice(0, 3), null, 2));
    
    // Отправляем запрос к ML-сервису
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5678/forecast';
    console.log('ML Service URL:', ML_SERVICE_URL);
    
    const mlResponse = await axios.post(ML_SERVICE_URL, mlRequestData, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('ML Response:', JSON.stringify(mlResponse.data, null, 2));
    
    // Возвращаем результат
    res.json({
      success: true,
      ml_response: mlResponse.data,
      operations_count: mlRequestData.length - 1, // Минус заголовок DaysCount
      days_count: daysCount
    });
    
  } catch (error) {
    console.error('Test predict error:', error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Ошибка тестирования прогнозирования', details: message });
  }
});

// Тестовый маршрут без аутентификации (только для тестирования)
router.get('/test-no-auth', async (req, res) => {
  try {
    // Проверяем доступность supabaseAdmin
    let adminClient = supabaseAdmin;
    if (!adminClient) {
      const { createClient } = require('@supabase/supabase-js');
      adminClient = createClient(
        process.env.SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
    }
    
    // Получаем данные без аутентификации для организации 1
    const organizationId = 1;
    
    // Получаем продукты
    const { data: products, error: productsError } = await adminClient
      .from('products')
      .select('id, name, code')
      .eq('organization_id', organizationId);
    
    // Получаем операции
    const { data: operations, error: operationsError } = await adminClient
      .from('operations')
      .select('id, operation_type, quantity, product_id')
      .eq('organization_id', organizationId)
      .limit(10);
    
    res.json({
      success: true,
      organization_id: organizationId,
      products: products || [],
      operations: operations || [],
      products_count: products?.length || 0,
      operations_count: operations?.length || 0
    });
    
  } catch (error) {
    console.error('Test error:', error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Test failed', details: message });
  }
});

// Маршрут для отладки аутентификации
router.get('/debug-auth', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }
    const userToken = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(userToken);

    // Получаем данные пользователя
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Получаем ID организации пользователя
    const { data: orgData, error: orgError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', userData.user.id)
      .single();
    if (orgError) throw orgError;

    // Проверяем доступ к данным прогнозов
    const { data: forecastData, error: forecastError } = await supabase
      .from('forecasts')
      .select('id')
      .eq('organization_id', orgData.organization_id)
      .limit(1);
    if (forecastError) throw forecastError;

    res.json({
      user: userData.user,
      organization_id: orgData.organization_id,
      role: orgData.role,
      has_forecast_data: forecastData && forecastData.length > 0,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Ошибка проверки аутентификации', details: message });
  }
});

// Ультра простой тест для отладки
router.get('/ultra-simple-test', async (req: any, res: any) => {
  try {
    console.log('Ultra simple test called');
    
    // Тест 1: Проверка env переменных
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Env check:');
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SERVICE_ROLE_KEY exists:', !!serviceRoleKey);
    
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Missing environment variables' });
    }
    
    // Тест 2: Создание клиента
    const { createClient } = require('@supabase/supabase-js');
    const testClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    console.log('Client created, testing query...');
    
    // Тест 3: Простой запрос
    const { data, error } = await testClient
      .from('products')
      .select('id, name')
      .limit(1);
    
    console.log('Query result:', { data, error });
    
    res.json({
      success: true,
      env_vars_ok: true,
      client_created: true,
      query_result: { data, error }
    });
    
  } catch (error) {
    console.error('Ultra simple test error:', error);
    res.status(500).json({ 
      error: 'Ultra simple test failed', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
