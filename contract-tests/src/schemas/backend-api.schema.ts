import Joi from 'joi';

// Auth schemas
export const loginRequestSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const loginResponseSchema = Joi.object({
  token: Joi.string().required(),
  user: Joi.object({
    id: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'user', 'manager').required()
  }).required()
});

export const registerRequestSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required()
});

// Forecast schemas
export const forecastRequestSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  products: Joi.array().items(Joi.string()).min(1).required(),
  storeId: Joi.number().integer().positive().optional()
});

export const forecastResponseSchema = Joi.object({
  predictions: Joi.array().items(
    Joi.object({
      date: Joi.date().iso().required(),
      productId: Joi.string().required(),
      productName: Joi.string().required(),
      predictedQuantity: Joi.number().min(0).required(),
      confidence: Joi.number().min(0).max(100).required(),
      mape: Joi.number().min(0).optional(),
      mae: Joi.number().min(0).optional()
    })
  ).required(),
  metadata: Joi.object({
    generatedAt: Joi.date().iso().required(),
    modelVersion: Joi.string().required(),
    requestId: Joi.string().uuid().required()
  }).required()
});

// Inventory schemas
export const inventoryItemSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  code: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  supplier: Joi.string().optional(),
  lastUpdated: Joi.date().iso().required()
});

export const inventoryListResponseSchema = Joi.object({
  items: Joi.array().items(inventoryItemSchema).required(),
  total: Joi.number().integer().min(0).required(),
  page: Joi.number().integer().min(1).required(),
  pageSize: Joi.number().integer().min(1).max(100).required()
});

// Upload schemas
export const uploadRequestSchema = Joi.object({
  file: Joi.binary().required(),
  type: Joi.string().valid('inventory', 'sales', 'forecast').required()
});

export const uploadResponseSchema = Joi.object({
  success: Joi.boolean().required(),
  message: Joi.string().required(),
  processedRecords: Joi.number().integer().min(0).optional(),
  errors: Joi.array().items(
    Joi.object({
      row: Joi.number().integer().min(1).required(),
      field: Joi.string().required(),
      message: Joi.string().required()
    })
  ).optional()
});

// Health check schema
export const healthCheckResponseSchema = Joi.object({
  status: Joi.string().valid('healthy', 'unhealthy').required(),
  version: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  services: Joi.object({
    database: Joi.boolean().required(),
    mlService: Joi.boolean().required(),
    cache: Joi.boolean().optional()
  }).required()
});
