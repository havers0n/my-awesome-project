import express, { Request, Response, NextFunction } from 'express';
import { getSupabaseUserClient } from '../supabaseUserClient';
const router = express.Router();

// POST /predict — предсказание продаж по данным и DaysCount
router.post('/predict', (req, res) => {
  (async () => {
    try {
      const body = req.body;
      if (!Array.isArray(body) || body.length === 0 || typeof body[0] !== 'object' || !('DaysCount' in body[0])) {
        res.status(400).json({ error: 'Первый элемент массива должен быть объектом {DaysCount: N}' });
        return;
      }
      const daysCount = body[0].DaysCount;
      const salesData = body.slice(1);
      if (!Number.isInteger(daysCount) || daysCount <= 0) {
        res.status(400).json({ error: 'DaysCount должен быть положительным целым числом' });
        return;
      }
      if (!Array.isArray(salesData) || salesData.length === 0) {
        res.status(400).json({ error: 'Нет данных для предсказания' });
        return;
      }

      // Здесь должна быть интеграция с ML/нейросетью. Пока — мок-ответ.
      // Формируем предсказания на daysCount дней для каждого товара
      type Prediction = { product: string; forecast_date: string; predicted: number };
      const products = [...new Set(salesData.map((item: any) => item.product))];
      const today = new Date();
      const predictions: Prediction[] = [];
      for (const product of products) {
        for (let i = 1; i <= daysCount; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          predictions.push({
            product,
            forecast_date: date.toISOString().slice(0, 10),
            predicted: Math.floor(Math.random() * 100) + 50
          });
        }
      }

      // Мок-метрики качества
      type Metric = { product: string; MAPE: number; MAE: number; quality: string };
      const metrics: Metric[] = products.map(product => ({
        product,
        MAPE: Math.random() * 10,
        MAE: Math.random() * 5,
        quality: 'Высокая'
      }));
      res.json({ predictions, metrics });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Ошибка предсказания', details: message });
    }
  })();
});


// GET /forecast
router.get('/forecast', (req, res) => {
  (async () => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        res.status(401).json({ error: 'No authorization header' });
        return;
      }
      const userToken = authHeader.replace('Bearer ', '');
      const supabase = getSupabaseUserClient(userToken);

      // Тренд: агрегируем прогноз по датам
      const { data: trendData, error: trendError } = await supabase
        .from('forecasts')
        .select('forecast_date, forecast')
        .order('forecast_date', { ascending: true });
      if (trendError) throw trendError;

      // Агрегируем по датам
      const trendMap = new Map();
      (trendData || []).forEach((row) => {
        const date = row.forecast_date;
        const value = Number(row.forecast) || 0;
        trendMap.set(date, (trendMap.get(date) || 0) + value);
      });
      const trend = { points: Array.from(trendMap.entries()).map(([date, value]) => ({ date, value })) };

      // Топ продуктов
      const { data: topProductsData, error: topProductsError } = await supabase
        .from('forecasts')
        .select('product, forecast')
        .order('product', { ascending: true });
      if (topProductsError) throw topProductsError;
      const productMap = new Map();
      (topProductsData || []).forEach((row) => {
        const name = row.product;
        const amount = Number(row.forecast) || 0;
        productMap.set(name, (productMap.get(name) || 0) + amount);
      });
      let topProductsArr = Array.from(productMap.entries()).map(([name, amount]) => ({ name, amount }));
      topProductsArr = topProductsArr.sort((a, b) => b.amount - a.amount).slice(0, 3);
      const colorClasses = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];
      const barWidths = ['80%', '60%', '40%'];
      const topProducts = topProductsArr.map((row, i) => ({
        ...row,
        colorClass: colorClasses[i % colorClasses.length],
        barWidth: barWidths[i % barWidths.length],
      }));

      // История: последние 10 записей
      const { data: historyData, error: historyError } = await supabase
        .from('forecasts')
        .select('forecast_date, product, category, forecast, accuracy')
        .order('forecast_date', { ascending: false })
        .limit(10);
      if (historyError) throw historyError;

      res.json({
        trend,
        topProducts,
        history: {
          items: historyData || [],
          total: (historyData || []).length,
        },
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Ошибка получения прогноза', details: message });
    }
  })();
});

// POST /forecast (bulk upload продаж/поставок)
router.post('/forecast', (req, res) => {
  (async () => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        res.status(401).json({ error: 'No authorization header' });
        return;
      }
      const userToken = authHeader.replace('Bearer ', '');
      const supabase = getSupabaseUserClient(userToken);
      const sales = req.body;
      if (!Array.isArray(sales) || sales.length === 0) {
        res.status(400).json({ error: 'Ожидается массив данных о продажах/поставках' });
        return;
      }
      // Проверяем обязательные поля для каждой записи
      const requiredFields = ['organization_id', 'product', 'category', 'forecast', 'actual', 'forecast_date', 'accuracy'];
      for (const item of sales) {
        for (const field of requiredFields) {
          if (!(field in item)) {
            res.status(400).json({ error: `В каждой записи должен быть '${field}'` });
            return;
          }
        }
      }
      // Вставка через Supabase
      const { error } = await supabase.from('forecasts').insert(sales);
      if (error) throw error;
      res.json({ success: true, inserted: sales.length });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Ошибка загрузки данных о продажах', details: message });
    }
  })();
});

// DEBUG: Проверка токена и доступа к forecasts
router.get('/debug-auth', (req, res) => {
  (async () => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        res.status(401).json({ error: 'Отсутствует заголовок Authorization' });
        return;
      }
      const userToken = authHeader.replace('Bearer ', '');
      const supabase = getSupabaseUserClient(userToken);

      // Получаем данные пользователя
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        res.status(401).json({ error: 'Недействительный токен', details: userError });
        return;
      }
      const user = userData.user;

      // Получаем organization_id и роль из таблицы users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();
      if (profileError || !profile) {
        res.status(500).json({ error: 'Не удалось получить данные профиля', details: profileError });
        return;
      }

      // Проверяем доступ к прогнозам
      const { data: forecasts, error: forecastsError } = await supabase
        .from('forecasts')
        .select('count(*)', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          organization_id: profile.organization_id,
          role: profile.role
        },
        auth: {
          valid: true,
          token_present: true
        },
        forecasts: {
          count: forecasts?.length || 0,
          error: forecastsError ? forecastsError.message : null
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Ошибка проверки авторизации', details: message });
    }
  })();
});

export default router;
