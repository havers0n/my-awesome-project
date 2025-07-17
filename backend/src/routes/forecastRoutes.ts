import express from 'express';
import { getSupabaseUserClient } from '../supabaseUserClient';
import { createMlPayload } from '../services/mlPayloadFormatter';
import { supabaseAdmin } from '../supabaseAdminClient';
import { predictSales, getForecastData, getForecastHistory, getOverallMetrics } from '../controllers/forecastController';
import { authenticate } from '../middleware/authenticate';
import axios from 'axios';

const router = express.Router();

// POST /predict — предсказание продаж по данным и DaysCount
router.post('/predict', authenticate, predictSales as any);

// GET /forecast
router.get('/forecast', authenticate, getForecastData as any);

// GET /history
router.get('/history', authenticate, getForecastHistory as any);

// GET /metrics - получить общие метрики прогнозирования
router.get('/metrics', authenticate, getOverallMetrics as any);

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

export default router;
