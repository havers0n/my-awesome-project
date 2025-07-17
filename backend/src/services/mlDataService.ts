import { supabaseAdmin } from '../supabaseClient';
import { subDays, format } from 'date-fns';

interface MLFeatures {
  ItemName_Enc: number;
  Code_Enc: number;
  Sales_Avg_7: number;
  Sales_Avg_14: number;
  Sales_Avg_30: number;
  Sales_Avg_60: number;
  Sales_Std_7: number;
  Sales_Lag_1: number;
  Sales_Lag_7: number;
  Sales_Lag_14: number;
  Sales_Lag_30: number;
  Sales_Lag_60: number;
  Sales_Lag_90: number;
  Sales_vs_7d_avg: number;
  Sales_Pct_Change_1d: number;
  Sales_Pct_Change_7d: number;
  Sales_EMA_7: number;
  Sales_EMA_30: number;
  IsMissing_EMA_7: number;
  IsMissing_Min_7: number;
  IsHoliday_Impact: number;
  NoSupplyFlag: number;
  NoSalesFlag: number;
  IsWeekend: number;
  PricePerUnit: number;
  Месяц: number;
  ДеньМесяца: number;
  ДеньНедели: number;
  Квартал: number;
}

interface ProductMetrics {
  itemName: string;
  mape: number;
  mae: number;
  rmse: number;
  r2: number;
}

export class MLDataService {
  /**
   * Получить исторические признаки для товара из БД
   */
  static async getProductFeatures(
    productId: string,
    targetDate: Date,
    organizationId: string
  ): Promise<MLFeatures | null> {
    try {
      // Получаем историю операций для товара
      const endDate = targetDate;
      const startDate90 = subDays(endDate, 90);
      
      const { data: operations, error } = await supabaseAdmin
        .from('operations')
        .select('*')
        .eq('product_id', productId)
        .eq('organization_id', organizationId)
        .eq('operation_type', 'sale')
        .gte('operation_date', startDate90.toISOString())
        .lte('operation_date', endDate.toISOString())
        .order('operation_date', { ascending: false });

      if (error) throw error;
      if (!operations || operations.length === 0) return null;

      // Группируем продажи по дням
      const salesByDate = new Map<string, number>();
      operations.forEach((op: any) => {
        const dateKey = format(new Date(op.operation_date), 'yyyy-MM-dd');
        salesByDate.set(dateKey, (salesByDate.get(dateKey) || 0) + op.quantity);
      });

      // Вычисляем признаки
      const features = this.calculateFeatures(salesByDate, targetDate, productId);
      
      // Получаем последнюю цену
      const { data: lastPrice } = await supabaseAdmin
        .from('operations')
        .select('cost_price')
        .eq('product_id', productId)
        .eq('organization_id', organizationId)
        .not('cost_price', 'is', null)
        .order('operation_date', { ascending: false })
        .limit(1)
        .single();

      features.PricePerUnit = lastPrice?.cost_price || 100;

      return features;
    } catch (error) {
      console.error('Error getting product features:', error);
      return null;
    }
  }

  /**
   * Вычислить статистические признаки из истории продаж
   */
  private static calculateFeatures(
    salesByDate: Map<string, number>,
    targetDate: Date,
    productId: string
  ): MLFeatures {
    // Создаем массив продаж за последние 90 дней
    const salesArray: number[] = [];
    for (let i = 89; i >= 0; i--) {
      const date = format(subDays(targetDate, i), 'yyyy-MM-dd');
      salesArray.push(salesByDate.get(date) || 0);
    }

    // Вычисляем средние
    const avg7 = this.average(salesArray.slice(-7));
    const avg14 = this.average(salesArray.slice(-14));
    const avg30 = this.average(salesArray.slice(-30));
    const avg60 = this.average(salesArray.slice(-60));

    // Стандартное отклонение за 7 дней
    const std7 = this.standardDeviation(salesArray.slice(-7));

    // Лаговые значения
    const lag1 = salesArray[89] || 0;
    const lag7 = salesArray[83] || 0;
    const lag14 = salesArray[76] || 0;
    const lag30 = salesArray[60] || 0;
    const lag60 = salesArray[30] || 0;
    const lag90 = salesArray[0] || 0;

    // Процентные изменения
    const pctChange1d = lag7 > 0 ? ((lag1 - lag7) / lag7) * 100 : 0;
    const pctChange7d = lag14 > 0 ? ((lag7 - lag14) / lag14) * 100 : 0;

    // EMA (экспоненциальное скользящее среднее)
    const ema7 = this.calculateEMA(salesArray, 7);
    const ema30 = this.calculateEMA(salesArray, 30);

    // Простое кодирование для названия и кода товара
    const itemNameEnc = this.hashString(productId) % 1000;
    const codeEnc = this.hashString(productId + '_code') % 1000;

    return {
      ItemName_Enc: itemNameEnc,
      Code_Enc: codeEnc,
      Sales_Avg_7: avg7,
      Sales_Avg_14: avg14,
      Sales_Avg_30: avg30,
      Sales_Avg_60: avg60,
      Sales_Std_7: std7,
      Sales_Lag_1: lag1,
      Sales_Lag_7: lag7,
      Sales_Lag_14: lag14,
      Sales_Lag_30: lag30,
      Sales_Lag_60: lag60,
      Sales_Lag_90: lag90,
      Sales_vs_7d_avg: avg7 > 0 ? lag1 / avg7 : 1,
      Sales_Pct_Change_1d: pctChange1d,
      Sales_Pct_Change_7d: pctChange7d,
      Sales_EMA_7: ema7,
      Sales_EMA_30: ema30,
      IsMissing_EMA_7: ema7 === 0 ? 1 : 0,
      IsMissing_Min_7: Math.min(...salesArray.slice(-7)) === 0 ? 1 : 0,
      IsHoliday_Impact: 0, // TODO: интегрировать календарь праздников
      NoSupplyFlag: 0, // TODO: проверять поставки
      NoSalesFlag: lag1 === 0 ? 1 : 0,
      IsWeekend: targetDate.getDay() === 0 || targetDate.getDay() === 6 ? 1 : 0,
      PricePerUnit: 100, // Будет обновлено позже
      Месяц: targetDate.getMonth() + 1,
      ДеньМесяца: targetDate.getDate(),
      ДеньНедели: targetDate.getDay(),
      Квартал: Math.floor(targetDate.getMonth() / 3) + 1
    };
  }

  /**
   * Получить метрики точности для товара
   */
  static async getProductMetrics(
    productId: string,
    organizationId: string
  ): Promise<ProductMetrics | null> {
    try {
      // Пока возвращаем дефолтные метрики
      // В будущем здесь будет запрос к таблице с сохраненными метриками
      return {
        itemName: productId,
        mape: 15.0, // 15% средняя ошибка
        mae: 0.5,
        rmse: 0.7,
        r2: 0.6
      };
    } catch (error) {
      console.error('Error getting product metrics:', error);
      return null;
    }
  }

  // Вспомогательные функции
  private static average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private static standardDeviation(arr: number[]): number {
    if (arr.length === 0) return 0;
    const avg = this.average(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  private static calculateEMA(data: number[], period: number): number {
    if (data.length === 0) return 0;
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
} 