import { Request, Response } from 'express';
import { predictSales, getForecastData, getForecastHistory } from '../forecastController';
import * as supabaseUserClient from '../../supabaseUserClient';
import * as mlPayloadFormatter from '../../services/mlPayloadFormatter';
import * as dataValidation from '../../utils/dataValidation';
import * as errorHandling from '../../utils/errorHandling';
import axios from 'axios';
import { ZodError } from 'zod';

jest.mock('axios');
jest.mock('../../supabaseUserClient');
jest.mock('../../services/mlPayloadFormatter');
jest.mock('../../utils/dataValidation');
jest.mock('../../utils/errorHandling');

describe('ForecastController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockSupabaseClient: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  // Helper function to create mock Supabase chain
  const createMockChain = () => {
    const chain = {
      select: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
      order: jest.fn(),
      limit: jest.fn(),
      range: jest.fn(),
      insert: jest.fn(),
      ilike: jest.fn()
    };
    
    // Make each method return the chain for fluent interface
    Object.keys(chain).forEach(key => {
      (chain as any)[key].mockReturnValue(chain);
    });
    
    return chain;
  };

  beforeEach(() => {
    // Setup mock request
    mockReq = {
      headers: {
        authorization: 'Bearer test-token'
      },
      body: {},
      query: {},
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        organization_id: 'test-org-id'
      }
    } as any;

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com'
            }
          },
          error: null
        })
      },
      from: jest.fn().mockImplementation(() => createMockChain())
    };

    // Mock getSupabaseUserClient
    (supabaseUserClient.getSupabaseUserClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Mock error handling utilities
    (errorHandling.ConsoleErrorMonitor as jest.Mock).mockImplementation(() => ({
      logError: jest.fn(),
      logRetry: jest.fn()
    }));

    (errorHandling.retryWithBackoff as jest.Mock).mockImplementation(async (fn) => fn());
    (errorHandling.classifyError as jest.Mock).mockImplementation((err) => ({
      type: 'UNKNOWN',
      message: err.message
    }));

    // Mock data validation
    (dataValidation.validateAndCleanMLPayload as jest.Mock).mockReturnValue({
      valid: true,
      errors: null,
      cleanedData: [{ DaysCount: 7 }]
    });

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('predictSales', () => {
    beforeEach(() => {
      mockReq.body = { DaysCount: 7 };
    });

    it('should successfully predict sales with valid input', async () => {
      // Set up auth user
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      });
      
      // Create chain for profile query
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        return createMockChain();
      });

      // Create chain for operations query
      const operationsChain = createMockChain();
      operationsChain.order.mockReturnValueOnce({
        data: [
          {
            product_id: 'prod-1',
            operation_type: 'sale',
            quantity: 10,
            operation_date: '2024-01-01',
            cost_price: 100
          }
        ],
        error: null
      });
      
      // Update from mock to return correct chain
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'operations') return operationsChain;
        return createMockChain();
      });

      // Mock ML payload formatter
      (mlPayloadFormatter.createMlPayload as jest.Mock).mockResolvedValue([
        {
          Номенклатура: 'prod-1',
          ВидНоменклатуры: 'Товар',
          Количество: 10,
          Дата: '2024-01-01',
          Type: 'Поставка',
          Цена: 100,
          DaysCount: 7
        }
      ]);

      // Mock successful ML service response
      (axios.post as jest.Mock).mockResolvedValue({
        data: [
          { MAPE: '5%', MAE: 2, DaysPredict: 7 },
          { Номенклатура: 'prod-1', Количество: 15, MAPE: '3%', MAE: 1 }
        ]
      });

      // Create chain for products query
      const productsChain = createMockChain();
      productsChain.eq.mockReturnValueOnce({
        data: [
          { id: 'prod-1', name: 'Product 1', code: 'P001' }
        ],
        error: null
      });
      
      // Update from mock
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'operations') return operationsChain;
        if (table === 'products') return productsChain;
        return createMockChain();
      });

      // Create chain for prediction run insert
      const predictionRunChain = createMockChain();
      const selectChain = {
        single: jest.fn().mockResolvedValueOnce({
          data: { id: 'prediction-run-id' },
          error: null
        })
      };
      predictionRunChain.select.mockReturnValueOnce(selectChain);

      // Create chain for predictions insert
      const predictionsChain = createMockChain();
      predictionsChain.insert.mockReturnValueOnce({
        data: null,
        error: null
      });
      
      // Final from mock setup
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'operations') return operationsChain;
        if (table === 'products') return productsChain;
        if (table === 'prediction_runs') return predictionRunChain;
        if (table === 'predictions') return predictionsChain;
        return createMockChain();
      });

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith([
        { MAPE: '5%', MAE: 2, DaysPredict: 7 },
        { Номенклатура: 'prod-1', Количество: 15, MAPE: '3%', MAE: 1 }
      ]);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockReq.user = undefined;

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should return 401 when authorization header is missing', async () => {
      mockReq.headers = {};

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Отсутствует заголовок Authorization' });
    });

    it('should return 401 when token is invalid', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid token' }
      });

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Недействительный токен',
        details: { message: 'Invalid token' }
      });
    });

    it('should return 400 when user profile not found', async () => {
      // Set up auth user
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      });
      
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Профиль не найден' }
      });
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        return createMockChain();
      });

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Не удалось получить данные профиля пользователя',
        details: 'Профиль не найден'
      });
    });

    it('should return 400 when organization ID is missing', async () => {
      // Set up auth user
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      });
      
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: null },
        error: null
      });
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        return createMockChain();
      });

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Не удалось определить организацию для текущего пользователя',
        details: 'Пользователь не привязан к организации'
      });
    });

    it('should return 400 when input validation fails', async () => {
      // Set up auth user
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      });
      
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        return createMockChain();
      });
      
      mockReq.body = { invalid: 'data' };
      
      // Import and mock forecastInputSchema to throw ZodError
      const { ZodError } = require('zod');
      const forecastSchema = require('../../schemas/forecastSchema');
      jest.spyOn(forecastSchema.forecastInputSchema, 'parse').mockImplementation(() => {
        throw new ZodError([
          {
            code: 'invalid_type',
            expected: 'number',
            received: 'undefined',
            path: ['DaysCount'],
            message: 'Required'
          }
        ]);
      });

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid input'
        })
      );
    });

    it('should return 400 when ML payload validation fails', async () => {
      // Set up auth user
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      });
      
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });
      const operationsChain = createMockChain();
      operationsChain.order.mockReturnValueOnce({
        data: [{ product_id: 'prod-1', operation_type: 'sale', quantity: 10, operation_date: '2024-01-01', cost_price: 100 }],
        error: null
      });
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'operations') return operationsChain;
        return createMockChain();
      });
      
      // Mock the input body without DaysCount to trigger validation error
      mockReq.body = {};

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      // The actual implementation returns ZodError details, not the old format
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid input',
        details: expect.arrayContaining([{
          code: 'invalid_type',
          expected: 'number',
          message: 'Required',
          path: ['DaysCount'],
          received: 'undefined'
        }])
      });
    });

    it('should handle general errors gracefully', async () => {
      // Set up auth user
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      });
      
      const profileChain = createMockChain();
      profileChain.single.mockRejectedValueOnce(new Error('Unexpected error'));
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        return createMockChain();
      });

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Ошибка прогнозирования',
        details: 'Unexpected error'
      });
    });
  });

  describe('getForecastData', () => {
    it('should return mock data when USE_MOCK_ML is true', async () => {
      process.env.USE_MOCK_ML = 'true';

      await getForecastData(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          trend: expect.any(Object),
          topProducts: expect.any(Array),
          history: expect.any(Object)
        })
      );
    });

    it('should return forecast data successfully', async () => {
      process.env.USE_MOCK_ML = 'false';
      
      // Mock profile chain
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });
      
      // Mock predictions chain
      const predictionsChain = createMockChain();
      predictionsChain.order.mockReturnThis();
      predictionsChain.limit.mockResolvedValueOnce({
        data: [
          {
            product_name: 'Product 1',
            predicted_quantity: 100,
            prediction_date: '2024-01-01',
            accuracy_metrics: { MAPE: '5%' }
          }
        ],
        error: null
      });
      
      // Mock count chain
      const countChain = createMockChain();
      countChain.select.mockReturnThis();
      countChain.eq.mockReturnThis();
      countChain.single.mockResolvedValueOnce({
        data: { count: 1 },
        error: null
      });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'predictions') {
          // Return different chains based on the call order
          return mockSupabaseClient.from.mock.calls.filter((call: any[]) => call[0] === 'predictions').length <= 1
            ? predictionsChain
            : countChain;
        }
        return createMockChain();
      });

      await getForecastData(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          trend: expect.any(Object),
          topProducts: expect.any(Array),
          history: expect.any(Object)
        })
      );
    });

    it('should return empty data when no predictions exist', async () => {
      process.env.USE_MOCK_ML = 'false';
      
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });

      const predictionsChain = createMockChain();
      predictionsChain.order.mockReturnThis();
      predictionsChain.limit.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const countChain = createMockChain();
      countChain.select.mockReturnThis();
      countChain.eq.mockReturnThis();
      countChain.single.mockResolvedValueOnce({
        data: { count: 0 },
        error: null
      });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'predictions') {
          return mockSupabaseClient.from.mock.calls.filter((call: any[]) => call[0] === 'predictions').length <= 1
            ? predictionsChain
            : countChain;
        }
        return createMockChain();
      });

      await getForecastData(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        trend: { points: [] },
        topProducts: [],
        history: { items: [], total: 0 }
      });
    });

    it('should return 401 when authorization header is missing', async () => {
      mockReq.headers = {};

      await getForecastData(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Отсутствует заголовок Authorization' });
    });

    it('should handle database errors', async () => {
      process.env.USE_MOCK_ML = 'false';
      
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });

      const predictionRunChain = createMockChain();
      predictionRunChain.order.mockReturnThis();
      predictionRunChain.limit.mockReturnThis();
      predictionRunChain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'prediction_runs') return predictionRunChain;
        return createMockChain();
      });

      await getForecastData(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Ошибка получения прогноза',
        details: { message: 'Database error' }
      });
    });
  });

  describe('getForecastHistory', () => {
    beforeEach(() => {
      mockReq.query = {
        page: '1',
        limit: '10'
      };
    });

    it('should return forecast history with pagination', async () => {
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });

      const predictionsChain = createMockChain();
      predictionsChain.range.mockReturnThis();
      predictionsChain.order.mockResolvedValueOnce({
        data: [
          {
            id: '1',
            period_start: '2024-01-01',
            period_end: '2024-01-07',
            predicted_quantity: 100,
            item_mape: 4,
            products: { name: 'Product 1', code: 'P001' }
          }
        ],
        error: null,
        count: 1
      });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'predictions') return predictionsChain;
        return createMockChain();
      });

      await getForecastHistory(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        items: expect.arrayContaining([
          expect.objectContaining({
            date: '2024-01-01 - 2024-01-07',
            product: 'Product 1',
            category: 'Общая',
            forecast: 100,
            accuracy: 'Высокая'
          })
        ]),
        total: 1
      });
    });

    it('should apply search filter', async () => {
      mockReq.query = { ...mockReq.query, search: 'test' };

      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });

      const predictionsChain = createMockChain();
      predictionsChain.ilike.mockReturnThis();
      predictionsChain.range.mockReturnThis();
      predictionsChain.order.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0
      });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'predictions') return predictionsChain;
        return createMockChain();
      });

      await getForecastHistory(mockReq as Request, mockRes as Response);

      expect(predictionsChain.ilike).toHaveBeenCalledWith('products.name', '%test%');
    });

    it('should handle pagination parameters', async () => {
      mockReq.query = {
        page: '2',
        limit: '5'
      };

      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });

      const predictionsChain = createMockChain();
      predictionsChain.range.mockReturnThis();
      predictionsChain.order.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 10
      });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'predictions') return predictionsChain;
        return createMockChain();
      });

      await getForecastHistory(mockReq as Request, mockRes as Response);

      expect(predictionsChain.range).toHaveBeenCalledWith(5, 9);
      expect(mockRes.json).toHaveBeenCalledWith({
        items: [],
        total: 10
      });
    });

    it('should return error on database failure', async () => {
      const profileChain = createMockChain();
      profileChain.single.mockResolvedValueOnce({
        data: { organization_id: 'test-org-id' },
        error: null
      });

      const predictionsChain = createMockChain();
      predictionsChain.range.mockReturnThis();
      predictionsChain.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return profileChain;
        if (table === 'predictions') return predictionsChain;
        return createMockChain();
      });

      await getForecastHistory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Ошибка получения истории прогнозов',
        details: { message: 'Database error' }
      });
    });
  });
});
