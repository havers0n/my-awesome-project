import Joi from 'joi';

// ML Service Forecast schemas
export const mlForecastRequestSchema = Joi.array().items(
  Joi.alternatives().try(
    // DaysHeader
    Joi.object({
      DaysCount: Joi.number().integer().min(1).max(365).required()
    }),
    // SaleEvent
    Joi.object({
      Type: Joi.string().valid('Продажа').optional(),
      Период: Joi.string().required(),
      Номенклатура: Joi.string().required(),
      ВидНоменклатуры: Joi.string().optional(),
      Поставщик: Joi.string().optional(),
      Производитель: Joi.string().optional(),
      Вес: Joi.number().optional(),
      Артикул: Joi.string().optional(),
      Код: Joi.string().optional(),
      Группа: Joi.string().optional(),
      Количество: Joi.number().integer().optional(),
      Сумма: Joi.number().optional(),
      Срок_годности_час: Joi.number().integer().optional(),
      Наличие_товара: Joi.boolean().optional(),
      Наличие_товара_в_магазине: Joi.boolean().optional(),
      Категория_товара: Joi.string().optional(),
      Задержка_поставки_дн: Joi.number().integer().optional(),
      Адрес_точки: Joi.string().optional(),
      Заканчивался_ли_продукт: Joi.boolean().optional(),
      Цена_на_полке: Joi.number().optional(),
      Часов_работала_точка: Joi.number().integer().optional(),
      Остаток_в_магазине: Joi.number().integer().optional(),
      StoreId: Joi.number().integer().optional(),
      Процент_скидки: Joi.number().integer().min(0).max(100).optional()
    }),
    // SupplyEvent
    Joi.object({
      Type: Joi.string().valid('Поставка').required(),
      Период: Joi.string().required(),
      Номенклатура: Joi.string().required(),
      Код: Joi.string().optional(),
      Количество: Joi.number().integer().required(),
      Цена: Joi.number().required()
    })
  )
).min(2); // At least header + one event

export const mlForecastResponseSchema = Joi.object({
  metric: Joi.object({
    DaysPredict: Joi.number().integer().required()
  }).required(),
  detail: Joi.array().items(
    Joi.object({
      Период: Joi.string().required(),
      Номенклатура: Joi.string().required(),
      Код: Joi.string().required(),
      MAPE: Joi.number().min(0).required(),
      MAE: Joi.number().min(0).required(),
      Количество: Joi.number().integer().min(0).required()
    })
  ).required()
});

// ML Service health check
export const mlHealthCheckResponseSchema = Joi.object({
  status: Joi.string().valid('ok').required(),
  model_loaded: Joi.boolean().required(),
  version: Joi.string().required()
});

// ML Service model info
export const mlModelInfoResponseSchema = Joi.object({
  model_type: Joi.string().required(),
  version: Joi.string().required(),
  features: Joi.array().items(Joi.string()).required(),
  training_date: Joi.date().iso().required(),
  metrics: Joi.object({
    mape: Joi.number().min(0).required(),
    mae: Joi.number().min(0).required(),
    rmse: Joi.number().min(0).required()
  }).required()
});
