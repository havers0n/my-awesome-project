import {
  normalizeCategory,
  normalizeDate,
  normalizeQuantity,
  normalizePrice,
  validateAndCleanMLPayload,
  validateBatch,
  productSchema,
  CATEGORY_MAPPINGS
} from '../dataValidation';
import { z } from 'zod';

describe('Category Normalization', () => {
  it('should normalize known categories correctly', () => {
    expect(normalizeCategory('Хлеб')).toBe('Хлеб');
    expect(normalizeCategory('хлеб')).toBe('Хлеб');
    expect(normalizeCategory('ХЛЕБ')).toBe('Хлеб');
    expect(normalizeCategory('Хлебобулочные изделия')).toBe('Хлеб');
    expect(normalizeCategory('Булочки')).toBe('Выпечка');
    expect(normalizeCategory('Молоко')).toBe('Молочные продукты');
  });
  
  it('should map unknown categories to Прочее', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    expect(normalizeCategory('Unknown Product')).toBe('Прочее');
    expect(normalizeCategory('New Category')).toBe('Прочее');
    
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });
  
  it('should handle case-insensitive matching', () => {
    expect(normalizeCategory('напитки')).toBe('Напитки');
    expect(normalizeCategory('ВЫПЕЧКА')).toBe('Выпечка');
    expect(normalizeCategory('молочные продукты')).toBe('Молочные продукты');
  });
});

describe('Data Normalization', () => {
  describe('normalizeDate', () => {
    it('should normalize valid dates to YYYY-MM-DD format', () => {
      expect(normalizeDate('2025-01-15')).toBe('2025-01-15');
      expect(normalizeDate('2025-01-15T10:30:00Z')).toBe('2025-01-15');
      expect(normalizeDate(new Date('2025-01-15'))).toBe('2025-01-15');
      // Test that the date is parsed correctly, allowing for timezone differences
      const parsed = normalizeDate('January 15, 2025');
      expect(parsed).toMatch(/^2025-01-1[45]$/); // Could be 14 or 15 depending on timezone
    });
    
    it('should return null for invalid dates', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(normalizeDate('invalid-date')).toBeNull();
      expect(normalizeDate(null)).toBeNull();
      expect(normalizeDate(undefined)).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('normalizeQuantity', () => {
    it('should normalize valid quantities to non-negative integers', () => {
      expect(normalizeQuantity(10)).toBe(10);
      expect(normalizeQuantity(10.7)).toBe(11);
      expect(normalizeQuantity('25')).toBe(25);
      expect(normalizeQuantity('25.4')).toBe(25);
      expect(normalizeQuantity(-5)).toBe(0);
    });
    
    it('should return 0 for invalid quantities', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(normalizeQuantity('invalid')).toBe(0);
      expect(normalizeQuantity(null)).toBe(0);
      expect(normalizeQuantity(undefined)).toBe(0);
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('normalizePrice', () => {
    it('should normalize valid prices to 2 decimal places', () => {
      expect(normalizePrice(10)).toBe(10);
      expect(normalizePrice(10.567)).toBe(10.57);
      expect(normalizePrice('25.99')).toBe(25.99);
      expect(normalizePrice('100')).toBe(100);
    });
    
    it('should return null for invalid or non-positive prices', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(normalizePrice(0)).toBeNull();
      expect(normalizePrice(-10)).toBeNull();
      expect(normalizePrice('invalid')).toBeNull();
      expect(normalizePrice(null)).toBeNull();
      expect(normalizePrice(undefined)).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });
});

describe('ML Payload Validation', () => {
  it('should validate correct payload structure', () => {
    const validPayload = [
      { DaysCount: 14 },
      {
        Номенклатура: 'Хлеб белый',
        Код: 'BREAD001',
        ВидНоменклатуры: 'Хлеб',
        Количество: 50,
        Период: '2025-01-15',
        Type: 'Продажа',
        Адрес_точки: 'Store 1'
      }
    ];
    
    const result = validateAndCleanMLPayload(validPayload);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.cleanedData).toHaveLength(2);
  });
  
  it('should reject non-array payload', () => {
    const result = validateAndCleanMLPayload({} as any);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('payload');
    expect(result.errors[0].message).toBe('Payload must be an array');
  });
  
  it('should reject payload without DaysCount', () => {
    const result = validateAndCleanMLPayload([
      {
        Номенклатура: 'Test',
        Код: 'TEST001',
        ВидНоменклатуры: 'Прочее',
        Количество: 10,
        Период: '2025-01-15',
        Type: 'Продажа'
      }
    ]);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('payload[0]');
    expect(result.errors[0].message).toBe('First item must contain DaysCount');
  });
  
  it('should validate DaysCount range', () => {
    const invalidPayload = [
      { DaysCount: 400 }
    ];
    
    const result = validateAndCleanMLPayload(invalidPayload);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('DaysCount');
    expect(result.errors[0].message).toContain('between 1 and 365');
  });
  
  it('should normalize categories and add warnings', () => {
    const payload = [
      { DaysCount: 7 },
      {
        Номенклатура: 'Test Product',
        Код: 'TEST001',
        ВидНоменклатуры: 'UnknownCategory',
        Количество: 10,
        Период: '2025-01-15',
        Type: 'Продажа'
      }
    ];
    
    const result = validateAndCleanMLPayload(payload);
    
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].field).toBe('payload[1].ВидНоменклатуры');
    expect(result.warnings[0].originalValue).toBe('UnknownCategory');
    expect(result.warnings[0].correctedValue).toBe('Прочее');
    expect(result.cleanedData![1].ВидНоменклатуры).toBe('Прочее');
  });
  
  it('should normalize quantities and add warnings', () => {
    const payload = [
      { DaysCount: 7 },
      {
        Номенклатура: 'Test Product',
        Код: 'TEST001',
        ВидНоменклатуры: 'Хлеб',
        Количество: '25.7',
        Период: '2025-01-15',
        Type: 'Продажа'
      }
    ];
    
    const result = validateAndCleanMLPayload(payload);
    
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].field).toBe('payload[1].Количество');
    expect(result.warnings[0].originalValue).toBe('25.7');
    expect(result.warnings[0].correctedValue).toBe(26);
    expect(result.cleanedData![1].Количество).toBe(26);
  });
  
  it('should validate required fields', () => {
    const payload = [
      { DaysCount: 7 },
      {
        // Missing Номенклатура
        Код: 'TEST001',
        ВидНоменклатуры: 'Хлеб',
        Количество: 10,
        Период: '2025-01-15',
        Type: 'Продажа'
      }
    ];
    
    const result = validateAndCleanMLPayload(payload);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('payload[1].Номенклатура');
    expect(result.errors[0].message).toBe('Product name is required');
  });
  
  it('should validate date format', () => {
    const payload = [
      { DaysCount: 7 },
      {
        Номенклатура: 'Test Product',
        Код: 'TEST001',
        ВидНоменклатуры: 'Хлеб',
        Количество: 10,
        Период: 'invalid-date',
        Type: 'Продажа'
      }
    ];
    
    const result = validateAndCleanMLPayload(payload);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('payload[1].Период');
    expect(result.errors[0].message).toBe('Invalid date format');
  });
  
  it('should validate Type enum', () => {
    const payload = [
      { DaysCount: 7 },
      {
        Номенклатура: 'Test Product',
        Код: 'TEST001',
        ВидНоменклатуры: 'Хлеб',
        Количество: 10,
        Период: '2025-01-15',
        Type: 'InvalidType'
      }
    ];
    
    const result = validateAndCleanMLPayload(payload);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('payload[1].Type');
    expect(result.errors[0].message).toContain('either "Продажа" or "Поставка"');
  });
  
  it('should require price for Поставка type', () => {
    const payload = [
      { DaysCount: 7 },
      {
        Номенклатура: 'Test Product',
        Код: 'TEST001',
        ВидНоменклатуры: 'Хлеб',
        Количество: 10,
        Период: '2025-01-15',
        Type: 'Поставка'
        // Missing Цена
      }
    ];
    
    const result = validateAndCleanMLPayload(payload);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('payload[1].Цена');
    expect(result.errors[0].message).toBe('Valid price is required for supply operations');
  });
  
  it('should clean and validate complex payload with multiple items', () => {
    const payload = [
      { DaysCount: 14 },
      {
        Номенклатура: '  Хлеб белый  ',
        Код: '  BREAD001  ',
        ВидНоменклатуры: 'хлеб',
        Количество: '50.3',
        Период: '2025-01-15T00:00:00Z',
        Type: 'Продажа',
        Адрес_точки: '  Store 1  '
      },
      {
        Номенклатура: 'Молоко 2.5%',
        Код: 'MILK001',
        ВидНоменклатуры: 'Молоко',
        Количество: 30,
        Период: '2025-01-15',
        Type: 'Поставка',
        Цена: '45.99'
      }
    ];
    
    const result = validateAndCleanMLPayload(payload);
    
    expect(result.valid).toBe(true);
    expect(result.cleanedData).toHaveLength(3);
    
    // Check cleaned first product
    expect(result.cleanedData![1].Номенклатура).toBe('Хлеб белый');
    expect(result.cleanedData![1].Код).toBe('BREAD001');
    expect(result.cleanedData![1].ВидНоменклатуры).toBe('Хлеб');
    expect(result.cleanedData![1].Количество).toBe(50);
    expect(result.cleanedData![1].Период).toBe('2025-01-15');
    expect(result.cleanedData![1].Адрес_точки).toBe('Store 1');
    
    // Check cleaned second product
    expect(result.cleanedData![2].ВидНоменклатуры).toBe('Молочные продукты');
    expect(result.cleanedData![2].Цена).toBe(45.99);
    
    // Check warnings - we should have 3 warnings:
    // 1. Category normalization for 'хлеб' -> 'Хлеб'
    // 2. Quantity rounding for '50.3' -> 50
    // 3. Category normalization for 'Молоко' -> 'Молочные продукты'
    expect(result.warnings).toHaveLength(3);
  });
});

describe('Batch Validation', () => {
  it('should separate valid and invalid items', () => {
    const items = [
      {
        Номенклатура: 'Valid Product',
        Код: 'VALID001',
        ВидНоменклатуры: 'Хлеб',
        Количество: 10,
        Период: '2025-01-15',
        Type: 'Продажа'
      },
      {
        Номенклатура: 'Invalid Product',
        Код: 'INVALID001',
        ВидНоменклатуры: 'Хлеб',
        Количество: 'not-a-number',
        Период: '2025-01-15',
        Type: 'Продажа'
      },
      {
        Номенклатура: 'Another Valid',
        Код: 'VALID002',
        ВидНоменклатуры: 'Выпечка',
        Количество: 20,
        Период: '2025-01-16',
        Type: 'Продажа'
      }
    ];
    
    const result = validateBatch(items, productSchema);
    
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].item.Код).toBe('INVALID001');
    expect(result.invalid[0].errors.errors).toHaveLength(1);
    expect(result.invalid[0].errors.errors[0].path).toEqual(['Количество']);
  });
  
  it('should handle empty batch', () => {
    const result = validateBatch([], productSchema);
    
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
  });
});
