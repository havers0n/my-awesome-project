// backend/src/services/mlPayloadFormatter.test.ts
import { createMlPayload } from './mlPayloadFormatter';
import { getSupabaseUserClient } from '../supabaseUserClient';

// Mock Supabase client
jest.mock('../supabaseUserClient');

describe('mlPayloadFormatter', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    // Создаем mock для Supabase клиента
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis()
    };
    
    (getSupabaseUserClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMlPayload', () => {
    it('should format date to YYYY-MM-DD format', async () => {
      // Mock данные с полной датой
      const mockOperationsData = [
        {
          id: 1,
          operation_date: '2024-01-15T10:30:00.000Z', // Полная дата с временем
          operation_type: 'sale',
          quantity: 5.7,
          amount: 100,
          price: 20,
          products: { id: 1, name: 'Молоко', code: 'MILK001' },
          locations: { id: 1, address: 'Москва, ул. Тверская, 1' },
          out_of_stock: false,
          shelf_price: 22,
          store_hours: 8,
          store_stock: 50
        }
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockOperationsData,
        error: null
      });

      const result = await createMlPayload('org123', 5, 'token');

      // Проверяем, что дата сформатирована в YYYY-MM-DD формат
      expect(result[1].Период).toBe('2024-01-15');
      expect(result[1].Период).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should round quantity to integer', async () => {
      // Mock данные с дробным количеством
      const mockOperationsData = [
        {
          id: 1,
          operation_date: '2024-01-15T10:30:00.000Z',
          operation_type: 'sale',
          quantity: 5.7, // Дробное число
          amount: 100,
          price: 20,
          products: { id: 1, name: 'Молоко', code: 'MILK001' },
          locations: { id: 1, address: 'Москва, ул. Тверская, 1' },
          out_of_stock: false,
          shelf_price: 22,
          store_hours: 8,
          store_stock: 50
        },
        {
          id: 2,
          operation_date: '2024-01-14T09:15:00.000Z',
          operation_type: 'purchase',
          quantity: 3.2, // Дробное число
          amount: 64,
          price: 20,
          products: { id: 2, name: 'Хлеб', code: 'BREAD001' },
          locations: { id: 1, address: 'Москва, ул. Тверская, 1' },
          out_of_stock: false,
          shelf_price: 22,
          store_hours: 8,
          store_stock: 30
        }
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockOperationsData,
        error: null
      });

      const result = await createMlPayload('org123', 5, 'token');

      // Проверяем, что количество округлено до целого числа
      expect(result[1].Количество).toBe(6); // 5.7 округляется до 6
      expect(result[2].Количество).toBe(3); // 3.2 округляется до 3
      expect(Number.isInteger(result[1].Количество)).toBe(true);
      expect(Number.isInteger(result[2].Количество)).toBe(true);
    });

    it('should not add price field for sale operations', async () => {
      // Mock данные с операцией продажи
      const mockOperationsData = [
        {
          id: 1,
          operation_date: '2024-01-15T10:30:00.000Z',
          operation_type: 'sale', // Операция продажи
          quantity: 5,
          amount: 100,
          price: 20,
          products: { id: 1, name: 'Молоко', code: 'MILK001' },
          locations: { id: 1, address: 'Москва, ул. Тверская, 1' },
          out_of_stock: false,
          shelf_price: 22,
          store_hours: 8,
          store_stock: 50
        }
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockOperationsData,
        error: null
      });

      const result = await createMlPayload('org123', 5, 'token');

      // Проверяем, что у операции "Продажа" нет поля "Цена"
      expect(result[1].Type).toBe('Продажа');
      expect(result[1]).not.toHaveProperty('Цена');
    });

    it('should add price field for purchase operations', async () => {
      // Mock данные с операцией поставки
      const mockOperationsData = [
        {
          id: 1,
          operation_date: '2024-01-15T10:30:00.000Z',
          operation_type: 'purchase', // Операция поставки
          quantity: 5,
          total_amount: 100,
          cost_price: 20,
          product_id: 1,
          location_id: 1
        }
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockOperationsData,
        error: null
      });

      const result = await createMlPayload('org123', 5, 'token');

      // Проверяем, что у операции "Поставка" есть поле "Цена"
      expect(result[1].Type).toBe('Поставка');
      expect(result[1]).toHaveProperty('Цена');
      expect(result[1].Цена).toBe(20); // Используем cost_price = 20
    });

    it('should handle null/undefined values correctly', async () => {
      // Mock данные с null/undefined значениями
      const mockOperationsData = [
        {
          id: 1,
          operation_date: null, // Нет даты
          operation_type: 'sale',
          quantity: null, // Нет количества
          amount: 100,
          price: null, // Нет цены
          products: null, // Нет продукта
          locations: null, // Нет локации
          out_of_stock: null,
          shelf_price: null,
          store_hours: null,
          store_stock: null
        }
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockOperationsData,
        error: null
      });

      const result = await createMlPayload('org123', 5, 'token');

      // Проверяем обработку null/undefined значений
      expect(result[1].Период).toBe(null);
      expect(result[1].Количество).toBe(0); // null quantity should become 0
      expect(result[1].Номенклатура).toBe('Product undefined'); // null product_id should become 'Product undefined'
      expect(result[1].Код).toBe('CODE-undefined');
      expect(result[1].Адрес_точки).toBe('Location undefined');
    });

    it('should include DaysCount in the first element', async () => {
      const mockOperationsData = [];

      mockSupabase.order.mockResolvedValue({
        data: mockOperationsData,
        error: null
      });

      const result = await createMlPayload('org123', 7, 'token');

      // Проверяем, что первый элемент содержит DaysCount
      expect(result[0]).toEqual({ DaysCount: 7 });
    });

    it('should throw error when database query fails', async () => {
      // Mock ошибки базы данных
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      // Проверяем, что функция выбрасывает ошибку
      await expect(createMlPayload('org123', 5, 'token')).rejects.toThrow(
        'Ошибка получения исторических данных: Database connection failed'
      );
    });
  });
});
