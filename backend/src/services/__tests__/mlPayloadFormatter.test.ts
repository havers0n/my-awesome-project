import { createMlPayload } from '../mlPayloadFormatter';
import { getSupabaseUserClient } from '../../supabaseUserClient';

jest.mock('../../supabaseUserClient');

describe('ML Payload Formatter Service', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Create mock chain with proper method chaining
    const createMockChain = () => {
      const chain = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn()
      };
      
      // Make each method return the chain for fluent interface
      Object.keys(chain).forEach(key => {
        (chain as any)[key].mockReturnValue(chain);
      });
      
      return chain;
    };

    mockSupabaseClient = {
      from: jest.fn().mockImplementation(() => createMockChain())
    };

    (getSupabaseUserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMlPayload', () => {
    it('should return sales data with DaysCount when provided', async () => {
      const salesData = [
        { product: 'Test Product', quantity: 10 }
      ];

      const result = await createMlPayload('org-123', 7, 'test-token', salesData);

      expect(result).toEqual([
        { DaysCount: 7 },
        { product: 'Test Product', quantity: 10 }
      ]);
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return sales data as-is when DaysCount already exists', async () => {
      const salesData = [
        { DaysCount: 14 },
        { product: 'Test Product', quantity: 10 }
      ];

      const result = await createMlPayload('org-123', 7, 'test-token', salesData);

      expect(result).toEqual(salesData);
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should fetch and format operations data when salesData not provided', async () => {
      const mockOperations = [
        {
          id: 'op-1',
          operation_date: '2024-01-15',
          operation_type: 'sale',
          quantity: 25.5,
          product_id: 'prod-1',
          location_id: 'loc-1',
          cost_price: null
        },
        {
          id: 'op-2',
          operation_date: '2024-01-16',
          operation_type: 'supply',
          quantity: 100,
          product_id: 'prod-2',
          location_id: 'loc-2',
          cost_price: 50.0
        }
      ];

      const mockProducts = [
        { id: 'prod-1', name: 'Молоко', code: 'MILK-001' },
        { id: 'prod-2', name: 'Хлеб', code: 'BREAD-001' }
      ];

      // Mock operations chain
      const operationsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: mockOperations,
          error: null
        })
      };

      // Mock products chain
      const productsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          data: mockProducts,
          error: null
        })
      };

      // Configure from to return the correct chain based on table name
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'operations') return operationsChain;
        if (table === 'products') return productsChain;
        return null;
      });

      const result = await createMlPayload('org-123', 7, 'test-token');

      expect(result).toEqual([
        { DaysCount: 7 },
        {
          Период: '2024-01-15',
          Номенклатура: 'Молоко',
          Количество: 26,
          Код: 'MILK-001',
          ВидНоменклатуры: 'Молоко',
          Type: 'Продажа',
          Адрес_точки: 'Location loc-1'
        },
        {
          Период: '2024-01-16',
          Номенклатура: 'Хлеб',
          Количество: 100,
          Код: 'BREAD-001',
          ВидНоменклатуры: 'Хлеб',
          Type: 'Поставка',
          Адрес_точки: 'Location loc-2',
          Цена: 50.0
        }
      ]);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('operations');
      expect(operationsChain.eq).toHaveBeenCalledWith('organization_id', 'org-123');
    });

    it('should handle missing product information', async () => {
      const mockOperations = [
        {
          id: 'op-1',
          operation_date: '2024-01-15',
          operation_type: 'sale',
          quantity: 10,
          product_id: 'unknown-prod',
          location_id: 'loc-1'
        }
      ];

      // Mock operations chain
      const operationsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: mockOperations,
          error: null
        })
      };

      // Mock products chain
      const productsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          data: [],
          error: null
        })
      };

      // Configure from to return the correct chain based on table name
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'operations') return operationsChain;
        if (table === 'products') return productsChain;
        return null;
      });

      const result = await createMlPayload('org-123', 7, 'test-token');

      expect(result[1]).toEqual({
        Период: '2024-01-15',
        Номенклатура: 'Product unknown-prod',
        Количество: 10,
        Код: 'CODE-unknown-prod',
        ВидНоменклатуры: 'Product unknown-prod',
        Type: 'Продажа',
        Адрес_точки: 'Location loc-1'
      });
    });

    it('should throw error when operations fetch fails', async () => {
      // Mock operations chain
      const operationsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Database error' }
        })
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'operations') return operationsChain;
        return null;
      });

      await expect(createMlPayload('org-123', 7, 'test-token'))
        .rejects
        .toThrow('Ошибка получения исторических данных: Database error');
    });

    it('should handle null operation dates', async () => {
      const mockOperations = [
        {
          id: 'op-1',
          operation_date: null,
          operation_type: 'sale',
          quantity: 10,
          product_id: 'prod-1',
          location_id: 'loc-1'
        }
      ];

      // Mock operations chain
      const operationsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: mockOperations,
          error: null
        })
      };

      // Mock products chain
      const productsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          data: [],
          error: null
        })
      };

      // Configure from to return the correct chain based on table name
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'operations') return operationsChain;
        if (table === 'products') return productsChain;
        return null;
      });

      const result = await createMlPayload('org-123', 7, 'test-token');

      expect(result[1].Период).toBeNull();
    });

    it('should round quantities to integers', async () => {
      const mockOperations = [
        {
          id: 'op-1',
          operation_date: '2024-01-15',
          operation_type: 'sale',
          quantity: 10.7,
          product_id: 'prod-1',
          location_id: 'loc-1'
        }
      ];

      // Mock operations chain
      const operationsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: mockOperations,
          error: null
        })
      };

      // Mock products chain
      const productsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          data: [],
          error: null
        })
      };

      // Configure from to return the correct chain based on table name
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'operations') return operationsChain;
        if (table === 'products') return productsChain;
        return null;
      });

      const result = await createMlPayload('org-123', 7, 'test-token');

      expect(result[1].Количество).toBe(11);
    });

    it('should handle null quantities as zero', async () => {
      const mockOperations = [
        {
          id: 'op-1',
          operation_date: '2024-01-15',
          operation_type: 'sale',
          quantity: null,
          product_id: 'prod-1',
          location_id: 'loc-1'
        }
      ];

      // Mock operations chain
      const operationsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: mockOperations,
          error: null
        })
      };

      // Mock products chain
      const productsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          data: [],
          error: null
        })
      };

      // Configure from to return the correct chain based on table name
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'operations') return operationsChain;
        if (table === 'products') return productsChain;
        return null;
      });

      const result = await createMlPayload('org-123', 7, 'test-token');

      expect(result[1].Количество).toBe(0);
    });
  });
});
