import { z } from 'zod';

// Common validation schemas
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const productSchema = z.object({
  Номенклатура: z.string().min(1, 'Product name is required'),
  Код: z.string().min(1, 'Product code is required'),
  ВидНоменклатуры: z.string().min(1, 'Product type is required'),
  Количество: z.number().int().min(0, 'Quantity must be non-negative'),
  Период: dateSchema,
  Type: z.enum(['Продажа', 'Поставка']),
  Адрес_точки: z.string().optional(),
  Цена: z.number().positive().optional() // Only for 'Поставка' type
});

// Validate product with conditional price field
export const validateProduct = (product: any) => {
  const baseValidation = productSchema.omit({ Цена: true }).safeParse(product);
  
  if (!baseValidation.success) {
    return baseValidation;
  }
  
  // Additional validation for 'Поставка' type
  if (product.Type === 'Поставка') {
    if (!product.Цена || product.Цена <= 0) {
      return {
        success: false,
        error: new z.ZodError([{
          code: 'custom',
          message: 'Price is required and must be positive for supply operations',
          path: ['Цена']
        }])
      };
    }
  }
  
  return { success: true, data: product };
};

// ML Payload validation schema
export const mlPayloadSchema = z.array(
  z.union([
    z.object({ DaysCount: z.number().int().min(1).max(365) }),
    productSchema
  ])
);

// Known valid categories and their mappings
export const CATEGORY_MAPPINGS = new Map<string, string>([
  // Primary categories
  ['Хлеб', 'Хлеб'],
  ['Выпечка', 'Выпечка'],
  ['Напитки', 'Напитки'],
  ['Молочные продукты', 'Молочные продукты'],
  ['Прочее', 'Прочее'],
  
  // Common variations and typos
  ['хлеб', 'Хлеб'],
  ['ХЛЕБ', 'Хлеб'],
  ['Хлебобулочные изделия', 'Хлеб'],
  ['Булочки', 'Выпечка'],
  ['Торты', 'Выпечка'],
  ['Пирожные', 'Выпечка'],
  ['Молоко', 'Молочные продукты'],
  ['Кефир', 'Молочные продукты'],
  ['Йогурт', 'Молочные продукты'],
  ['Вода', 'Напитки'],
  ['Соки', 'Напитки'],
  ['Газировка', 'Напитки']
]);

// Data cleaning and normalization functions
export function normalizeCategory(category: string): string {
  // Check if it's a known category or variation
  const normalized = CATEGORY_MAPPINGS.get(category);
  if (normalized) {
    return normalized;
  }
  
  // Try case-insensitive match
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of CATEGORY_MAPPINGS.entries()) {
    if (key.toLowerCase() === lowerCategory) {
      return value;
    }
  }
  
  // Default to 'Прочее' for unknown categories
  console.warn(`Unknown category "${category}" mapped to "Прочее"`);
  return 'Прочее';
}

export function normalizeDate(date: any): string | null {
  if (!date) return null;
  
  // Handle different date formats
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    console.error(`Invalid date: ${date}`);
    return null;
  }
  
  return dateObj.toISOString().slice(0, 10);
}

export function normalizeQuantity(quantity: any): number {
  const num = Number(quantity);
  if (isNaN(num)) {
    console.error(`Invalid quantity: ${quantity}, defaulting to 0`);
    return 0;
  }
  return Math.max(0, Math.round(num)); // Ensure non-negative integer
}

export function normalizePrice(price: any): number | null {
  if (price === null || price === undefined) {
    return null;
  }
  
  const num = Number(price);
  if (isNaN(num) || num <= 0) {
    console.error(`Invalid price: ${price}`);
    return null;
  }
  
  return Math.round(num * 100) / 100; // Round to 2 decimal places
}

// Comprehensive data validation and cleaning
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  cleanedData?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  originalValue: any;
  correctedValue: any;
}

export function validateAndCleanMLPayload(payload: any[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const cleanedData: any[] = [];
  
  // Check if payload is an array
  if (!Array.isArray(payload)) {
    return {
      valid: false,
      errors: [{ field: 'payload', message: 'Payload must be an array', value: payload }],
      warnings: []
    };
  }
  
  // Check if first item contains DaysCount
  if (payload.length === 0 || !payload[0].hasOwnProperty('DaysCount')) {
    errors.push({
      field: 'payload[0]',
      message: 'First item must contain DaysCount',
      value: payload[0]
    });
    return { valid: false, errors, warnings };
  }
  
  // Validate DaysCount
  const daysCount = payload[0].DaysCount;
  if (typeof daysCount !== 'number' || daysCount < 1 || daysCount > 365) {
    errors.push({
      field: 'DaysCount',
      message: 'DaysCount must be a number between 1 and 365',
      value: daysCount
    });
  } else {
    cleanedData.push({ DaysCount: Math.round(daysCount) });
  }
  
  // Validate and clean each product item
  for (let i = 1; i < payload.length; i++) {
    const item = payload[i];
    const cleanedItem: any = {};
    
    // Validate required fields
    if (!item.Номенклатура) {
      errors.push({
        field: `payload[${i}].Номенклатура`,
        message: 'Product name is required',
        value: item.Номенклатура
      });
      continue;
    }
    cleanedItem.Номенклатура = String(item.Номенклатура).trim();
    
    // Code
    if (!item.Код) {
      errors.push({
        field: `payload[${i}].Код`,
        message: 'Product code is required',
        value: item.Код
      });
      continue;
    }
    cleanedItem.Код = String(item.Код).trim();
    
    // Category normalization
    const originalCategory = item.ВидНоменклатуры;
    const normalizedCategory = normalizeCategory(originalCategory || '');
    if (originalCategory !== normalizedCategory) {
      warnings.push({
        field: `payload[${i}].ВидНоменклатуры`,
        message: 'Category normalized',
        originalValue: originalCategory,
        correctedValue: normalizedCategory
      });
    }
    cleanedItem.ВидНоменклатуры = normalizedCategory;
    
    // Quantity
    const originalQuantity = item.Количество;
    const normalizedQuantity = normalizeQuantity(originalQuantity);
    if (originalQuantity !== normalizedQuantity) {
      warnings.push({
        field: `payload[${i}].Количество`,
        message: 'Quantity normalized',
        originalValue: originalQuantity,
        correctedValue: normalizedQuantity
      });
    }
    cleanedItem.Количество = normalizedQuantity;
    
    // Date
    const normalizedDateValue = normalizeDate(item.Период);
    if (!normalizedDateValue) {
      errors.push({
        field: `payload[${i}].Период`,
        message: 'Invalid date format',
        value: item.Период
      });
      continue;
    }
    cleanedItem.Период = normalizedDateValue;
    
    // Type
    if (!['Продажа', 'Поставка'].includes(item.Type)) {
      errors.push({
        field: `payload[${i}].Type`,
        message: 'Type must be either "Продажа" or "Поставка"',
        value: item.Type
      });
      continue;
    }
    cleanedItem.Type = item.Type;
    
    // Location (optional)
    if (item.Адрес_точки) {
      cleanedItem.Адрес_точки = String(item.Адрес_точки).trim();
    }
    
    // Price (required for 'Поставка')
    if (item.Type === 'Поставка') {
      const normalizedPriceValue = normalizePrice(item.Цена);
      if (!normalizedPriceValue) {
        errors.push({
          field: `payload[${i}].Цена`,
          message: 'Valid price is required for supply operations',
          value: item.Цена
        });
        continue;
      }
      cleanedItem.Цена = normalizedPriceValue;
    }
    
    cleanedData.push(cleanedItem);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cleanedData: errors.length === 0 ? cleanedData : undefined
  };
}

// Batch validation with detailed reporting
export function validateBatch(items: any[], schema: z.ZodSchema): {
  valid: any[];
  invalid: { item: any; errors: z.ZodError }[];
} {
  const valid: any[] = [];
  const invalid: { item: any; errors: z.ZodError }[] = [];
  
  items.forEach(item => {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({ item, errors: result.error });
    }
  });
  
  return { valid, invalid };
}

// Export validation schemas for reuse
export const schemas = {
  date: dateSchema,
  product: productSchema,
  mlPayload: mlPayloadSchema
};
